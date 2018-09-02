/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/cssNodes';
import { Symbols, Symbol } from '../parser/cssSymbolScope';
import * as languageFacts from './languageFacts';
import * as strings from '../utils/strings';
import { TextDocument, Position, CompletionList, CompletionItem, CompletionItemKind, Range, TextEdit, InsertTextFormat } from 'vscode-languageserver-types';
import { ICompletionParticipant } from '../cssLanguageTypes';

import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();
const SnippetFormat = InsertTextFormat.Snippet;

export class CSSCompletion {

	variablePrefix: string;
	position: Position;
	offset: number;
	currentWord: string;
	textDocument: TextDocument;
	styleSheet: nodes.Stylesheet;
	symbolContext: Symbols;
	defaultReplaceRange: Range;
	nodePath: nodes.Node[];
	completionParticipants: ICompletionParticipant[] = [];

	constructor(variablePrefix: string = null) {
		this.variablePrefix = variablePrefix;
	}

	protected getSymbolContext(): Symbols {
		if (!this.symbolContext) {
			this.symbolContext = new Symbols(this.styleSheet);
		}
		return this.symbolContext;
	}

	public setCompletionParticipants(registeredCompletionParticipants: ICompletionParticipant[]) {
		this.completionParticipants = registeredCompletionParticipants || [];
	}

	public doComplete(document: TextDocument, position: Position, styleSheet: nodes.Stylesheet): CompletionList {
		this.offset = document.offsetAt(position);
		this.position = position;
		this.currentWord = getCurrentWord(document, this.offset);
		this.defaultReplaceRange = Range.create(Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
		this.textDocument = document;
		this.styleSheet = styleSheet;
		try {
			let result: CompletionList = { isIncomplete: false, items: [] };
			this.nodePath = nodes.getNodePath(this.styleSheet, this.offset);

			for (let i = this.nodePath.length - 1; i >= 0; i--) {
				let node = this.nodePath[i];
				if (node.type === nodes.NodeType.Builtin) {
					this.getCompletionsForBuiltin(result);
				   // this.getCompletionForTopLevel(result);
					// } else if (node instanceof nodes.Variable) {
					// this.getCompletionsForVariableDeclaration()
				}
				if (result.items.length > 0 || this.offset > node.offset) {
					return this.finalize(result);
				}
			}
			if (result.items.length === 0) {
				if (this.variablePrefix && this.currentWord.indexOf(this.variablePrefix) === 0) {
					this.getVariableProposals(null, result);
				}
			}
			return this.finalize(result);

		} finally {
			// don't hold on any state, clear symbolContext
			this.position = null;
			this.currentWord = null;
			this.textDocument = null;
			this.styleSheet = null;
			this.symbolContext = null;
			this.defaultReplaceRange = null;
			this.nodePath = null;
		}
	}

	private finalize(result: CompletionList): CompletionList {
		let needsSortText = result.items.some(i => !!i.sortText);
		if (needsSortText) {
			for (let i of result.items) {
				if (!i.sortText) { i.sortText = 'd'; }
			}
		}
		return result;
	}

	private findInNodePath(...types: nodes.NodeType[]) {
		for (let i = this.nodePath.length - 1; i >= 0; i--) {
			let node = this.nodePath[i];
			if (types.indexOf(node.type) !== -1) {
				return node;
			}
		}
		return null;
	}

	private valueTypes = [
		nodes.NodeType.Identifier, nodes.NodeType.Value, nodes.NodeType.StringLiteral, nodes.NodeType.URILiteral, nodes.NodeType.NumericValue,
		nodes.NodeType.HexColorValue, nodes.NodeType.VariableName, nodes.NodeType.Prio
	];


	public getCompletionsForBuiltin(result: CompletionList): CompletionList {
		let builtins = languageFacts.getBuiltins();
		for (var _i = 0, _a = builtins; _i < _a.length; _i++) {
			result.items.push({
				label: _a[_i]["name"],
				detail: "(command) builtin",
				documentation: "*choice\n\nDisplays a choice of options to the player.",
				textEdit: TextEdit.replace(this.getCompletionRange(null), _a[_i]["name"]),
				kind: CompletionItemKind.Keyword
			});
		}
		return result;
	};


	public getCSSWideKeywordProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let keywords in languageFacts.cssWideKeywords) {
			result.items.push({
				label: keywords,
				documentation: languageFacts.cssWideKeywords[keywords],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), keywords),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	public getCompletionsForInterpolation(node: nodes.Interpolation, result: CompletionList): CompletionList {
		if (this.offset >= node.offset + 2) {
			this.getVariableProposals(null, result);
		}
		return result;
	}

	public getVariableProposals(existingNode: nodes.Node, result: CompletionList): CompletionList {
		let symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
		for (let symbol of symbols) {
			let insertText = strings.startsWith(symbol.name, '--') ? `var(${symbol.name})` : symbol.name;
			const suggest: CompletionItem = {
				label: symbol.name,
				documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Variable,
				sortText: 'z'
			};

			if (symbol.node.type === nodes.NodeType.FunctionParameter) {
				const mixinNode = <nodes.MixinDeclaration>(symbol.node.getParent());
				if (mixinNode.type === nodes.NodeType.MixinDeclaration) {
					suggest.detail = localize('completion.argument', 'argument from \'{0}\'', mixinNode.getName());
				}
			}

			result.items.push(suggest);
		}
		return result;
	}

	public getVariableProposalsForCSSVarFunction(result: CompletionList): CompletionList {
		let symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
		symbols = symbols.filter((symbol): boolean => {
			return strings.startsWith(symbol.name, '--');
		});
		for (let symbol of symbols) {
			result.items.push({
				label: symbol.name,
				documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
				textEdit: TextEdit.replace(this.getCompletionRange(null), symbol.name),
				kind: CompletionItemKind.Variable
			});
		}
		return result;
	}

	public getUnitProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		let currentWord = '0';
		if (this.currentWord.length > 0) {
			let numMatch = this.currentWord.match(/^-?\d[\.\d+]*/);
			if (numMatch) {
				currentWord = numMatch[0];
				result.isIncomplete = currentWord.length === this.currentWord.length;
			}
		} else if (this.currentWord.length === 0) {
			result.isIncomplete = true;
		}
		if (existingNode && existingNode.parent && existingNode.parent.type === nodes.NodeType.Term) {
			existingNode = existingNode.getParent(); // include the unary operator
		}
		for (let restriction of entry.restrictions) {
			let units = languageFacts.units[restriction];
			if (units) {
				for (let unit of units) {
					let insertText = currentWord + unit;
					result.items.push({
						label: insertText,
						textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
						kind: CompletionItemKind.Unit
					});
				}
			}
		}
		return result;
	}

	protected getCompletionRange(existingNode: nodes.Node) {
		if (existingNode && existingNode.offset <= this.offset) {
			let end = existingNode.end !== -1 ? this.textDocument.positionAt(existingNode.end) : this.position;
			return Range.create(this.textDocument.positionAt(existingNode.offset), end);
		}
		return this.defaultReplaceRange;
	}

	protected getColorProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let color in languageFacts.colors) {
			result.items.push({
				label: color,
				documentation: languageFacts.colors[color],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
				kind: CompletionItemKind.Color
			});
		}
		for (let color in languageFacts.colorKeywords) {
			result.items.push({
				label: color,
				documentation: languageFacts.colorKeywords[color],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
				kind: CompletionItemKind.Value
			});
		}
		let colorValues = new Set();
		this.styleSheet.acceptVisitor(new ColorValueCollector(colorValues, this.offset));
		for (let color of colorValues.getEntries()) {
			result.items.push({
				label: color,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
				kind: CompletionItemKind.Color
			});
		}
		for (let p of languageFacts.colorFunctions) {
			let tabStop = 1;
			let replaceFunction = (match, p1) => '${' + tabStop++ + ':' + p1 + '}';
			let insertText = p.func.replace(/\[?\$(\w+)\]?/g, replaceFunction);
			result.items.push({
				label: p.func.substr(0, p.func.indexOf('(')),
				detail: p.func,
				documentation: p.desc,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				insertTextFormat: SnippetFormat,
				kind: CompletionItemKind.Function
			});
		}
		return result;
	}

	protected getPositionProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let position in languageFacts.positionKeywords) {
			result.items.push({
				label: position,
				documentation: languageFacts.positionKeywords[position],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), position),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getRepeatStyleProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let repeat in languageFacts.repeatStyleKeywords) {
			result.items.push({
				label: repeat,
				documentation: languageFacts.repeatStyleKeywords[repeat],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), repeat),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getLineStyleProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let lineStyle in languageFacts.lineStyleKeywords) {
			result.items.push({
				label: lineStyle,
				documentation: languageFacts.lineStyleKeywords[lineStyle],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineStyle),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getLineWidthProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let lineWidth of languageFacts.lineWidthKeywords) {
			result.items.push({
				label: lineWidth,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineWidth),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getGeometryBoxProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let box in languageFacts.geometryBoxKeywords) {
			result.items.push({
				label: box,
				documentation: languageFacts.geometryBoxKeywords[box],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getBoxProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let box in languageFacts.boxKeywords) {
			result.items.push({
				label: box,
				documentation: languageFacts.boxKeywords[box],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getImageProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let image in languageFacts.imageFunctions) {
			let insertText = moveCursorInsideParenthesis(image);
			result.items.push({
				label: image,
				documentation: languageFacts.imageFunctions[image],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Function,
				insertTextFormat: image !== insertText ? SnippetFormat : void 0
			});
		}
		return result;
	}

	protected getTimingFunctionProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let timing in languageFacts.transitionTimingFunctions) {
			let insertText = moveCursorInsideParenthesis(timing);
			result.items.push({
				label: timing,
				documentation: languageFacts.transitionTimingFunctions[timing],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Function,
				insertTextFormat: timing !== insertText ? SnippetFormat : void 0
			});
		}
		return result;
	}

	protected getBasicShapeProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		for (let shape in languageFacts.basicShapeFunctions) {
			let insertText = moveCursorInsideParenthesis(shape);
			result.items.push({
				label: shape,
				documentation: languageFacts.basicShapeFunctions[shape],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Function,
				insertTextFormat: shape !== insertText ? SnippetFormat : void 0
			});
		}
		return result;
	}

	public getCompletionsForVariableDeclaration(declaration: nodes.VariableDeclaration, result: CompletionList): CompletionList {
		if (this.offset > declaration.colonPosition) {
			this.getVariableProposals(declaration.getValue(), result);
		}
		return result;
	}

	public getCompletionsForFunctionArgument(arg: nodes.FunctionArgument, func: nodes.Function, result: CompletionList): CompletionList {
		if (func.getIdentifier().getText() === 'var') {
			if (!func.getArguments().hasChildren() || func.getArguments().getChild(0) === arg) {
				this.getVariableProposalsForCSSVarFunction(result);
			}
		}
		return result;
	}

	public getCompletionsForFunctionDeclaration(decl: nodes.FunctionDeclaration, result: CompletionList): CompletionList {
		let declarations = decl.getDeclarations();
		if (declarations && this.offset > declarations.offset && this.offset < declarations.end) {
			this.getTermProposals(null, null, result);
		}
		return result;
	}

	public getCompletionsForMixinReference(ref: nodes.MixinReference, result: CompletionList): CompletionList {
		let allMixins = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Mixin);
		for (let mixinSymbol of allMixins) {
			if (mixinSymbol.node instanceof nodes.MixinDeclaration) {
				result.items.push(this.makeTermProposal(mixinSymbol, mixinSymbol.node.getParameters(), null));
			}
		}
		return result;
	}

	public getTermProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
		let allFunctions = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Function);
		for (let functionSymbol of allFunctions) {
			if (functionSymbol.node instanceof nodes.FunctionDeclaration) {
				result.items.push(this.makeTermProposal(functionSymbol, functionSymbol.node.getParameters(), existingNode));
			}
		}
		return result;
	}

	private makeTermProposal(symbol: Symbol, parameters: nodes.Nodelist, existingNode: nodes.Node): CompletionItem {
		const decl = <nodes.FunctionDeclaration>symbol.node;
		const params = parameters.getChildren().map((c) => {
			return (c instanceof nodes.FunctionParameter) ? (<nodes.FunctionParameter>c).getName() : c.getText();
		});
		const insertText = symbol.name + '(' + params.map((p, index) => '${' + (index + 1) + ':' + p + '}').join(', ') + ')';
		return {
			label: symbol.name,
			detail: symbol.name + '(' + params.join(', ') + ')',
			textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
			insertTextFormat: SnippetFormat,
			kind: CompletionItemKind.Function,
			sortText: 'z'
		};
	}

	public getCompletionsForExtendsReference(extendsRef: nodes.ExtendsReference, existingNode: nodes.Node, result: CompletionList): CompletionList {
		return result;
	}

	public getCompletionForUriLiteralValue(uriLiteralNode: nodes.Node, result: CompletionList): CompletionList {
		let uriValue: string;
		let position: Position;
		let range: Range;
		// No children, empty value
		if (uriLiteralNode.getChildren().length === 0) {
			uriValue = '';
			position = this.position;
			const emptyURIValuePosition = this.textDocument.positionAt(uriLiteralNode.offset + 'url('.length);
			range = Range.create(emptyURIValuePosition, emptyURIValuePosition);
		} else {
			const uriValueNode = uriLiteralNode.getChild(0);
			uriValue = uriValueNode.getText();
			position = this.position;
			range = this.getCompletionRange(uriValueNode);
		}
		this.completionParticipants.forEach(participant => {
			if (participant.onCssURILiteralValue) {
				participant.onCssURILiteralValue({
					uriValue,
					position,
					range
				});
			}
		});

		return result;
	}

	public getCompletionForImportPath(importPathNode: nodes.Node, result: CompletionList): CompletionList {
		this.completionParticipants.forEach(participant => {
			if (participant.onCssImportPath) {
				participant.onCssImportPath({
					pathValue: importPathNode.getText(),
					position: this.position,
					range: this.getCompletionRange(importPathNode)
				});
			}
		});
		return result;
	}
}

class Set {
	private entries: { [key: string]: boolean } = {};
	public add(entry: string): void {
		this.entries[entry] = true;
	}
	public getEntries(): string[] {
		return Object.keys(this.entries);
	}
}

function moveCursorInsideParenthesis(text: string): string {
	return text.replace(/\(\)$/, "($1)");
}

function collectValues(styleSheet: nodes.Stylesheet, declaration: nodes.Declaration): Set {
	const fullPropertyName = declaration.getFullPropertyName();
	const entries: Set = new Set();

	function visitValue(node: nodes.Node) {
		if (node instanceof nodes.Identifier || node instanceof nodes.NumericValue || node instanceof nodes.HexColorValue) {
			entries.add(node.getText());
		}
		return true;
	}

	function matchesProperty(decl: nodes.Declaration): boolean {
		let propertyName = decl.getFullPropertyName();
		return fullPropertyName === propertyName;
	}

	function vistNode(node: nodes.Node) {
		if (node instanceof nodes.Declaration && node !== declaration) {
			if (matchesProperty(<nodes.Declaration>node)) {
				let value = (<nodes.Declaration>node).getValue();
				if (value) {
					value.accept(visitValue);
				}
			}
		}
		return true;
	}
	styleSheet.accept(vistNode);
	return entries;
}


class ColorValueCollector implements nodes.IVisitor {

	constructor(public entries: Set, private currentOffset: number) {
		// nothing to do
	}

	public visitNode(node: nodes.Node): boolean {
		if (node instanceof nodes.HexColorValue || (node instanceof nodes.Function && languageFacts.isColorConstructor(<nodes.Function>node))) {
			if (this.currentOffset < node.offset || node.end < this.currentOffset) {
				this.entries.add(node.getText());
			}
		}
		return true;
	}
}

function isDefined(obj: any): boolean {
	return typeof obj !== 'undefined';
}

function getCurrentWord(document: TextDocument, offset: number) {
	let i = offset - 1;
	let text = document.getText();
	while (i >= 0 && ' \t\n\r":{[()]},*>+'.indexOf(text.charAt(i)) === -1) {
		i--;
	}
	return text.substring(i + 1, offset);
}