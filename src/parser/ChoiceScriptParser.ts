/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { TokenType, Scanner, IToken, ITokenCS } from './ChoiceScriptScanner';
import * as nodes from './ChoiceScriptNodes';
import { ParseError, CSIssueType } from './ChoiceScriptErrors';
import { TextDocument } from '../cssLanguageTypes';
import { isDefined } from '../utils/objects';
import { standardCommandList, flowCommandList, fullCommandList, allCommands } from '../data/commands';
import { DocumentUri, integer } from 'vscode-languageserver-types';
import { EOL } from 'os';
import { Nodelist } from './cssNodes';

export interface IMark {
	prev?: IToken;
	curr: IToken;
	offset: number;
}

/// <summary>
/// A parser for the css core specification. See for reference:
/// https://www.w3.org/TR/CSS21/grammar.html
/// http://www.w3.org/TR/CSS21/syndata.html#tokenization
/// </summary>
export class ChoiceScriptParser {

	//public scanner: Scanner;
	public scanner: Scanner;
	public token: IToken;
	public prevToken?: IToken;

	//
	public indentType: nodes.IndentType | undefined; // undefined === auto-detect
	public indentUnitSize: number = 2;
	public indentLevel: number = 0;
	public lineNum: number = 1;

	//
	public implicitControlFlow = true;

	private lastErrorToken?: IToken;

	constructor(indentUnit: string = "auto", indentUnitSize: number = 2, scnr: Scanner = new Scanner() /* TODO: proper type/enum */) {
		switch(indentUnit) {
			case "auto":
				this.indentType = undefined;
				break;
			case "tabs":
				this.indentType = nodes.IndentType.Tab;
				break;
			case "spaces":
				this.indentType = nodes.IndentType.Spaces;
				break;
		}
		this.indentUnitSize = indentUnitSize;
		this.scanner = scnr;
		this.token = { type: TokenType.EOF, offset: -1, len: 0, text: '' };
		this.prevToken = undefined!;
	}

	public peekIdent(text: string): boolean {
		return TokenType.Ident === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
	}

	public peekKeyword(text: string): boolean {
		return TokenType.AtKeyword === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
	}

	public peekDelim(text: string): boolean {
		return TokenType.Delim === this.token.type && text === this.token.text;
	}

	public peek(type: TokenType): boolean {
		return type === this.token.type;
	}

	public peekRegExp(type: TokenType, regEx: RegExp): boolean {
		if (type !== this.token.type) {
			return false;
		}
		return regEx.test(this.token.text);
	}

	public hasWhitespace(): boolean {
		return !!this.prevToken && (this.prevToken.offset + this.prevToken.len !== this.token.offset);
	}

	public consumeToken(): void {
		this.prevToken = this.token;
		this.token = this.scanner.scan();
	}

	public mark(): IMark {
		return {
			prev: this.prevToken,
			curr: this.token,
			offset: this.scanner.pos()
		};
	}

	public restoreAtMark(mark: IMark): void {
		this.prevToken = mark.prev;
		this.token = mark.curr;
		this.scanner.goBackTo(mark.offset);
	}

	public try(func: () => nodes.Node | null): nodes.Node | null {
		const pos = this.mark();
		const node = func();
		if (!node) {
			this.restoreAtMark(pos);
			return null;
		}
		return node;
	}

	public acceptOneKeyword(keywords: string[]): boolean {
		let mark = this.mark();
		if (!this.accept(TokenType.Asterisk)) {
			return false;
		}
		if (TokenType.Ident === this.token.type) {
			for (let keyword of keywords) {
				if (keyword.length === this.token.text.length && keyword === this.token.text.toLowerCase()) {
					this.consumeToken();
					return true;
				}
			}
		}
		this.restoreAtMark(mark);
		return false;
	}

	public accept(type: TokenType) {
		if (type === this.token.type) {
			this.consumeToken();
			return true;
		}
		return false;
	}

	public acceptIdent(text: string): boolean {
		if (this.peekIdent(text)) {
			this.consumeToken();
			return true;
		}
		return false;
	}

	public acceptKeyword(text: string) {
		if (this.peekKeyword(text)) {
			this.consumeToken();
			return true;
		}
		return false;
	}

	public acceptFromRawTextList(keywords: string[]) {
		for (let keyword of keywords) {
			if (keyword.length === this.token.text.length && keyword === this.token.text.toLowerCase()) {
				this.consumeToken();
				return true;
			}
		}
		return false;
	}

	public acceptDelim(text: string) {
		if (this.peekDelim(text)) {
			this.consumeToken();
			return true;
		}
		return false;
	}

	public acceptRegexp(regEx: RegExp): boolean {
		if (regEx.test(this.token.text)) {
			this.consumeToken();
			return true;
		}
		return false;
	}

	public _parseRegexp(regEx: RegExp): nodes.Node {
		let node = this.createNode(nodes.NodeType.Identifier);
		do { } while (this.acceptRegexp(regEx));
		return this.finish(node);
	}

	public resync(resyncTokens: TokenType[] | undefined, resyncStopTokens: TokenType[] | undefined): boolean {
		while (true) {
			if (resyncTokens && resyncTokens.indexOf(this.token.type) !== -1) {
				this.consumeToken();
				return true;
			} else if (resyncStopTokens && resyncStopTokens.indexOf(this.token.type) !== -1) {
				return true;
			} else {
				if (this.token.type === TokenType.EOF) {
					return false;
				}
				this.token = this.scanner.scan();
			}
		}
	}

	public createNode(nodeType: nodes.NodeType): nodes.Node {
		return new nodes.Node(this.token.offset, this.token.len, nodeType);
	}

	public create<T>(ctor: nodes.NodeConstructor<T>): T {
		return new ctor(this.token.offset, this.token.len);
	}

	public finish<T extends nodes.Node>(node: T, error?: CSIssueType, resyncTokens?: TokenType[], resyncStopTokens?: TokenType[]): T {
		// parseNumeric misuses error for boolean flagging (however the real error mustn't be a false)
		// + nodelist offsets mustn't be modified, because there is a offset hack in rulesets for smartselection
		if (!(node instanceof nodes.Nodelist)) {
			if (error) {
				this.markError(node, error, resyncTokens, resyncStopTokens);
			}
			// set the node end position
			if (this.prevToken) {
				// length with more elements belonging together
				const prevEnd = this.prevToken.offset + this.prevToken.len;
				node.length = prevEnd > node.offset ? prevEnd - node.offset : 0; // offset is taken from current token, end from previous: Use 0 for empty nodes
			}

		}
		return node;
	}

	public markError<T extends nodes.Node>(node: T, error: CSIssueType, resyncTokens?: TokenType[], resyncStopTokens?: TokenType[]): void {
		if (this.token !== this.lastErrorToken) { // do not report twice on the same token
			node.addIssue(new nodes.Marker(node, error, nodes.Level.Error, undefined, this.token.offset, this.token.len));
			this.lastErrorToken = this.token;
		}
		if (resyncTokens || resyncStopTokens) {
			this.resync(resyncTokens, resyncStopTokens);
		}
	}

	public parseScene(textDocument: TextDocument): nodes.Scene {
		const versionId = textDocument.version;
		const text = textDocument.getText();
		const textProvider = (offset: number, length: number) => {
			if (textDocument.version !== versionId) {
				throw new Error('Underlying model has changed, AST is no longer valid');
			}
			return text.substr(offset, length);
		};

		return this.internalParse(text, this._parseScene.bind(this, textDocument), textProvider);
	}

	public internalParse<T extends nodes.Node, U extends T | null>(input: string, parseFunc: () => U, textProvider?: nodes.ITextProvider): U;
	public internalParse<T extends nodes.Node, U extends T>(input: string, parseFunc: () => U, textProvider?: nodes.ITextProvider): U {
		this.scanner.setSource(input);
		this.token = this.scanner.scan();
		const node: U = parseFunc.bind(this)();
		if (node) {
			if (textProvider) {
				node.textProvider = textProvider;
			} else {
				node.textProvider = (offset: number, length: number) => { return input.substr(offset, length); };
			}
		}
		return node;
	}

	public _parseScene(textDocument: TextDocument): nodes.Scene {
		const scene = <nodes.Scene>this.create(nodes.Scene);
		if (textDocument && textDocument.uri) {
			scene.setUri(textDocument.uri);
		}
		do {
			let indentLevel = this.indentLevel;
			let line = this._parseLine();
			if (!scene.addChild(line)) {
				throw new Error("ParseError: Ran out of valid lines before EOF");
			}
			if (line.getLineType() !== nodes.LineType.Comment) {
				if (line.indent > indentLevel) {
					// console.log("INDENT: " + line.indent + ", " + indentLevel);
					// this.markError(line.getIndentNode()!, ParseError.IndentationError);
				} else if (line.indent < indentLevel) {
					this.indentLevel = line.indent;
				}
			}
		} while (!this.accept(TokenType.EOF));
		return this.finish(scene);
	}

	public _parseLine(): nodes.Line {
		let token = this.token;
		let line = this.create(nodes.Line);
		line.addIndent(this._parseIndentation());

		let lineRet = (this._populateChoiceOptionLine(line)||
					this._populateChoiceScriptLine(line) ||
					this._populateTextLine(line));
		if (!lineRet) {
			// empty line
			line.setLineType(nodes.LineType.Text);
		}

		line.setLineNum(this.lineNum++);


		if (!this.accept(TokenType.EOL)) {
			//throw new Error("ParseError: Expected EOL!");
		}

		return this.finish(line);
	}

	public _parseVariableReplacement(): nodes.Node {
		let node: nodes.Node = this.create(nodes.VariableReplacement);
		if (!this.acceptDelim('@') && !this.accept(TokenType.Dollar)) {
			return null!;
		}
		
		// capitalization
		let formatMode = 2;
		while (this.acceptDelim('!')) {
			formatMode--;
		}

		if (formatMode < 0) {
			return null!; // ChoiceScript ignores var replacements with more than 2 !'s: $!!!{ignored}
		}

		if ((this.prevToken!.type === TokenType.Delim) && 
				(this.prevToken!.text === '@')) {
			node.addChild(this._parseMultireplaceBody()); // adding null a bad idea?
		} else if (this.prevToken!.type === TokenType.Dollar) {
			if (!this.accept(TokenType.CurlyL)) {
				return null!;
			}
			node.addChild(this._parseCSExpr(TokenType.CurlyR));
			return this.finish(node);
		}

		/*if (formatMode > 2) { // Not strictly speaking a syntax error, so may be better for the linter
			return this.finish(node, ParseError.InvalidVariableFormatOption);
		}*/

		return this.finish(node);
	}

	public _parseValueToken(token?: IToken): nodes.Node | null {
		if (this.accept(TokenType.ParenthesisL)) {
			return this._parseCSExpr(TokenType.ParenthesisR);
		} else if (this.accept(TokenType.CurlyL)) {
			return this._parseCSExpr(TokenType.CurlyR);
		} else if (this.acceptFromRawTextList(["not", "round", "timestamp", "log", "length", "auto"])) {
			this.accept(TokenType.ParenthesisL); // might want to guard this
			return this._parseCSExpr(TokenType.ParenthesisR);
		} else {
			// we don't know when our stack 'ends' ...?
			let term: nodes.Node = (this._parseBoolean() ||
			this._parseIdent() ||
			this._parseStringLiteral() ||
			this._parseNumericalLiteral() ||
			this._parseBoolean());
			if (!term) {
				return null;
			}
			return this.finish(term); // singleton
		}
	}

	public _mapMissingParenToParseError(parenTokenType: TokenType) {
		switch(parenTokenType) {
			case TokenType.ParenthesisL:
				return ParseError.LeftParenthesisExpected;
			case TokenType.ParenthesisR:
				return ParseError.RightParenthesisExpected;
			case TokenType.CurlyL:
				return ParseError.LeftCurlyExpected;
			case TokenType.CurlyR:
				return ParseError.RightCurlyExpected;
			case TokenType.BracketL:
				return ParseError.LeftSquareBracketExpected;
			case TokenType.BracketR:
				return ParseError.RightSquareBracketExpected;
			default:
				throw new Error("Can't map invalid parenthesis type to missing parenthesis error!");
		}
	}



	public _parseCSExpr(parenthetical?: TokenType, stopOffset?: number): nodes.Expression {
		let node = <nodes.Expression>this.create(nodes.Expression);

		let term1 = this._parseValueToken(this.token);
	
		if (!term1) {
			return this.finish(node, ParseError.TermExpected);
		}

		node.setLeft(term1);

		if (this.peek(TokenType.EOL) || this.peek(TokenType.EOF) || ((stopOffset) && this.token.offset >= stopOffset)) {
			if (parenthetical) {
				return this.finish(node, this._mapMissingParenToParseError(parenthetical));
			}
			return this.finish(node); // singleton
		}

		if (parenthetical && this.accept(parenthetical)) {
			return this.finish(node); // singleton in brackets
		}

		// else we're onto operators
		let op = this._parseAnyCSOperator();

		if (!op) {
			return this.finish(node, ParseError.OperatorExpected);
			// expected operator error
		}

		node.setOperator(op);

		let term2 = this._parseValueToken();
		if (!term2) {
			return this.finish(node, ParseError.TermExpected);
		}

		node.setRight(term2);

		// close parenthesis
		if (parenthetical && !this.accept(parenthetical)) {
			return this.finish(node, ParseError.RightParenthesisExpected); 
		}

		if (this.peek(TokenType.EOL) || this.peek(TokenType.EOF)|| ((stopOffset) && this.token.offset >= stopOffset)) {
			// redundant?
			return this.finish(node);
		}

		// Too many brackets on the right-hand
		if (!parenthetical) {
			let error: CSIssueType;
			if (this.peek(TokenType.BracketR) ||
				this.peek(TokenType.CurlyR) ||
				this.peek(TokenType.ParenthesisR)) {
				switch(this.token.type) {
					case TokenType.BracketR:
						error = ParseError.LeftSquareBracketExpected;
						break;
					case TokenType.ParenthesisR:
						error = ParseError.LeftParenthesisExpected;
						break;
					case TokenType.CurlyR:
						error = ParseError.LeftCurlyExpected;
						break;
					default:
						error = ParseError.UnbalancedBrackets;
				}
				return this.finish(node, error);
			}
		}
		return this.finish(node);
	}

	public _parseChoiceScriptFunction(): nodes.Node {
		const node = this.create(nodes.Node);
		if (!this.acceptFromRawTextList(["not", "round", "timestamp", "log", "length", "auto"])) {
			return null!;
		}
		if (!this.peek(TokenType.ParenthesisL)) {
			return null!;
		}
		this.consumeToken(); // ParenthesisL
		node.addChild(this._parseCSExpr());
		if (!this.accept(TokenType.ParenthesisR)) {
			return this.finish(node, ParseError.RightParenthesisExpected);
		}
		return this.finish(node);
	}

	public _parseAnyCSOperator(): nodes.Operator {
		return this._parseStandardCSOperator() ||
				this._parseNamedCSOperator() ||
				this._parseBooleanCSOperator() ||
				this._parseFairMathCSOperator();
	}

	public _parseImplicitCSOperator(): nodes.Operator {
		return this._parseStandardCSOperator() ||
				this._parseNamedCSOperator() ||
				this._parseFairMathCSOperator();
	}

	public _parseNamedCSOperator(): nodes.Operator {
		const operator = this.create(nodes.Operator);
		if (!this.acceptFromRawTextList(["and", "or", "modulo"])) {
			return null!;
		}
		operator.setCSType(nodes.ChoiceScriptType.Boolean);
		return this.finish(operator);
	}

	public _parseStandardCSOperator(): nodes.Operator {
		const operator = this.create(nodes.Operator);
		if (this.accept(TokenType.Asterisk) ||
			this.acceptDelim('+') ||
			this.acceptDelim('-') ||
			this.acceptDelim('/') ||
			this.acceptDelim('%') ||
			this.acceptDelim('^')) {
				operator.setCSType(nodes.ChoiceScriptType.Number);
				return this.finish(operator);
			} else if (this.accept(TokenType.Hash) ||
						this.acceptDelim('&')) {
				operator.setCSType(nodes.ChoiceScriptType.String);
				return this.finish(operator);
			}
		return null!;
	}

	public _parseBooleanCSOperator(): nodes.Operator {
		const operator = this.create(nodes.Operator);
		switch (this.token.text) {
			case '<':
			case '>':
				this.consumeToken();
				this.acceptDelim('=');
				break;
			case '!':
				this.consumeToken();
				if (!this.acceptDelim('=')) {
					return this.finish(operator, ParseError.InvalidVariableFormatOption);
				}
				break;
			case '=':
				this.consumeToken();
				break;
			default:
				return null!;
		}
		operator.setCSType(nodes.ChoiceScriptType.Boolean);
		return this.finish(operator);
	}

	public _parseFairMathCSOperator(): nodes.Operator {
		const operator = this.create(nodes.Operator);
		if (!this.accept(TokenType.FairMathAdd) &&
			!this.accept(TokenType.FairMathSub)) {
			return null!;
		}
		operator.setCSType(nodes.ChoiceScriptType.Number);
		return this.finish(operator);
	}

	public _parseMultireplaceBody(): nodes.Node {
		//@{mybool opt1|opt2}, @{mynum ${opt1}|opt2|opt3}
		const mark = this.mark();
		const multireplace = this.create(nodes.MultiReplace);

		// absolutely horrible hack to (oft inaccurately) detect multireplace's space
		// currently necessary due to the fact that the scanner ignores whitespace
		let spaceOffset = this.scanner.stream.pos();
		let ch = null;
		while (true) {
			ch = this.scanner.stream.peekChar();
			if (ch === ' '.charCodeAt(0)) {
				break;
			} else if (this.scanner.stream.eos()) {
				return this.finish(multireplace, ParseError.NotEnoughMultiReplaceOptions);
			}
			this.scanner.stream.advance(1);
			spaceOffset = this.scanner.stream.pos();
		}
		this.restoreAtMark(mark);

		if (!this.accept(TokenType.CurlyL)) {
			return null!;
		}

		// only consider tokens up to the space as part of the expression
		let expr = this._parseCSExpr(undefined, spaceOffset);
		if (!expr) {
			return this.finish(multireplace, ParseError.ExpressionExpected);
		}

		multireplace.setExpression(expr);

		/*if (!this.acceptDelim(' ')) {
			Scanner is currently ignoring whitespace
			"; there should be a space after the first word/expr"
		}*/

		while(!this.accept(TokenType.CurlyR) && !this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) {
			let variant = this.create(nodes.MultiReplaceOption);
			while (!this.acceptDelim('|')) {
				if (variant.addChild(this._parseWord() || this._parseVariableReplacement())) {
					// add any text nodes to the node tree
				} else if (this.peek(TokenType.CurlyR)) {
					// that was the last option
					break;
				} else if (!this.peekDelim('|') && !this.accept(TokenType.CurlyR) &&
							!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF) ) {
					this.consumeToken(); // FIXME: Generally ignore but parse stray delimiters, or punctuation.
				} else {
					// probably shouldn't ever reach here; something's gone wrong if we do
					// but we should catch that below
					break;
				}
			}
			multireplace.addVariant(this.finish(variant));
		}

		if (multireplace.getOptions() && multireplace.getOptions()!.length < 2) {
			return this.finish(multireplace, ParseError.NotEnoughMultiReplaceOptions);
		}

		return this.finish(multireplace);
	}

	public _parseFormatTags() {
		// [b][/b], [i][/i]
	}

	public _parseWord(): nodes.RealWord {
		// FIXME: Differentiate words and identifiers
		if (this.peek(TokenType.Word) || this.peek(TokenType.Ident) || this.peek(TokenType.Char)) {
			let word = this.createNode(nodes.NodeType.RealWord);
			this.consumeToken();
			return this.finish(word);
		}
		return null!;
	}

	// this is precarious if run before other line types
	// as it blindly consumes Asterisks and Idents etc.
	public _addTextToNode(node: nodes.Node): boolean {
		let added: boolean = false;
		while (true) {
			if (node.addChild(this._parseVariableReplacement() || this._parseWord())) {
				added = true;
				continue;
			} else if (!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) {
				// TODO: Consider being more specific with node types here?
				added = true;
				let child = this.create(nodes.Node);
				this.consumeToken();
				this.finish(child);
				node.addChild(child);
			} else {
				break;
			}
		}
		return added;
	}

	public _populateTextLine(line: nodes.Line): nodes.Line | null {
		if (this._addTextToNode(line)) {
			line.setLineType(nodes.LineType.Text);
			return line;
		}
		return null;
	}

	public _populateChoiceOptionLine(line: nodes.Line): nodes.Line | null {
		if (line.addChild(this._parseChoiceOptionLine())) {
			line.setLineType(nodes.LineType.ChoiceOption);
			return line;
		}
		return null;
	}

	public _populateChoiceScriptLine(line: nodes.Line): nodes.Node | null {
		if (line.addChild(this._parseChoiceScriptStatement())) {
			line.setLineType(nodes.LineType.ChoiceScript);
			return line;
		}
		return null;
	}

	public _parseChoiceScriptStatement(): nodes.Node | null {
		// first let's save ourselves a lot of effort:
		// if there's no asterisk, then it's definitely not a command
		if (!this.peek(TokenType.Asterisk)) {
			return null;
		}
		return this._parseChoiceScriptComment()
		|| this._parseSceneList()
		|| this._parseVariableDeclaration()
		|| this._parseLabelDeclaration()
		|| this._parseSetCommand()
		|| this._parseChoiceCommand() // _parseChoiceBlock
		|| this._parseFlowCommand()
		|| this._parseIfBlock()
		|| this._parseStandardCommand()
		|| this._parseInvalidCommand();
	}

	public _parseChoiceScriptComment(): nodes.Node {
		if (!this.peek(TokenType.SingleLineComment)) {
			return null!;
		}
		var comment = this.create(nodes.ChoiceScriptComment);
		while (!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) {
			this.consumeToken();
		}
		return this.finish(comment);
	}

	public _parseLabelDeclaration(): nodes.LabelDeclaration {
		const declaration = <nodes.LabelDeclaration>this.create(nodes.LabelDeclaration);

		let command = this.create(nodes.FlowCommand);
		if (!this.acceptOneKeyword(["label"])) {
			return null!;
		}
		declaration.addChild(this.finish(command));

		if (!declaration.setLabel(this._parseTIdent(nodes.Label))) {
			return <nodes.LabelDeclaration>this.finish(declaration, ParseError.LabelNameExpected);
		}

		return <nodes.LabelDeclaration>this.finish(declaration);
	}

	public _parseVariableDeclaration(): nodes.VariableDeclaration {
		const declaration = <nodes.VariableDeclaration>this.create(nodes.VariableDeclaration);

		const command = this.create(nodes.StandardCommand);
		if (!this.acceptOneKeyword(["create", "temp"])) {
			return null!;
		}
		let commandToken = this.prevToken;

		declaration.addChild(this.finish(command));

		if (!declaration.setVariable(this._parseTIdent(nodes.Variable))) {
			return <nodes.VariableDeclaration>this.finish(declaration, ParseError.VariableNameExpected);
		}

		// *create commands must be initialized
		if (this.peek(TokenType.EOL) || this.peek(TokenType.EOF)) {
			return <nodes.VariableDeclaration>this.finish(declaration, (commandToken!.text === "create") ? ParseError.VariableValueExpected : undefined);
		}
		declaration.setExpr(this._parseCSExpr());

		return <nodes.VariableDeclaration>this.finish(declaration);
	}

	// Description from scene.js:
	// turn a var token into its name, remove it from the stack
	// or if it's a curly parenthesis, evaluate that
	// or if it's an array expression, convert it into its raw underscore name
	public _parseVariableReference(parenthetical?: TokenType): nodes.Variable {
		const node = <nodes.Variable>this.create(nodes.Variable);

		if (this.accept(TokenType.CurlyL)) {
			return this._parseVariableReference(TokenType.CurlyR);
		} else if (this.accept(TokenType.BracketL)) {
			return this._parseVariableReference(TokenType.BracketR);
		}

		if (!this._parseIdent() && !this._parseNumericalLiteral()) {
			// parseNumericalLiteral allows purely numerical labels
			return null!;
		}

		if (parenthetical && !this.accept(parenthetical)) {
			return this.finish(node, ParseError.RightCurlyExpected);
		}

		return <nodes.Variable>this.finish(node);
	}

	public _parseSceneList(): nodes.Node | null {
		const node = this.create(nodes.Node);
		if (!this.acceptOneKeyword(["scene_list"])) {
			return null!;
		}
		if (!this.accept(TokenType.EOL)) {
			return this.finish(node, ParseError.EmptySceneList);
		}
		let prevIndent = this.indentLevel;
		let sceneLine = this._parseLine();
		let newIndent = sceneLine.getIndentNode()?.indentDepth || 0;
		if (newIndent <= prevIndent) {
			return this.finish(node, ParseError.EmptySceneList);
		}
		let currentIndent = newIndent;
		while (currentIndent === newIndent) {
			node.addChild(sceneLine);
			let line = this._parseLine();
			currentIndent = line.getIndentNode()?.indentDepth!;
		}
		if (currentIndent > newIndent) {
			return this.finish(node, ParseError.IndentationError);
		}
		return this.finish(node);
	}

	// FIXME: Labels only have to pass !labelName.test(/\s/)
	public _parseLabel(): nodes.Label | null {
		return this._parseTIdent(nodes.Label);
	}

	// FIXME: Variables MUST start with a letter: .test(/^[A-Za-z]+) -- Should we do this in PARSE or LINT?
	// AND otherwise only contain "word" characters: e.g. test(/^\w+$/)
	public _parseVariable(): nodes.Variable | null {
		return this._parseTIdent(nodes.Variable);
	}

	public _parseTIdent<T>(type: nodes.NodeConstructor<T>): T | null {
		const node = <T>this.create(type);
		if (!this.accept(TokenType.Ident)) {
			return null!;
		}
		return <T>node; // feel like this should be this.finish, but LESS example says otherwise;
	}

	/*public _parseTRef<T>(type: nodes.NodeConstructor<T>): T | null {
		const ref = <T>this.create(type);
		if (!ref.addChild(<nodes.Scene>this._parseTIdent(nodes.Scene) || this._parseStringExpression())) {
			return null;
		}
		return <T>this.finish(sceneRef);
	}*/

	public _parseLabelRef(): nodes.LabelRef | null {
		const labelRef = this.create(nodes.LabelRef);
		if (!labelRef.addChild(this._parseTIdent(nodes.Label) || this._parseStringExpression())) {
			return null;
		}
		return this.finish(labelRef);
	}

	public _parseSceneRef(): nodes.SceneRef | null {
		const sceneRef = this.create(nodes.SceneRef);
		if (!sceneRef.addChild(this._parseTIdent(nodes.Scene) || this._parseStringExpression())) {
			return null;
		}
		return this.finish(sceneRef);
	}

	public _parseGoCommandBody(flowCommand: nodes.Node, name: string | undefined) : void {
		// goto, gosub, goto_scene, gosub_scene. Excludes: goto_random_scene.
		// format1: go{type} (LabelName|stringExpr)
		// format2: go{type}_scene (SceneName|StringExpr) (LabelName|StringExpr)?
		if (!name) {
			return; // TODO error?
		}
		if (["goto", "gosub"].includes(name)) {
			if (!flowCommand.addChild(this._parseLabelRef())) {
				this.markError(flowCommand, ParseError.ExpectedLabel);
			}
		} else if (["goto_scene", "gosub_scene"].includes(name)) {
			let sceneRef = this._parseSceneRef();
			if (!flowCommand.addChild(sceneRef)) {
				this.markError(flowCommand, ParseError.ExpectedScene);
				return;
			}
			// scene label is optional
			let labelRef = this._parseLabelRef();
			if (flowCommand.addChild(labelRef)) {
				labelRef.setSceneRef(sceneRef);
			}
		}
	}

	public _parseFlowCommand(): nodes.FlowCommand {
		const node = this.create(nodes.FlowCommand);
		if (!this.acceptOneKeyword(flowCommandList.map(function(cmd) { return cmd; }))) {
			return null!;
		}
		this._parseGoCommandBody(node, this.prevToken?.text);
		return this.finish(node);
	}

	public _parseIfElsifOrElseCommand(command: string = "if"): nodes.Node | null {
		const node = this.create(nodes.Command);
		if (!this.acceptOneKeyword([command])) {
			return null!;
		}
		switch(command) {
			case "if":
			case "elsif":
			case "elseif":
				if (!node.addChild(this._parseCSExpr())) {
					return this.finish(node, ParseError.ExpressionExpected);
				}
				break;	
			case "else":
				break;
			default:
				return this.finish(node, ParseError.GenericSyntaxError);
		}
		return this.finish(node);
	}

	public _parseIfBlock(): nodes.Node | null {

		let localIndent = this.indentLevel;

		const ifblock = this.create(nodes.CodeBlock);
	
		// *if

		let ifNode;
		if (!(ifNode = this._parseIfElsifOrElseCommand())) {
			return null!;
		}
		ifblock.addChild(ifNode);
		if (!this.accept(TokenType.EOL)) {
			return this.finish(ifblock, ParseError.IndentBlockExpected);
		}
		ifNode.addChild(this._parseBlock());

		let loneIf = this.mark();

		// *elsif?

		let parser = this;
		function parseEE(name: string) {
			let mark = parser.mark();
			let nextLine = parser.create(nodes.Line);
			nextLine.addIndent(parser._parseIndentation());
			let command = parser._parseIfElsifOrElseCommand(name);
			if (command && !parser.accept(TokenType.EOL)) {
				parser.markError(command, ParseError.IndentBlockExpected);
			}
			nextLine.addChild(command);
			return command ? parser.finish(nextLine) : parser.restoreAtMark(mark);
		}

		let elsifNode;
		while ((elsifNode = parseEE("elsif")) || (elsifNode = parseEE("elseif"))) {
			ifblock.addChild(elsifNode);
			if (!elsifNode.addChild(this._parseBlock())) {
				this.markError(elsifNode, ParseError.IndentBlockExpected);
			}
		}
	
		// *else
		let elseNode;
		if (elseNode = parseEE("else")) {
			ifblock.addChild(elseNode);
			if (!elseNode.addChild(this._parseBlock())) {
				this.markError(elseNode, ParseError.IndentBlockExpected);
			}
		}

		return this.finish(ifblock);
	}

	// A 'block' of code/text under an if or choice
	public _parseBlock(): nodes.CodeBlock | null {
		let cb = this.create(nodes.CodeBlock);
		let localIndent = ++this.indentLevel;
		let mark, line;
		while(true) {
			mark = this.mark();
			line = this._parseLine();
			//console.log(line.indent, localIndent, this.scanner.substring(line.offset, line.length));
			if (line.indent < localIndent) {
				this.restoreAtMark(mark);
				break;
			} else if (line.indent > localIndent) {
				this.markError(line, ParseError.IndentationError);
				break;
			}/* else if (this.peek(TokenType.EOF)) {
				cb.addChild(line);
				break;
			}*/
			//console.log(line.indent, line.getText());
			cb.addChild(line);
		}
		this.indentLevel--;
		if (cb.getChildren().length < 1) {
			this.restoreAtMark(mark);
			return null;
		}
		return cb;
	}

	public _parseReuseCommand(): nodes.Node {
		const node = this.create(nodes.Node);
		if (!this.acceptOneKeyword(["allow_reuse", "hide_reuse"])) {
			return null!;
		} else {
			while (!this.peek(TokenType.Hash) && !this.peek(TokenType.EOF)) {
				this.consumeToken();
			}
			return this.finish(node);
		}
	}

	// FIXME: doesn't handle non-inline ifs
	public _parseChoiceOptionLine(): nodes.ChoiceOption | null {
		// FIXME actually build IF/Option node structure properly.
		let mark = this.mark();

		let line = this.create(nodes.Line);
		line.setLineType(nodes.LineType.ChoiceOption);
		let indent = this._parseIndentation(true /* checkIndentLevel */);

		if (!line.addChild(indent)) {
			return null!;
		}
		let indentMark = this.mark();
		/*if (indent.indentDepth !== this.expectedIndentLevel) {
			return this.finish(line, ParseError.IndentationError); // Invalid Indentation
		}*/
		
		//this.indentLevel = indent.indentDepth;

		/* 		// Handle inline with ChoiceOptions (#):
		let mark = this.mark();
		let exprStopOffset = undefined;
		while(!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) {
			if (this.peek(TokenType.Hash) || this.peekDelim('#')) {
				exprStopOffset = this.token.offset;
				break;
			}
			this.consumeToken();
		}
		this.restoreAtMark(mark);*/

		line.addChild(this._parseReuseCommand()); // optional
		//line.addChild(this._parseIfCommand(true /* inline */)); // inline / optional

		if (!this.accept(TokenType.Hash)) {
			this.restoreAtMark(indentMark);
			if (!line.addChild(this._parseIfBlock( /* true, choiceOption */))) {
				this.restoreAtMark(mark);
				return null;
			} else {
				this.accept(TokenType.EOL);
				this.indentLevel++;
				return this.finish(line);
			}
		}

		let text = this.create(nodes.Node);

		if (!this._addTextToNode(text)) {
			return this.finish(line, ParseError.NoChoiceOption);
		}
		line.addChild(text);
		this.accept(TokenType.EOL);
		this.indentLevel++;
		//while(line.addChild(this._parseLine())) {}
		return this.finish(line);
	}

	public _parseChoiceOptionText(): nodes.ChoiceOption {
		let option = this.create(nodes.ChoiceOption);

		while (true) {
			if (option.addChild(this._parseWord() ||
					this._parseVariableReplacement())) {
						continue;
			}
			else if (!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) {
				this.consumeToken();
			} else {
				break;
			}
		}

		if (!option.hasChildren()) {
			return this.finish(option, ParseError.ExpectedChoiceOption);
		}

		return this.finish(option);
	}

	/*public _parseChoiceOptions(): nodes.Line[] | null {
		let node = this.create(nodes.Node); // "Option Wrapper"
		let currentIndent = this.indentLevel;
		let options: nodes.Line[] = [];
		let opt;
		while (opt = this._parseChoiceOptionLine()) {
			options.push(opt);
		}
		for (let opt of options) {
			let indent = opt?.getIndentNode()?.indentDepth;
			if (indent! <= currentIndent) {

			}
		}
		let firstOptionLine = this._parseChoiceOptionLine();
		let newIndent = firstOptionLine?.getIndentNode()?.indentDepth;

		if (newIndent! <= currentIndent) {
			this.markError(firstOptionLine!, ParseError.IndentationError);
		}
		this.indentLevel = currentIndent;
		return null;
	}*/

	public _parseChoiceCommand(): nodes.ChoiceCommand | null {
		const node = this.create(nodes.ChoiceCommand);
		let isFake = false;
		if (this.acceptOneKeyword(["fake_choice"])) {
			isFake = true;
		}
		if (isFake || this.acceptOneKeyword(["choice"])) {
			while (!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) { this.consumeToken(); }
			this.accept(TokenType.EOL);
			
			while(node.addChild(this._parseChoiceOptionLine())) {}
			if (node.hasChildren()) {
				return this.finish(node);
			} else {
				return this.finish(node, ParseError.NoChoiceOption);
			}
			// TODO? complicated to support nested choices
			//let options = this._parseChoiceOptions();
			/*
			while (!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) { this.consumeToken(); }
			this.accept(TokenType.EOL);
			let prevIndent = this.indentLevel;
			while(node.addChild(this._parseChoiceOptionLine())) {}
			if (node.hasChildren()) {
				return this.finish(node);
			} else {
				return this.finish(node, ParseError.NoChoiceOption);
			}*/
		}
		return null;
	}

	public _parseChoiceBlock(): nodes.Node | null {
		return null;
	}

	public _parseSetCommand(): nodes.SetCommand {
		const command = <nodes.SetCommand>this.create(nodes.SetCommand);
		if (!this.acceptOneKeyword(["set"])) { // FIXME: not sure a function for every command is scalable
			return null!;
		}
		
		// this is VERY similar to create/temp commands (VariableDeclaration) can they share the logic? FIXME

		let implictMark = this.mark();

		if (!command.setVariable(this._parseVariableReference())) {
			return <nodes.SetCommand>this.finish(command, ParseError.VariableNameExpected);
		}

		if (this._parseImplicitCSOperator()) {	// for e.g. myvar +5
			this.restoreAtMark(implictMark);	// parseCSExpr needs to reparse the var
		}

		let expr = this._parseCSExpr();
		if (!expr || expr.length === 0) {
			return <nodes.SetCommand>this.finish(command,  ParseError.VariableValueExpected);
		}
		command.setValue(expr);
		return <nodes.SetCommand>this.finish(command);
	}

	public _parseStandardCommand(): nodes.StandardCommand {
		const node = this.create(nodes.StandardCommand);
		if (this.acceptOneKeyword(standardCommandList.map(function(cmd) { return cmd; }))) {
			return this.finish(node);
		}
		return null!;
	}

	public _parseInvalidCommand(): nodes.Command {
		const node = this.create(nodes.Command);
		let mark = this.mark();
		if (!this.accept(TokenType.Asterisk)) {
			return null!; // not a command
		}
		if (!/^\w+/.test(this.token.text)) {
			// Non-word characters following an asterisk,
			// like *** or *-, make for legal TextLines
			this.restoreAtMark(mark);
			return null!;
		}
		this.markError(node, ParseError.UnknownCommand);
		this.consumeToken(); // assume the next token is the attempted command
		return this.finish(node);
	}

	public _parseNumericalOperator(): nodes.Operator {
		if (this.peek(TokenType.Asterisk) ||
			this.peekDelim('+') ||
			this.peekDelim('-') ||
			this.peekDelim('/') ||
			this.peek(TokenType.FairMathAdd) ||
			this.peek(TokenType.FairMathSub)) { // doesn't stick to the standard here
			let node = this.create(nodes.Operator);
			this.consumeToken();
			return this.finish(node);
		} else {
			return null!;
		}
	}

	public _parseSelectorIdent(): nodes.Node {
		return this._parseIdent()!;
	}

	public _parseHash(): nodes.Node {
		if (!this.peek(TokenType.Hash) && !this.peekDelim('#')) {
			return null!;
		}
		let node = this.createNode(nodes.NodeType.ChoiceOption);
		if (this.accept(TokenType.Hash) || this.acceptDelim('#')) {
			if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
				return this.finish(node, ParseError.IdentifierExpected);
			}
		} else {
			this.consumeToken(); // TokenType.Hash
		}
		return this.finish(node);
	}

	public _parseExpr(stopOnComma: boolean = false): nodes.Expression {

		let expr = this._parseStringExpression()
					|| this._parseNumericalExpression()
					|| this._parseFairMathExpr()
					|| this._parseBoolean()
					|| null;
		return expr;

		// FIXME support actual expressions, not simple value
	}

	public _parseFairMathExpr(): nodes.Expression | null {
		if (!this.accept(TokenType.FairMathAdd) &&
			 !this.accept(TokenType.FairMathSub)) {
			return null;
		}
		let node = this.create(nodes.Expression);
		this.consumeToken();
		while(!this.accept(TokenType.EOL) && !this.accept(TokenType.EOF)) {
			this.consumeToken();
		}
		return this.finish(node);
	}

	public _parseBoolean(): nodes.BinaryExpression {
		let node = <nodes.BinaryExpression>this.create(nodes.BinaryExpression);
		if (!this.acceptFromRawTextList(["true", "false"])) {
			return null!;
		}
		return <nodes.BinaryExpression>this.finish(node);
	}

	public _parseNumericalLiteral(): nodes.NumericValue {
		if (this.peek(TokenType.Num)) {
			let node = <nodes.NumericValue>this.create(nodes.NumericValue);
			this.consumeToken();
			return <nodes.NumericValue>this.finish(node);
		}

		return null!;
	}

	public _parseNumericalExpression(): nodes.Expression | null {
		let node = <nodes.Expression>this.create(nodes.Expression);
		if (!node.setLeft(this._parseNumericalLiteral())) {
			return null;
		}
		return <nodes.Expression>this.finish(node);		
	}

	public _parseStringExpression(): nodes.StringExpression | null {
		let node = <nodes.StringExpression>this.create(nodes.StringExpression);
		if (!node.setLeft(this._parseStringLiteral())) {
			return null;
		}
		return <nodes.StringExpression>this.finish(node);		
	}

	public _parseStringLiteral(): nodes.StringValue | null {
		const string = this.create(nodes.StringValue);
		if (!this.acceptDelim('"')) {
			return null;
		}
		while ((!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF) && !this.peekDelim('"')) ||
				(this.peekDelim('"') && (this.prevToken && this.prevToken.text === '\\'))) 
		{
			if (!string.addChild(this._parseWord() || this._parseVariableReplacement())) {
				this.consumeToken(); // treat anything else as unimportant
			}
		}
		if (!this.acceptDelim('"')) { // TODO: Missing quote error
			return this.finish(string, ParseError.NoCloseQuote); 
		}
		return this.finish(string);
	}

	/*public _parseStringLiteral(): nodes.Node | null {
		if (!this.peek(TokenType.String) && !this.peek(TokenType.BadString)) {
			return null;
		}
		const node = this.createNode(nodes.NodeType.StringLiteral);
		this.consumeToken();
		return this.finish(node);
	}*/

	public _parseIdent(referenceTypes: nodes.ReferenceType[] = [nodes.ReferenceType.Variable]): nodes.Identifier | null {
		if (!this.peek(TokenType.Ident)) {
			return null;
		}

		const node = this.create(nodes.Identifier);
		if (referenceTypes) {
			node.referenceTypes = referenceTypes;
		}
		this.consumeToken();

		// array syntax []
		while (this.accept(TokenType.BracketL)) {
			node.addChild(this._parseCSExpr(TokenType.BracketR)); // addChild? or attach error directly to prior node?
		}

		return this.finish(node);
	}

	public _parseIndentation(checkIndentLevel: boolean = false): nodes.Indentation | null {
		let indentNode = this.create(nodes.Indentation);
		if (!this.peek(TokenType.Indentation)) { // peek?
			return null;
		}
		else if (true) { // undefined
			let indentType: nodes.IndentType;
			let indentDepth: number;
			if ((this.token.text.indexOf("\t") > -1) && (this.token.text.indexOf(" ") > -1)) {
				indentNode.setIndentUnit(nodes.IndentType.Mixed);
				return this.finish(indentNode, ParseError.MixedIndentation);
			} else if (this.token.text.charCodeAt(0) === "\t".charCodeAt(0)) {
				indentType = nodes.IndentType.Tab;
				indentDepth = this.token.text.length;
			} else if (this.token.text.charCodeAt(0) === " ".charCodeAt(0)) {
				indentType = nodes.IndentType.Spaces;
				indentDepth = this.token.text.length; // TODO handle space volume
			} else {
				// scanner is broken.
				throw new Error("Parser failed to handle indentation.");
			}
			this.accept(TokenType.Indentation);
			indentNode.setIndentUnit(indentType);
			indentNode.setIndentDepth(indentDepth);
			if (!this.indentType) { // auto-detect
				this.indentType = nodes.IndentType.Spaces;
				this.indentUnitSize = indentDepth;
			} else if (this.indentType !== indentType) {
				return this.finish(indentNode, ParseError.WrongIndentationUnit);
			}
			let incorrectIndent = false;// checkIndentLevel && ((indentNode?.indentDepth / this.indentUnitSize) !== this.indentLevel);
			return this.finish(indentNode, incorrectIndent ? ParseError.IndentationError : undefined);
		} else if (true) { // spaces

		} else { // tabs

		}
		return null;
	}

	private __decreaseIndent(levels: integer) {
		this.indentLevel -= (this.indentUnitSize * levels);
	}

	private __increaseIndent(levels: integer) {
		this.indentLevel += (this.indentUnitSize * levels);
	}
}