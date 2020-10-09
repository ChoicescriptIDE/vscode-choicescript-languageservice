(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ChoiceScriptScanner", "./ChoiceScriptNodes", "./ChoiceScriptErrors", "../data/commands"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChoiceScriptParser = void 0;
    var ChoiceScriptScanner_1 = require("./ChoiceScriptScanner");
    var nodes = require("./ChoiceScriptNodes");
    var ChoiceScriptErrors_1 = require("./ChoiceScriptErrors");
    var commands_1 = require("../data/commands");
    /// <summary>
    /// A parser for the css core specification. See for reference:
    /// https://www.w3.org/TR/CSS21/grammar.html
    /// http://www.w3.org/TR/CSS21/syndata.html#tokenization
    /// </summary>
    var ChoiceScriptParser = /** @class */ (function () {
        function ChoiceScriptParser(indentUnit, indentUnitSize, scnr /* TODO: proper type/enum */) {
            if (indentUnit === void 0) { indentUnit = "auto"; }
            if (indentUnitSize === void 0) { indentUnitSize = 2; }
            if (scnr === void 0) { scnr = new ChoiceScriptScanner_1.Scanner(); }
            this.indentUnitSize = 2;
            this.indentLevel = 0;
            this.lineNum = 1;
            switch (indentUnit) {
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
            this.token = { type: ChoiceScriptScanner_1.TokenType.EOF, offset: -1, len: 0, text: '' };
            this.prevToken = undefined;
        }
        ChoiceScriptParser.prototype.peekIdent = function (text) {
            return ChoiceScriptScanner_1.TokenType.Ident === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
        };
        ChoiceScriptParser.prototype.peekKeyword = function (text) {
            return ChoiceScriptScanner_1.TokenType.AtKeyword === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
        };
        ChoiceScriptParser.prototype.peekDelim = function (text) {
            return ChoiceScriptScanner_1.TokenType.Delim === this.token.type && text === this.token.text;
        };
        ChoiceScriptParser.prototype.peek = function (type) {
            return type === this.token.type;
        };
        ChoiceScriptParser.prototype.peekRegExp = function (type, regEx) {
            if (type !== this.token.type) {
                return false;
            }
            return regEx.test(this.token.text);
        };
        ChoiceScriptParser.prototype.hasWhitespace = function () {
            return !!this.prevToken && (this.prevToken.offset + this.prevToken.len !== this.token.offset);
        };
        ChoiceScriptParser.prototype.consumeToken = function () {
            this.prevToken = this.token;
            this.token = this.scanner.scan();
        };
        ChoiceScriptParser.prototype.mark = function () {
            return {
                prev: this.prevToken,
                curr: this.token,
                offset: this.scanner.pos()
            };
        };
        ChoiceScriptParser.prototype.restoreAtMark = function (mark) {
            this.prevToken = mark.prev;
            this.token = mark.curr;
            this.scanner.goBackTo(mark.offset);
        };
        ChoiceScriptParser.prototype.try = function (func) {
            var pos = this.mark();
            var node = func();
            if (!node) {
                this.restoreAtMark(pos);
                return null;
            }
            return node;
        };
        ChoiceScriptParser.prototype.acceptOneKeyword = function (keywords) {
            var mark = this.mark();
            if (!this.accept(ChoiceScriptScanner_1.TokenType.Asterisk)) {
                return false;
            }
            if (ChoiceScriptScanner_1.TokenType.Ident === this.token.type) {
                for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
                    var keyword = keywords_1[_i];
                    if (keyword.length === this.token.text.length && keyword === this.token.text.toLowerCase()) {
                        this.consumeToken();
                        return true;
                    }
                }
            }
            this.restoreAtMark(mark);
            return false;
        };
        ChoiceScriptParser.prototype.accept = function (type) {
            if (type === this.token.type) {
                this.consumeToken();
                return true;
            }
            return false;
        };
        ChoiceScriptParser.prototype.acceptIdent = function (text) {
            if (this.peekIdent(text)) {
                this.consumeToken();
                return true;
            }
            return false;
        };
        ChoiceScriptParser.prototype.acceptKeyword = function (text) {
            if (this.peekKeyword(text)) {
                this.consumeToken();
                return true;
            }
            return false;
        };
        ChoiceScriptParser.prototype.acceptFromRawTextList = function (keywords) {
            for (var _i = 0, keywords_2 = keywords; _i < keywords_2.length; _i++) {
                var keyword = keywords_2[_i];
                if (keyword.length === this.token.text.length && keyword === this.token.text.toLowerCase()) {
                    this.consumeToken();
                    return true;
                }
            }
            return false;
        };
        ChoiceScriptParser.prototype.acceptDelim = function (text) {
            if (this.peekDelim(text)) {
                this.consumeToken();
                return true;
            }
            return false;
        };
        ChoiceScriptParser.prototype.acceptRegexp = function (regEx) {
            if (regEx.test(this.token.text)) {
                this.consumeToken();
                return true;
            }
            return false;
        };
        ChoiceScriptParser.prototype._parseRegexp = function (regEx) {
            var node = this.createNode(nodes.NodeType.Identifier);
            do { } while (this.acceptRegexp(regEx));
            return this.finish(node);
        };
        ChoiceScriptParser.prototype.resync = function (resyncTokens, resyncStopTokens) {
            while (true) {
                if (resyncTokens && resyncTokens.indexOf(this.token.type) !== -1) {
                    this.consumeToken();
                    return true;
                }
                else if (resyncStopTokens && resyncStopTokens.indexOf(this.token.type) !== -1) {
                    return true;
                }
                else {
                    if (this.token.type === ChoiceScriptScanner_1.TokenType.EOF) {
                        return false;
                    }
                    this.token = this.scanner.scan();
                }
            }
        };
        ChoiceScriptParser.prototype.createNode = function (nodeType) {
            return new nodes.Node(this.token.offset, this.token.len, nodeType);
        };
        ChoiceScriptParser.prototype.create = function (ctor) {
            return new ctor(this.token.offset, this.token.len);
        };
        ChoiceScriptParser.prototype.finish = function (node, error, resyncTokens, resyncStopTokens) {
            // parseNumeric misuses error for boolean flagging (however the real error mustn't be a false)
            // + nodelist offsets mustn't be modified, because there is a offset hack in rulesets for smartselection
            if (!(node instanceof nodes.Nodelist)) {
                if (error) {
                    this.markError(node, error, resyncTokens, resyncStopTokens);
                }
                // set the node end position
                if (this.prevToken) {
                    // length with more elements belonging together
                    var prevEnd = this.prevToken.offset + this.prevToken.len;
                    node.length = prevEnd > node.offset ? prevEnd - node.offset : 0; // offset is taken from current token, end from previous: Use 0 for empty nodes
                }
            }
            return node;
        };
        ChoiceScriptParser.prototype.markError = function (node, error, resyncTokens, resyncStopTokens) {
            if (this.token !== this.lastErrorToken) { // do not report twice on the same token
                node.addIssue(new nodes.Marker(node, error, nodes.Level.Error, undefined, this.token.offset, this.token.len));
                this.lastErrorToken = this.token;
            }
            if (resyncTokens || resyncStopTokens) {
                this.resync(resyncTokens, resyncStopTokens);
            }
        };
        ChoiceScriptParser.prototype.parseScene = function (textDocument) {
            var versionId = textDocument.version;
            var text = textDocument.getText();
            var textProvider = function (offset, length) {
                if (textDocument.version !== versionId) {
                    throw new Error('Underlying model has changed, AST is no longer valid');
                }
                return text.substr(offset, length);
            };
            return this.internalParse(text, this._parseScene.bind(this, textDocument), textProvider);
        };
        ChoiceScriptParser.prototype.internalParse = function (input, parseFunc, textProvider) {
            this.scanner.setSource(input);
            this.token = this.scanner.scan();
            var node = parseFunc.bind(this)();
            if (node) {
                if (textProvider) {
                    node.textProvider = textProvider;
                }
                else {
                    node.textProvider = function (offset, length) { return input.substr(offset, length); };
                }
            }
            return node;
        };
        ChoiceScriptParser.prototype._parseScene = function (textDocument) {
            var scene = this.create(nodes.Scene);
            if (textDocument && textDocument.uri) {
                scene.setUri(textDocument.uri);
            }
            do {
                var indentLevel = this.indentLevel;
                var line = this._parseLine();
                if (!scene.addChild(line)) {
                    throw new Error("ParseError: Ran out of valid lines before EOF");
                }
                if (line.getLineType() !== nodes.LineType.Comment) {
                    if (line.indent > indentLevel) {
                        this.markError(line.getIndentNode(), ChoiceScriptErrors_1.ParseError.IndentationError);
                    }
                    else if (line.indent < indentLevel) {
                        this.indentLevel = line.indent;
                    }
                }
            } while (!this.accept(ChoiceScriptScanner_1.TokenType.EOF));
            return this.finish(scene);
        };
        ChoiceScriptParser.prototype._parseLine = function () {
            var token = this.token;
            var line = this.create(nodes.Line);
            line.addIndent(this._parseIndentation());
            var lineRet = (this._populateChoiceOptionLine(line) ||
                this._populateChoiceScriptLine(line) ||
                this._populateTextLine(line));
            if (!lineRet) {
                // empty line
                line.setLineType(nodes.LineType.Text);
            }
            line.setLineNum(this.lineNum++);
            if (!this.accept(ChoiceScriptScanner_1.TokenType.EOL)) {
                //throw new Error("ParseError: Expected EOL!");
            }
            return this.finish(line);
        };
        ChoiceScriptParser.prototype._parseVariableReplacement = function () {
            var node = this.create(nodes.VariableReplacement);
            if (!this.acceptDelim('@') && !this.accept(ChoiceScriptScanner_1.TokenType.Dollar)) {
                return null;
            }
            // capitalization
            var formatMode = 2;
            while (this.acceptDelim('!')) {
                formatMode--;
            }
            if (formatMode < 0) {
                return null; // ChoiceScript ignores var replacements with more than 2 !'s: $!!!{ignored}
            }
            if ((this.prevToken.type === ChoiceScriptScanner_1.TokenType.Delim) &&
                (this.prevToken.text === '@')) {
                node.addChild(this._parseMultireplaceBody()); // adding null a bad idea?
            }
            else if (this.prevToken.type === ChoiceScriptScanner_1.TokenType.Dollar) {
                if (!this.accept(ChoiceScriptScanner_1.TokenType.CurlyL)) {
                    return null;
                }
                node.addChild(this._parseCSExpr(ChoiceScriptScanner_1.TokenType.CurlyR));
                return this.finish(node);
            }
            /*if (formatMode > 2) { // Not strictly speaking a syntax error, so may be better for the linter
                return this.finish(node, ParseError.InvalidVariableFormatOption);
            }*/
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseValueToken = function (token) {
            if (this.accept(ChoiceScriptScanner_1.TokenType.ParenthesisL)) {
                return this._parseCSExpr(ChoiceScriptScanner_1.TokenType.ParenthesisR);
            }
            else if (this.accept(ChoiceScriptScanner_1.TokenType.CurlyL)) {
                return this._parseCSExpr(ChoiceScriptScanner_1.TokenType.CurlyR);
            }
            else if (this.acceptFromRawTextList(["not", "round", "timestamp", "log", "length", "auto"])) {
                this.accept(ChoiceScriptScanner_1.TokenType.ParenthesisL); // might want to guard this
                return this._parseCSExpr(ChoiceScriptScanner_1.TokenType.ParenthesisR);
            }
            else {
                // we don't know when our stack 'ends' ...?
                var term = (this._parseBoolean() ||
                    this._parseIdent() ||
                    this._parseStringLiteral() ||
                    this._parseNumericalLiteral() ||
                    this._parseBoolean());
                if (!term) {
                    return null;
                }
                return this.finish(term); // singleton
            }
        };
        ChoiceScriptParser.prototype._mapMissingParenToParseError = function (parenTokenType) {
            switch (parenTokenType) {
                case ChoiceScriptScanner_1.TokenType.ParenthesisL:
                    return ChoiceScriptErrors_1.ParseError.LeftParenthesisExpected;
                case ChoiceScriptScanner_1.TokenType.ParenthesisR:
                    return ChoiceScriptErrors_1.ParseError.RightParenthesisExpected;
                case ChoiceScriptScanner_1.TokenType.CurlyL:
                    return ChoiceScriptErrors_1.ParseError.LeftCurlyExpected;
                case ChoiceScriptScanner_1.TokenType.CurlyR:
                    return ChoiceScriptErrors_1.ParseError.RightCurlyExpected;
                case ChoiceScriptScanner_1.TokenType.BracketL:
                    return ChoiceScriptErrors_1.ParseError.LeftSquareBracketExpected;
                case ChoiceScriptScanner_1.TokenType.BracketR:
                    return ChoiceScriptErrors_1.ParseError.RightSquareBracketExpected;
                default:
                    throw new Error("Can't map invalid parenthesis type to missing parenthesis error!");
            }
        };
        ChoiceScriptParser.prototype._parseCSExpr = function (parenthetical, stopOffset) {
            var node = this.create(nodes.Expression);
            var term1 = this._parseValueToken(this.token);
            if (!term1) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.TermExpected);
            }
            node.setLeft(term1);
            if (this.peek(ChoiceScriptScanner_1.TokenType.EOL) || this.peek(ChoiceScriptScanner_1.TokenType.EOF) || ((stopOffset) && this.token.offset >= stopOffset)) {
                if (parenthetical) {
                    return this.finish(node, this._mapMissingParenToParseError(parenthetical));
                }
                return this.finish(node); // singleton
            }
            if (parenthetical && this.accept(parenthetical)) {
                return this.finish(node); // singleton in brackets
            }
            // else we're onto operators
            var op = this._parseAnyCSOperator();
            if (!op) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.OperatorExpected);
                // expected operator error
            }
            node.setOperator(op);
            var term2 = this._parseValueToken();
            if (!term2) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.TermExpected);
            }
            node.setRight(term2);
            // close parenthesis
            if (parenthetical && !this.accept(parenthetical)) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.RightParenthesisExpected);
            }
            if (this.peek(ChoiceScriptScanner_1.TokenType.EOL) || this.peek(ChoiceScriptScanner_1.TokenType.EOF) || ((stopOffset) && this.token.offset >= stopOffset)) {
                // redundant?
                return this.finish(node);
            }
            // Too many brackets on the right-hand
            if (!parenthetical) {
                var error = void 0;
                if (this.peek(ChoiceScriptScanner_1.TokenType.BracketR) ||
                    this.peek(ChoiceScriptScanner_1.TokenType.CurlyR) ||
                    this.peek(ChoiceScriptScanner_1.TokenType.ParenthesisR)) {
                    switch (this.token.type) {
                        case ChoiceScriptScanner_1.TokenType.BracketR:
                            error = ChoiceScriptErrors_1.ParseError.LeftSquareBracketExpected;
                            break;
                        case ChoiceScriptScanner_1.TokenType.ParenthesisR:
                            error = ChoiceScriptErrors_1.ParseError.LeftParenthesisExpected;
                            break;
                        case ChoiceScriptScanner_1.TokenType.CurlyR:
                            error = ChoiceScriptErrors_1.ParseError.LeftCurlyExpected;
                            break;
                        default:
                            error = ChoiceScriptErrors_1.ParseError.UnbalancedBrackets;
                    }
                    return this.finish(node, error);
                }
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseChoiceScriptFunction = function () {
            var node = this.create(nodes.Node);
            if (!this.acceptFromRawTextList(["not", "round", "timestamp", "log", "length", "auto"])) {
                return null;
            }
            if (!this.peek(ChoiceScriptScanner_1.TokenType.ParenthesisL)) {
                return null;
            }
            this.consumeToken(); // ParenthesisL
            node.addChild(this._parseCSExpr());
            if (!this.accept(ChoiceScriptScanner_1.TokenType.ParenthesisR)) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.RightParenthesisExpected);
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseAnyCSOperator = function () {
            return this._parseStandardCSOperator() ||
                this._parseNamedCSOperator() ||
                this._parseBooleanCSOperator() ||
                this._parseFairMathCSOperator();
        };
        ChoiceScriptParser.prototype._parseImplicitCSOperator = function () {
            return this._parseStandardCSOperator() ||
                this._parseNamedCSOperator() ||
                this._parseFairMathCSOperator();
        };
        ChoiceScriptParser.prototype._parseNamedCSOperator = function () {
            var operator = this.create(nodes.Operator);
            if (!this.acceptFromRawTextList(["and", "or", "modulo"])) {
                return null;
            }
            operator.setCSType(nodes.ChoiceScriptType.Boolean);
            return this.finish(operator);
        };
        ChoiceScriptParser.prototype._parseStandardCSOperator = function () {
            var operator = this.create(nodes.Operator);
            if (this.accept(ChoiceScriptScanner_1.TokenType.Asterisk) ||
                this.acceptDelim('+') ||
                this.acceptDelim('-') ||
                this.acceptDelim('/') ||
                this.acceptDelim('%') ||
                this.acceptDelim('^')) {
                operator.setCSType(nodes.ChoiceScriptType.Number);
                return this.finish(operator);
            }
            else if (this.accept(ChoiceScriptScanner_1.TokenType.Hash) ||
                this.acceptDelim('&')) {
                operator.setCSType(nodes.ChoiceScriptType.String);
                return this.finish(operator);
            }
            return null;
        };
        ChoiceScriptParser.prototype._parseBooleanCSOperator = function () {
            var operator = this.create(nodes.Operator);
            switch (this.token.text) {
                case '<':
                case '>':
                    this.consumeToken();
                    this.acceptDelim('=');
                    break;
                case '!':
                    this.consumeToken();
                    if (!this.acceptDelim('=')) {
                        return this.finish(operator, ChoiceScriptErrors_1.ParseError.InvalidVariableFormatOption);
                    }
                    break;
                case '=':
                    this.consumeToken();
                    break;
                default:
                    return null;
            }
            operator.setCSType(nodes.ChoiceScriptType.Boolean);
            return this.finish(operator);
        };
        ChoiceScriptParser.prototype._parseFairMathCSOperator = function () {
            var operator = this.create(nodes.Operator);
            if (!this.accept(ChoiceScriptScanner_1.TokenType.FairMathAdd) &&
                !this.accept(ChoiceScriptScanner_1.TokenType.FairMathSub)) {
                return null;
            }
            operator.setCSType(nodes.ChoiceScriptType.Number);
            return this.finish(operator);
        };
        ChoiceScriptParser.prototype._parseMultireplaceBody = function () {
            //@{mybool opt1|opt2}, @{mynum ${opt1}|opt2|opt3}
            var mark = this.mark();
            var multireplace = this.create(nodes.MultiReplace);
            // absolutely horrible hack to (oft inaccurately) detect multireplace's space
            // currently necessary due to the fact that the scanner ignores whitespace
            var spaceOffset = this.scanner.stream.pos();
            var ch = null;
            while (true) {
                ch = this.scanner.stream.peekChar();
                if (ch === ' '.charCodeAt(0)) {
                    break;
                }
                else if (this.scanner.stream.eos()) {
                    return this.finish(multireplace, ChoiceScriptErrors_1.ParseError.NotEnoughMultiReplaceOptions);
                }
                this.scanner.stream.advance(1);
                spaceOffset = this.scanner.stream.pos();
            }
            this.restoreAtMark(mark);
            if (!this.accept(ChoiceScriptScanner_1.TokenType.CurlyL)) {
                return null;
            }
            // only consider tokens up to the space as part of the expression
            var expr = this._parseCSExpr(undefined, spaceOffset);
            if (!expr) {
                return this.finish(multireplace, ChoiceScriptErrors_1.ParseError.ExpressionExpected);
            }
            multireplace.setExpression(expr);
            /*if (!this.acceptDelim(' ')) {
                Scanner is currently ignoring whitespace
                "; there should be a space after the first word/expr"
            }*/
            while (!this.accept(ChoiceScriptScanner_1.TokenType.CurlyR) && !this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                var variant = this.create(nodes.MultiReplaceOption);
                while (!this.acceptDelim('|')) {
                    if (variant.addChild(this._parseWord() || this._parseVariableReplacement())) {
                        // add any text nodes to the node tree
                    }
                    else if (this.peek(ChoiceScriptScanner_1.TokenType.CurlyR)) {
                        // that was the last option
                        break;
                    }
                    else if (!this.peekDelim('|') && !this.accept(ChoiceScriptScanner_1.TokenType.CurlyR) &&
                        !this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                        this.consumeToken(); // FIXME: Generally ignore but parse stray delimiters, or punctuation.
                    }
                    else {
                        // probably shouldn't ever reach here; something's gone wrong if we do
                        // but we should catch that below
                        break;
                    }
                }
                multireplace.addVariant(this.finish(variant));
            }
            if (multireplace.getOptions() && multireplace.getOptions().length < 2) {
                return this.finish(multireplace, ChoiceScriptErrors_1.ParseError.NotEnoughMultiReplaceOptions);
            }
            return this.finish(multireplace);
        };
        ChoiceScriptParser.prototype._parseFormatTags = function () {
            // [b][/b], [i][/i]
        };
        ChoiceScriptParser.prototype._parseWord = function () {
            // FIXME: Differentiate words and identifiers
            if (this.peek(ChoiceScriptScanner_1.TokenType.Word) || this.peek(ChoiceScriptScanner_1.TokenType.Ident) || this.peek(ChoiceScriptScanner_1.TokenType.Char)) {
                var word = this.createNode(nodes.NodeType.RealWord);
                this.consumeToken();
                return this.finish(word);
            }
            return null;
        };
        // this is precarious if run before other line types
        // as it blindly consumes Asterisks and Idents etc.
        ChoiceScriptParser.prototype._addTextToNode = function (node) {
            var added = false;
            while (true) {
                if (node.addChild(this._parseVariableReplacement() || this._parseWord())) {
                    added = true;
                    continue;
                }
                else if (!this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                    // TODO: Consider being more specific with node types here?
                    added = true;
                    var child = this.create(nodes.Node);
                    this.consumeToken();
                    this.finish(child);
                    node.addChild(child);
                }
                else {
                    break;
                }
            }
            return added;
        };
        ChoiceScriptParser.prototype._populateTextLine = function (line) {
            if (this._addTextToNode(line)) {
                line.setLineType(nodes.LineType.Text);
                return line;
            }
            return null;
        };
        ChoiceScriptParser.prototype._populateChoiceOptionLine = function (line) {
            if (line.addChild(this._parseChoiceOptionLine())) {
                line.setLineType(nodes.LineType.ChoiceOption);
                return line;
            }
            return null;
        };
        ChoiceScriptParser.prototype._populateChoiceScriptLine = function (line) {
            if (line.addChild(this._parseChoiceScriptStatement())) {
                line.setLineType(nodes.LineType.ChoiceScript);
                return line;
            }
            return null;
        };
        ChoiceScriptParser.prototype._parseChoiceScriptStatement = function () {
            return this._parseChoiceScriptComment()
                || this._parseVariableDeclaration()
                || this._parseLabelDeclaration()
                || this._parseSetCommand()
                || this._parseChoiceCommand()
                || this._parseFlowCommand()
                || this._parseIfCommand()
                || this._parseStandardCommand()
                || this._parseInvalidCommand();
        };
        ChoiceScriptParser.prototype._parseChoiceScriptComment = function () {
            if (!this.peek(ChoiceScriptScanner_1.TokenType.SingleLineComment)) {
                return null;
            }
            var comment = this.create(nodes.ChoiceScriptComment);
            while (!this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                this.consumeToken();
            }
            return this.finish(comment);
        };
        ChoiceScriptParser.prototype._parseChoiceScriptCommand = function () {
            return this._parseChoiceScriptComment()
                || this._parseVariableDeclaration()
                || this._parseLabelDeclaration()
                || this._parseSetCommand()
                || this._parseChoiceCommand()
                || this._parseFlowCommand()
                || this._parseIfCommand()
                || this._parseStandardCommand()
                || this._parseInvalidCommand();
        };
        ChoiceScriptParser.prototype._parseLabelDeclaration = function () {
            var declaration = this.create(nodes.LabelDeclaration);
            var command = this.create(nodes.FlowCommand);
            if (!this.acceptOneKeyword(["label"])) {
                return null;
            }
            declaration.addChild(this.finish(command));
            if (!declaration.setLabel(this._parseTIdent(nodes.Label))) {
                return this.finish(declaration, ChoiceScriptErrors_1.ParseError.LabelNameExpected);
            }
            return this.finish(declaration);
        };
        ChoiceScriptParser.prototype._parseVariableDeclaration = function () {
            var declaration = this.create(nodes.VariableDeclaration);
            var command = this.create(nodes.StandardCommand);
            if (!this.acceptOneKeyword(["create", "temp"])) {
                return null;
            }
            var commandToken = this.prevToken;
            declaration.addChild(this.finish(command));
            if (!declaration.setVariable(this._parseTIdent(nodes.Variable))) {
                return this.finish(declaration, ChoiceScriptErrors_1.ParseError.VariableNameExpected);
            }
            // *create commands must be initialized
            if (this.peek(ChoiceScriptScanner_1.TokenType.EOL) || this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                return this.finish(declaration, (commandToken.text === "create") ? ChoiceScriptErrors_1.ParseError.VariableValueExpected : undefined);
            }
            declaration.setExpr(this._parseCSExpr());
            return this.finish(declaration);
        };
        // Description from scene.js:
        // turn a var token into its name, remove it from the stack
        // or if it's a curly parenthesis, evaluate that
        // or if it's an array expression, convert it into its raw underscore name
        ChoiceScriptParser.prototype._parseVariableReference = function (parenthetical) {
            var node = this.create(nodes.Variable);
            if (this.accept(ChoiceScriptScanner_1.TokenType.CurlyL)) {
                return this._parseVariableReference(ChoiceScriptScanner_1.TokenType.CurlyR);
            }
            else if (this.accept(ChoiceScriptScanner_1.TokenType.BracketL)) {
                return this._parseVariableReference(ChoiceScriptScanner_1.TokenType.BracketR);
            }
            if (!this._parseIdent() && !this._parseNumericalLiteral()) {
                // parseNumericalLiteral allows purely numerical labels
                return null;
            }
            if (parenthetical && !this.accept(parenthetical)) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.RightCurlyExpected);
            }
            return this.finish(node);
        };
        // FIXME: Labels only have to pass !labelName.test(/\s/)
        ChoiceScriptParser.prototype._parseLabel = function () {
            return this._parseTIdent(nodes.Label);
        };
        // FIXME: Variables MUST start with a letter: .test(/^[A-Za-z]+) -- Should we do this in PARSE or LINT?
        // AND otherwise only contain "word" characters: e.g. test(/^\w+$/)
        ChoiceScriptParser.prototype._parseVariable = function () {
            return this._parseTIdent(nodes.Variable);
        };
        ChoiceScriptParser.prototype._parseTIdent = function (type) {
            var node = this.create(type);
            if (!this.accept(ChoiceScriptScanner_1.TokenType.Ident)) {
                return null;
            }
            return node; // feel like this should be this.finish, but LESS example says otherwise;
        };
        /*public _parseTRef<T>(type: nodes.NodeConstructor<T>): T | null {
            const ref = <T>this.create(type);
            if (!ref.addChild(<nodes.Scene>this._parseTIdent(nodes.Scene) || this._parseStringExpression())) {
                return null;
            }
            return <T>this.finish(sceneRef);
        }*/
        ChoiceScriptParser.prototype._parseLabelRef = function () {
            var labelRef = this.create(nodes.LabelRef);
            if (!labelRef.addChild(this._parseTIdent(nodes.Label) || this._parseStringExpression())) {
                return null;
            }
            return this.finish(labelRef);
        };
        ChoiceScriptParser.prototype._parseSceneRef = function () {
            var sceneRef = this.create(nodes.SceneRef);
            if (!sceneRef.addChild(this._parseTIdent(nodes.Scene) || this._parseStringExpression())) {
                return null;
            }
            return this.finish(sceneRef);
        };
        ChoiceScriptParser.prototype._parseGoCommandBody = function (flowCommand, name) {
            // goto, gosub, goto_scene, gosub_scene. Excludes: goto_random_scene.
            // format1: go{type} (LabelName|stringExpr)
            // format2: go{type}_scene (SceneName|StringExpr) (LabelName|StringExpr)?
            if (!name) {
                return; // TODO error?
            }
            if (["goto", "gosub"].includes(name)) {
                if (!flowCommand.addChild(this._parseLabelRef())) {
                    this.markError(flowCommand, ChoiceScriptErrors_1.ParseError.ExpectedLabel);
                }
            }
            else if (["goto_scene", "gosub_scene"].includes(name)) {
                var sceneRef = this._parseSceneRef();
                if (!flowCommand.addChild(sceneRef)) {
                    this.markError(flowCommand, ChoiceScriptErrors_1.ParseError.ExpectedScene);
                    return;
                }
                // scene label is optional
                var labelRef = this._parseLabelRef();
                if (flowCommand.addChild(labelRef)) {
                    labelRef.setSceneRef(sceneRef);
                }
            }
        };
        ChoiceScriptParser.prototype._parseFlowCommand = function () {
            var _a;
            var node = this.create(nodes.FlowCommand);
            if (!this.acceptOneKeyword(commands_1.flowCommandList.map(function (cmd) { return cmd; }))) {
                return null;
            }
            this._parseGoCommandBody(node, (_a = this.prevToken) === null || _a === void 0 ? void 0 : _a.text);
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseIfCommand = function (inline) {
            var node = this.create(nodes.Command);
            if (!this.acceptOneKeyword(["if", "selectable_if"])) {
                return null;
            }
            if (inline && !this.accept(ChoiceScriptScanner_1.TokenType.ParenthesisL)) {
                // inline *ifs must be braced
                return null;
            }
            if (!node.addChild(this._parseCSExpr(inline ? ChoiceScriptScanner_1.TokenType.ParenthesisR : undefined, undefined))) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.ExpressionExpected);
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseReuseCommand = function () {
            var node = this.create(nodes.Node);
            if (!this.acceptOneKeyword(["allow_reuse", "hide_reuse"])) {
                return null;
            }
            else {
                while (!this.peek(ChoiceScriptScanner_1.TokenType.Hash) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                    this.consumeToken();
                }
                return this.finish(node);
            }
        };
        // FIXME: doesn't handle non-inline ifs
        ChoiceScriptParser.prototype._parseChoiceOptionLine = function () {
            // FIXME actually build IF/Option node structure properly.
            var mark = this.mark();
            var line = this.create(nodes.Line);
            line.setLineType(nodes.LineType.ChoiceOption);
            var indent = this._parseIndentation(true /* checkIndentLevel */);
            if (!line.addChild(indent)) {
                return null;
            }
            var indentMark = this.mark();
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
            line.addChild(this._parseIfCommand(true /* inline */)); // inline / optional
            if (!this.accept(ChoiceScriptScanner_1.TokenType.Hash)) {
                this.restoreAtMark(indentMark);
                if (!line.addChild(this._parseIfBlock(true /* choiceOption */))) {
                    this.restoreAtMark(mark);
                    return null;
                }
                else {
                    this.accept(ChoiceScriptScanner_1.TokenType.EOL);
                    this.indentLevel++;
                    return this.finish(line);
                }
            }
            var text = this.create(nodes.Node);
            if (!this._addTextToNode(text)) {
                return this.finish(line, ChoiceScriptErrors_1.ParseError.NoChoiceOption);
            }
            line.addChild(text);
            this.accept(ChoiceScriptScanner_1.TokenType.EOL);
            this.indentLevel++;
            //while(line.addChild(this._parseLine())) {}
            return this.finish(line);
        };
        ChoiceScriptParser.prototype._parseIfBlock = function (guardsChoiceOption) {
            var node = this.create(nodes.Node);
            if (!this.acceptOneKeyword(["if"])) {
                return null;
            }
            if (!node.addChild(this._parseCSExpr(undefined, undefined))) {
                return this.finish(node, ChoiceScriptErrors_1.ParseError.ExpressionExpected);
            }
            if (!this.accept(ChoiceScriptScanner_1.TokenType.EOL)) {
                throw new Error("ParseError: Expected EOL after IF statement");
            }
            if (guardsChoiceOption) {
                if (!node.addChild(this._parseChoiceOptionLine())) {
                    return this.finish(node, ChoiceScriptErrors_1.ParseError.ExpectedChoiceOption);
                }
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseChoiceOptionText = function () {
            var option = this.create(nodes.ChoiceOption);
            while (true) {
                if (option.addChild(this._parseWord() ||
                    this._parseVariableReplacement())) {
                    continue;
                }
                else if (!this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                    this.consumeToken();
                }
                else {
                    break;
                }
            }
            if (!option.hasChildren()) {
                return this.finish(option, ChoiceScriptErrors_1.ParseError.ExpectedChoiceOption);
            }
            return this.finish(option);
        };
        ChoiceScriptParser.prototype._parseChoiceCommand = function () {
            var node = this.create(nodes.ChoiceCommand);
            if (this.acceptOneKeyword(["choice"])) {
                // TODO? complicated to support nested choices
                while (!this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF)) {
                    this.consumeToken();
                }
                this.accept(ChoiceScriptScanner_1.TokenType.EOL);
                this.indentLevel++;
                while (node.addChild(this._parseChoiceOptionLine())) { }
                if (node.hasChildren()) {
                    return this.finish(node);
                }
                else {
                    return this.finish(node, ChoiceScriptErrors_1.ParseError.NoChoiceOption);
                }
            }
            return null;
        };
        ChoiceScriptParser.prototype._parseSetCommand = function () {
            var command = this.create(nodes.SetCommand);
            if (!this.acceptOneKeyword(["set"])) { // FIXME: not sure a function for every command is scalable
                return null;
            }
            // this is VERY similar to create/temp commands (VariableDeclaration) can they share the logic? FIXME
            var implictMark = this.mark();
            if (!command.setVariable(this._parseVariableReference())) {
                return this.finish(command, ChoiceScriptErrors_1.ParseError.VariableNameExpected);
            }
            if (this._parseImplicitCSOperator()) { // for e.g. myvar +5
                this.restoreAtMark(implictMark); // parseCSExpr needs to reparse the var
            }
            var expr = this._parseCSExpr();
            if (!expr || expr.length === 0) {
                return this.finish(command, ChoiceScriptErrors_1.ParseError.VariableValueExpected);
            }
            command.setValue(expr);
            return this.finish(command);
        };
        ChoiceScriptParser.prototype._parseStandardCommand = function () {
            var node = this.create(nodes.StandardCommand);
            if (this.acceptOneKeyword(commands_1.standardCommandList.map(function (cmd) { return cmd; }))) {
                return this.finish(node);
            }
            return null;
        };
        ChoiceScriptParser.prototype._parseInvalidCommand = function () {
            var node = this.create(nodes.Command);
            var mark = this.mark();
            if (!this.accept(ChoiceScriptScanner_1.TokenType.Asterisk)) {
                return null; // not a command
            }
            if (!/^\w+/.test(this.token.text)) {
                // Non-word characters following an asterisk,
                // like *** or *-, make for legal TextLines
                this.restoreAtMark(mark);
                return null;
            }
            this.markError(node, ChoiceScriptErrors_1.ParseError.UnknownCommand);
            this.consumeToken(); // assume the next token is the attempted command
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._needsSemicolonAfter = function (node) {
            switch (node.type) {
                case nodes.NodeType.Keyframe:
                case nodes.NodeType.ViewPort:
                case nodes.NodeType.Media:
                case nodes.NodeType.Namespace:
                case nodes.NodeType.If:
                case nodes.NodeType.For:
                case nodes.NodeType.Each:
                case nodes.NodeType.While:
                case nodes.NodeType.FunctionDeclaration:
                case nodes.NodeType.MixinContentDeclaration:
                    return false;
                case nodes.NodeType.VariableDeclaration:
                case nodes.NodeType.ReturnStatement:
                case nodes.NodeType.MediaQuery:
                case nodes.NodeType.Import:
                case nodes.NodeType.AtApplyRule:
                case nodes.NodeType.CustomPropertyDeclaration:
                    return true;
            }
            return false;
        };
        ChoiceScriptParser.prototype._parseNumericalOperator = function () {
            if (this.peek(ChoiceScriptScanner_1.TokenType.Asterisk) ||
                this.peekDelim('+') ||
                this.peekDelim('-') ||
                this.peekDelim('/') ||
                this.peek(ChoiceScriptScanner_1.TokenType.FairMathAdd) ||
                this.peek(ChoiceScriptScanner_1.TokenType.FairMathSub)) { // doesn't stick to the standard here
                var node = this.create(nodes.Operator);
                this.consumeToken();
                return this.finish(node);
            }
            else {
                return null;
            }
        };
        ChoiceScriptParser.prototype._parseSelectorIdent = function () {
            return this._parseIdent();
        };
        ChoiceScriptParser.prototype._parseHash = function () {
            if (!this.peek(ChoiceScriptScanner_1.TokenType.Hash) && !this.peekDelim('#')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.ChoiceOption);
            if (this.accept(ChoiceScriptScanner_1.TokenType.Hash) || this.acceptDelim('#')) {
                if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
                    return this.finish(node, ChoiceScriptErrors_1.ParseError.IdentifierExpected);
                }
            }
            else {
                this.consumeToken(); // TokenType.Hash
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseExpr = function (stopOnComma) {
            if (stopOnComma === void 0) { stopOnComma = false; }
            var expr = this._parseStringExpression()
                || this._parseNumericalExpression()
                || this._parseFairMathExpr()
                || this._parseBoolean()
                || null;
            return expr;
            // FIXME support actual expressions, not simple value
        };
        ChoiceScriptParser.prototype._parseFairMathExpr = function () {
            if (!this.accept(ChoiceScriptScanner_1.TokenType.FairMathAdd) &&
                !this.accept(ChoiceScriptScanner_1.TokenType.FairMathSub)) {
                return null;
            }
            var node = this.create(nodes.Expression);
            this.consumeToken();
            while (!this.accept(ChoiceScriptScanner_1.TokenType.EOL) && !this.accept(ChoiceScriptScanner_1.TokenType.EOF)) {
                this.consumeToken();
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseBoolean = function () {
            var node = this.create(nodes.BinaryExpression);
            if (!this.acceptFromRawTextList(["true", "false"])) {
                return null;
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseNumericalLiteral = function () {
            if (this.peek(ChoiceScriptScanner_1.TokenType.Num)) {
                var node = this.create(nodes.NumericValue);
                this.consumeToken();
                return this.finish(node);
            }
            return null;
        };
        ChoiceScriptParser.prototype._parseNumericalExpression = function () {
            var node = this.create(nodes.Expression);
            if (!node.setLeft(this._parseNumericalLiteral())) {
                return null;
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseStringExpression = function () {
            var node = this.create(nodes.StringExpression);
            if (!node.setLeft(this._parseStringLiteral())) {
                return null;
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseStringLiteral = function () {
            var string = this.create(nodes.StringValue);
            if (!this.acceptDelim('"')) {
                return null;
            }
            while ((!this.peek(ChoiceScriptScanner_1.TokenType.EOL) && !this.peek(ChoiceScriptScanner_1.TokenType.EOF) && !this.peekDelim('"')) ||
                (this.peekDelim('"') && (this.prevToken && this.prevToken.text === '\\'))) {
                if (!string.addChild(this._parseWord() || this._parseVariableReplacement())) {
                    this.consumeToken(); // treat anything else as unimportant
                }
            }
            if (!this.acceptDelim('"')) { // TODO: Missing quote error
                return this.finish(string, ChoiceScriptErrors_1.ParseError.NoCloseQuote);
            }
            return this.finish(string);
        };
        /*public _parseStringLiteral(): nodes.Node | null {
            if (!this.peek(TokenType.String) && !this.peek(TokenType.BadString)) {
                return null;
            }
            const node = this.createNode(nodes.NodeType.StringLiteral);
            this.consumeToken();
            return this.finish(node);
        }*/
        ChoiceScriptParser.prototype._parseIdent = function (referenceTypes) {
            if (referenceTypes === void 0) { referenceTypes = [nodes.ReferenceType.Variable]; }
            if (!this.peek(ChoiceScriptScanner_1.TokenType.Ident)) {
                return null;
            }
            var node = this.create(nodes.Identifier);
            if (referenceTypes) {
                node.referenceTypes = referenceTypes;
            }
            this.consumeToken();
            // array syntax []
            while (this.accept(ChoiceScriptScanner_1.TokenType.BracketL)) {
                node.addChild(this._parseCSExpr(ChoiceScriptScanner_1.TokenType.BracketR)); // addChild? or attach error directly to prior node?
            }
            return this.finish(node);
        };
        ChoiceScriptParser.prototype._parseIndentation = function (checkIndentLevel) {
            if (checkIndentLevel === void 0) { checkIndentLevel = false; }
            var indentNode = this.create(nodes.Indentation);
            if (!this.peek(ChoiceScriptScanner_1.TokenType.Indentation)) { // peek?
                return null;
            }
            else if (true) { // undefined
                var indentType = void 0;
                var indentDepth = void 0;
                if ((this.token.text.indexOf("\t") > -1) && (this.token.text.indexOf(" ") > -1)) {
                    indentNode.setIndentUnit(nodes.IndentType.Mixed);
                    return this.finish(indentNode, ChoiceScriptErrors_1.ParseError.MixedIndentation);
                }
                else if (this.token.text.charCodeAt(0) === "\t".charCodeAt(0)) {
                    indentType = nodes.IndentType.Tab;
                    indentDepth = this.token.text.length;
                }
                else if (this.token.text.charCodeAt(0) === " ".charCodeAt(0)) {
                    indentType = nodes.IndentType.Spaces;
                    indentDepth = this.token.text.length; // TODO handle space volume
                }
                else {
                    // scanner is broken.
                    throw new Error("Parser failed to handle indentation.");
                }
                this.accept(ChoiceScriptScanner_1.TokenType.Indentation);
                indentNode.setIndentUnit(indentType);
                indentNode.setIndentDepth(indentDepth);
                if (!this.indentType) { // auto-detect
                    this.indentType = nodes.IndentType.Spaces;
                    this.indentUnitSize = indentDepth;
                }
                else if (this.indentType !== indentType) {
                    return this.finish(indentNode, ChoiceScriptErrors_1.ParseError.WrongIndentationUnit);
                }
                var incorrectIndent = false; // checkIndentLevel && ((indentNode?.indentDepth / this.indentUnitSize) !== this.indentLevel);
                return this.finish(indentNode, incorrectIndent ? ChoiceScriptErrors_1.ParseError.IndentationError : undefined);
            }
            else if (true) { // spaces
            }
            else { // tabs
            }
            return null;
        };
        return ChoiceScriptParser;
    }());
    exports.ChoiceScriptParser = ChoiceScriptParser;
});
