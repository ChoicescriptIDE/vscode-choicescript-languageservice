/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
export var LineType;
(function (LineType) {
    LineType[LineType["CommentLine"] = 0] = "CommentLine";
    LineType[LineType["OptionLine"] = 1] = "OptionLine";
    LineType[LineType["CommandLine"] = 2] = "CommandLine";
    LineType[LineType["TextLine"] = 3] = "TextLine";
})(LineType || (LineType = {}));
export var TokenType;
(function (TokenType) {
    TokenType[TokenType["Char"] = 0] = "Char";
    TokenType[TokenType["Ident"] = 1] = "Ident";
    TokenType[TokenType["AtKeyword"] = 2] = "AtKeyword";
    TokenType[TokenType["Asterisk"] = 3] = "Asterisk";
    TokenType[TokenType["String"] = 4] = "String";
    TokenType[TokenType["BadString"] = 5] = "BadString";
    TokenType[TokenType["UnquotedString"] = 6] = "UnquotedString";
    TokenType[TokenType["Hash"] = 7] = "Hash";
    TokenType[TokenType["Num"] = 8] = "Num";
    TokenType[TokenType["Percentage"] = 9] = "Percentage";
    TokenType[TokenType["Dimension"] = 10] = "Dimension";
    TokenType[TokenType["UnicodeRange"] = 11] = "UnicodeRange";
    TokenType[TokenType["CDO"] = 12] = "CDO";
    TokenType[TokenType["CDC"] = 13] = "CDC";
    TokenType[TokenType["Colon"] = 14] = "Colon";
    TokenType[TokenType["SemiColon"] = 15] = "SemiColon";
    TokenType[TokenType["CurlyL"] = 16] = "CurlyL";
    TokenType[TokenType["CurlyR"] = 17] = "CurlyR";
    TokenType[TokenType["ParenthesisL"] = 18] = "ParenthesisL";
    TokenType[TokenType["ParenthesisR"] = 19] = "ParenthesisR";
    TokenType[TokenType["BracketL"] = 20] = "BracketL";
    TokenType[TokenType["BracketR"] = 21] = "BracketR";
    TokenType[TokenType["Indentation"] = 22] = "Indentation";
    TokenType[TokenType["Whitespace"] = 23] = "Whitespace";
    TokenType[TokenType["Includes"] = 24] = "Includes";
    TokenType[TokenType["Dashmatch"] = 25] = "Dashmatch";
    TokenType[TokenType["SubstringOperator"] = 26] = "SubstringOperator";
    TokenType[TokenType["PrefixOperator"] = 27] = "PrefixOperator";
    TokenType[TokenType["SuffixOperator"] = 28] = "SuffixOperator";
    TokenType[TokenType["Delim"] = 29] = "Delim";
    TokenType[TokenType["EMS"] = 30] = "EMS";
    TokenType[TokenType["EXS"] = 31] = "EXS";
    TokenType[TokenType["Length"] = 32] = "Length";
    TokenType[TokenType["Angle"] = 33] = "Angle";
    TokenType[TokenType["Time"] = 34] = "Time";
    TokenType[TokenType["Freq"] = 35] = "Freq";
    TokenType[TokenType["Exclamation"] = 36] = "Exclamation";
    TokenType[TokenType["Resolution"] = 37] = "Resolution";
    TokenType[TokenType["Comma"] = 38] = "Comma";
    TokenType[TokenType["Charset"] = 39] = "Charset";
    TokenType[TokenType["EscapedJavaScript"] = 40] = "EscapedJavaScript";
    TokenType[TokenType["BadEscapedJavaScript"] = 41] = "BadEscapedJavaScript";
    TokenType[TokenType["Comment"] = 42] = "Comment";
    TokenType[TokenType["SingleLineComment"] = 43] = "SingleLineComment";
    TokenType[TokenType["EOF"] = 44] = "EOF";
    TokenType[TokenType["EOL"] = 45] = "EOL";
    TokenType[TokenType["CustomToken"] = 46] = "CustomToken";
    TokenType[TokenType["Builtin"] = 47] = "Builtin";
    TokenType[TokenType["Invalid"] = 48] = "Invalid";
    TokenType[TokenType["Word"] = 49] = "Word";
    TokenType[TokenType["Dollar"] = 50] = "Dollar";
    TokenType[TokenType["FairMathAdd"] = 51] = "FairMathAdd";
    TokenType[TokenType["FairMathSub"] = 52] = "FairMathSub";
})(TokenType || (TokenType = {}));
var SingleLineStream = /** @class */ (function () {
    function SingleLineStream(source) {
        this.lineNum = 0;
        this.linePos = 0;
        this.source = source;
        this.sourceLen = source.length;
        this.lines = source.split(/\r?\n/);
    }
    SingleLineStream.prototype.getLineText = function (n) {
        return this.lines[n !== null && n !== void 0 ? n : this.lineNum];
    };
    SingleLineStream.prototype.gotoNextLine = function () {
        if (this.lineNum < this.lines.length) {
            this.lineNum++;
            this.linePos = 0;
        }
    };
    SingleLineStream.prototype.gotoPrevLine = function () {
        if (this.lineNum > 0) {
            this.lineNum--;
            this.linePos = 0;
        }
    };
    SingleLineStream.prototype.substring = function (from, to) {
        if (to === void 0) { to = this.linePos; }
        return this.lines[this.lineNum].substring(from, to);
    };
    SingleLineStream.prototype.eol = function () {
        return this.linePos === (this.lines[this.lineNum].length);
    };
    SingleLineStream.prototype.eos = function () {
        return this.eol() && (this.lineNum === this.lines.length - 1);
    };
    // should return { line, ch } ?
    SingleLineStream.prototype.pos = function () {
        return { line: this.lineNum, ch: this.linePos };
    };
    SingleLineStream.prototype.line = function () {
        return this.lineNum;
    };
    SingleLineStream.prototype.offset = function () {
        var offset = 0;
        var priorLines = this.lines.slice(0, this.lineNum);
        if (priorLines.length > 0) {
            offset += priorLines.reduce(function (acc, val) { return acc + val.length + 1; }, 0); // + 1 allows for fake 'EOL' tokens
        }
        return (offset + this.linePos);
    };
    SingleLineStream.prototype.lineOffset = function () {
        return this.linePos;
    };
    SingleLineStream.prototype.goBackToOffset = function (pos) {
        this.linePos = pos;
    };
    SingleLineStream.prototype.goBackToPos = function (pos) {
        this.lineNum = pos.line;
        this.linePos = pos.ch;
    };
    SingleLineStream.prototype.goBack = function (n) {
        this.linePos -= n;
    };
    SingleLineStream.prototype.advance = function (n) {
        this.linePos += n;
    };
    SingleLineStream.prototype.nextChar = function () {
        return this.lines[this.lineNum].charCodeAt(this.linePos++) || 0;
    };
    SingleLineStream.prototype.peekChar = function (n) {
        if (n === void 0) { n = 0; }
        return this.lines[this.lineNum].charCodeAt(this.linePos + n) || 0;
    };
    SingleLineStream.prototype.lookbackChar = function (n) {
        if (n === void 0) { n = 0; }
        return this.lines[this.lineNum].charCodeAt(this.linePos - n) || 0;
    };
    SingleLineStream.prototype.advanceIfChar = function (ch) {
        if (ch === this.lines[this.lineNum].charCodeAt(this.linePos)) {
            this.linePos++;
            return true;
        }
        return false;
    };
    SingleLineStream.prototype.onCommandLine = function () {
        return /^(\s*\*[a-z]+)/.test(this.lines[this.lineNum]);
    };
    SingleLineStream.prototype.advanceIfChars = function (ch) {
        if (this.linePos + ch.length > this.source.length) {
            return false;
        }
        var i = 0;
        for (; i < ch.length; i++) {
            if (this.source.charCodeAt(this.linePos + i) !== ch[i]) {
                return false;
            }
        }
        this.advance(i);
        return true;
    };
    SingleLineStream.prototype.advanceWhileLine = function () {
        var posNow = this.linePos;
        var len = this.lines[this.lineNum].length;
        while (this.linePos < len) {
            this.linePos++;
        }
        return this.linePos - posNow;
    };
    SingleLineStream.prototype.advanceWhileChar = function (condition) {
        var posNow = this.linePos;
        var len = this.lines[this.lineNum].length;
        while (this.linePos < len && condition(this.lines[this.lineNum].charCodeAt(this.linePos))) {
            this.linePos++;
        }
        return this.linePos - posNow;
    };
    return SingleLineStream;
}());
export { SingleLineStream };
var MultiLineStream = /** @class */ (function () {
    function MultiLineStream(source) {
        this.source = source;
        this.len = source.length;
        this.position = 0;
    }
    MultiLineStream.prototype.substring = function (from, to) {
        if (to === void 0) { to = this.position; }
        return this.source.substring(from, to);
    };
    MultiLineStream.prototype.eos = function () {
        return this.len <= this.position;
    };
    MultiLineStream.prototype.pos = function () {
        return this.position;
    };
    MultiLineStream.prototype.goBackTo = function (pos) {
        this.position = pos;
    };
    MultiLineStream.prototype.goBack = function (n) {
        this.position -= n;
    };
    MultiLineStream.prototype.advance = function (n) {
        this.position += n;
    };
    MultiLineStream.prototype.nextChar = function () {
        return this.source.charCodeAt(this.position++) || 0;
    };
    MultiLineStream.prototype.peekChar = function (n) {
        if (n === void 0) { n = 0; }
        return this.source.charCodeAt(this.position + n) || 0;
    };
    MultiLineStream.prototype.lookbackChar = function (n) {
        if (n === void 0) { n = 0; }
        return this.source.charCodeAt(this.position - n) || 0;
    };
    MultiLineStream.prototype.advanceIfChar = function (ch) {
        if (ch === this.source.charCodeAt(this.position)) {
            this.position++;
            return true;
        }
        return false;
    };
    MultiLineStream.prototype.advanceIfChars = function (ch) {
        if (this.position + ch.length > this.source.length) {
            return false;
        }
        var i = 0;
        for (; i < ch.length; i++) {
            if (this.source.charCodeAt(this.position + i) !== ch[i]) {
                return false;
            }
        }
        this.advance(i);
        return true;
    };
    MultiLineStream.prototype.advanceWhileChar = function (condition) {
        var posNow = this.position;
        while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
            this.position++;
        }
        return this.position - posNow;
    };
    return MultiLineStream;
}());
export { MultiLineStream };
var _a = 'a'.charCodeAt(0);
var _c = 'c'.charCodeAt(0);
var _e = 'e'.charCodeAt(0);
var _f = 'f'.charCodeAt(0);
var _m = 'm'.charCodeAt(0);
var _n = 'n'.charCodeAt(0);
var _o = 'o'.charCodeAt(0);
var _t = 't'.charCodeAt(0);
var _z = 'z'.charCodeAt(0);
var _A = 'A'.charCodeAt(0);
var _F = 'F'.charCodeAt(0);
var _Z = 'Z'.charCodeAt(0);
var _0 = '0'.charCodeAt(0);
var _9 = '9'.charCodeAt(0);
var _TLD = '~'.charCodeAt(0);
var _HAT = '^'.charCodeAt(0);
var _EQS = '='.charCodeAt(0);
var _PIP = '|'.charCodeAt(0);
var _MIN = '-'.charCodeAt(0);
var _ADD = '+'.charCodeAt(0);
var _USC = '_'.charCodeAt(0);
var _PRC = '%'.charCodeAt(0);
var _MUL = '*'.charCodeAt(0);
var _LPA = '('.charCodeAt(0);
var _RPA = ')'.charCodeAt(0);
var _LAN = '<'.charCodeAt(0);
var _RAN = '>'.charCodeAt(0);
var _ATS = '@'.charCodeAt(0);
var _HSH = '#'.charCodeAt(0);
var _DLR = '$'.charCodeAt(0);
var _BSL = '\\'.charCodeAt(0);
var _FSL = '/'.charCodeAt(0);
var _NWL = '\n'.charCodeAt(0);
var _CAR = '\r'.charCodeAt(0);
var _LFD = '\f'.charCodeAt(0);
var _DQO = '"'.charCodeAt(0);
var _SQO = '\''.charCodeAt(0);
var _WSP = ' '.charCodeAt(0);
var _TAB = '\t'.charCodeAt(0);
var _SEM = ';'.charCodeAt(0);
var _COL = ':'.charCodeAt(0);
var _CUL = '{'.charCodeAt(0);
var _CUR = '}'.charCodeAt(0);
var _BRL = '['.charCodeAt(0);
var _BRR = ']'.charCodeAt(0);
var _CMA = ','.charCodeAt(0);
var _DOT = '.'.charCodeAt(0);
var _BNG = '!'.charCodeAt(0);
var _QUM = '?'.charCodeAt(0);
var _AST = '*'.charCodeAt(0);
var staticTokenTable = {};
staticTokenTable[_SEM] = TokenType.SemiColon;
staticTokenTable[_COL] = TokenType.Colon;
staticTokenTable[_CUL] = TokenType.CurlyL;
staticTokenTable[_CUR] = TokenType.CurlyR;
staticTokenTable[_BRR] = TokenType.BracketR;
staticTokenTable[_BRL] = TokenType.BracketL;
staticTokenTable[_LPA] = TokenType.ParenthesisL;
staticTokenTable[_RPA] = TokenType.ParenthesisR;
staticTokenTable[_CMA] = TokenType.Comma;
staticTokenTable[_DLR] = TokenType.Dollar;
var staticUnitTable = {};
staticUnitTable['em'] = TokenType.EMS;
staticUnitTable['ex'] = TokenType.EXS;
staticUnitTable['px'] = TokenType.Length;
staticUnitTable['cm'] = TokenType.Length;
staticUnitTable['mm'] = TokenType.Length;
staticUnitTable['in'] = TokenType.Length;
staticUnitTable['pt'] = TokenType.Length;
staticUnitTable['pc'] = TokenType.Length;
staticUnitTable['deg'] = TokenType.Angle;
staticUnitTable['rad'] = TokenType.Angle;
staticUnitTable['grad'] = TokenType.Angle;
staticUnitTable['ms'] = TokenType.Time;
staticUnitTable['s'] = TokenType.Time;
staticUnitTable['hz'] = TokenType.Freq;
staticUnitTable['khz'] = TokenType.Freq;
staticUnitTable['%'] = TokenType.Percentage;
staticUnitTable['fr'] = TokenType.Percentage;
staticUnitTable['dpi'] = TokenType.Resolution;
staticUnitTable['dpcm'] = TokenType.Resolution;
var ChoiceScriptScanner = /** @class */ (function () {
    function ChoiceScriptScanner() {
        this.stream = new SingleLineStream('');
        this.ignoreComment = true;
        this.ignoreWhitespace = true;
        this.isNewLine = true;
        this.currentLineType = null;
    }
    ChoiceScriptScanner.prototype.setSource = function (input) {
        this.stream = new SingleLineStream(input);
    };
    ChoiceScriptScanner.prototype.finishToken = function (pos, type, text) {
        var len = (this.stream.lineOffset() - pos.ch);
        return {
            pos: pos,
            len: len || 1,
            offset: this.stream.offset() - len,
            type: type,
            text: text || this.stream.substring(pos.ch)
        };
    };
    ChoiceScriptScanner.prototype.pos = function () {
        return this.stream.pos();
    };
    ChoiceScriptScanner.prototype.goBackToPos = function (pos) {
        this.stream.goBackToPos(pos);
    };
    ChoiceScriptScanner.prototype.scan = function () {
        // End of file/input
        if (this.stream.eos()) {
            return this.finishToken(this.stream.pos(), TokenType.EOF);
        }
        var token = this.scanLine(this.stream.line());
        //console.log(token);
        return token;
    };
    ChoiceScriptScanner.prototype.scanLine = function (line) {
        if (this.stream.eol()) {
            var pos = this.stream.pos();
            this.isNewLine = true;
            var token = this.finishToken(pos, TokenType.EOL, '\n'); // pseudo line break
            this.stream.gotoNextLine();
            return token;
        }
        return this.scanNext(this.stream.pos());
    };
    ChoiceScriptScanner.prototype.scanNext = function (pos) {
        // Indentation
        if (pos.ch === 0) {
            if (this._whitespace()) {
                return this.finishToken(pos, TokenType.Indentation);
            }
        }
        // Line Type
        if (this.isNewLine) {
            if (this.stream.advanceIfChars([_AST, _c, _o, _m, _m, _e, _n, _t])) {
                var n = this.stream.advanceWhileLine();
                return this.finishToken(pos, TokenType.SingleLineComment);
            }
            else if (this.stream.peekChar() === _AST &&
                /\w+/.test(String.fromCharCode(this.stream.peekChar(1)))) {
                this.currentLineType = LineType.CommandLine;
            }
            else {
                this.currentLineType = LineType.TextLine;
                //throw new Error("Invalid line type in Scanner.");
            }
            this.isNewLine = false;
        }
        if (!this.currentLineType) {
            throw new Error("Scanner doesn't recognize this line type.");
        }
        var content = [];
        // Command
        if (this.currentLineType === LineType.CommandLine) {
            if (this.stream.advanceIfChar(_MUL)) {
                return this.finishToken(pos, TokenType.Asterisk, '*');
            }
            else if (this.ident(content)) {
                return this.finishToken(pos, TokenType.Ident, content.join(''));
            }
            else if (this._string(content)) {
                return this.finishToken(pos, TokenType.String, content.join(''));
            }
            else if (this._fastMathOp()) {
                this.stream.advance(1);
                return this.finishToken(pos, this.stream.advanceIfChar(_MIN) ?
                    TokenType.FairMathSub : (this.stream.advance(1), TokenType.FairMathAdd), content.join(''));
            }
        }
        else if (this.currentLineType === LineType.TextLine) {
            if (this.stream.advanceIfChar(_HSH)) {
                return this.finishToken(pos, TokenType.Hash);
            }
            else if (this._word()) {
                return this.finishToken(pos, TokenType.Word);
            }
            //throw new Error(`Scanner failed to parse TextLine at offset ${this.stream.lineOffset()}:\n\t` + this.stream.getLineText());
        }
        if (this._whitespace()) {
            return this.finishToken(pos, TokenType.Whitespace);
        }
        else if (this._number()) {
            return this.finishToken(pos, TokenType.Num);
        }
        else {
            // Brackets, commas, etc.
            var tokenType = staticTokenTable[this.stream.peekChar()];
            if (typeof tokenType !== 'undefined') {
                this.stream.advance(1);
                return this.finishToken(pos, tokenType);
            }
            // anything else
            this.stream.nextChar();
            return this.finishToken(pos, TokenType.Char);
        }
        // throw new Error("unreachable");
    };
    ChoiceScriptScanner.prototype.trivia = function () {
        while (true) {
            var pos = this.stream.pos();
            if (this._whitespace()) {
                if (!this.ignoreWhitespace) {
                    return this.finishToken(pos, TokenType.Whitespace);
                }
            }
            else if (this.comment()) {
                if (!this.ignoreComment) {
                    return this.finishToken(pos, TokenType.Comment);
                }
            }
            else {
                return null;
            }
        }
    };
    ChoiceScriptScanner.prototype._stringChar = function (closeQuote, result) {
        // not closeQuote, not backslash, not newline
        var ch = this.stream.peekChar();
        if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR && ch !== _LFD && ch !== _NWL) {
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype._string = function (result) {
        if (this.stream.peekChar() === _DQO) {
            var closeQuote = this.stream.nextChar();
            result.push(String.fromCharCode(closeQuote));
            while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
                // loop
            }
            if (this.stream.peekChar() === closeQuote) {
                this.stream.nextChar();
                result.push(String.fromCharCode(closeQuote));
                return TokenType.String;
            }
            else {
                return TokenType.BadString;
            }
        }
        return null;
    };
    ChoiceScriptScanner.prototype._word = function () {
        var npeek = 0, ch;
        ch = this.stream.peekChar(npeek);
        if ((ch >= _A && ch <= _Z) ||
            (ch >= _a && ch <= _z) ||
            (ch >= 0x00C0 && ch <= 0x017F)) { // nonascii
            this.stream.advance(npeek + 1);
            this.stream.advanceWhileChar(function (ch) {
                return ((ch >= _A && ch <= _Z) ||
                    (ch >= _a && ch <= _z) ||
                    (ch >= 0x00C0 && ch <= 0x017F) ||
                    (ch === _SQO)); // FIXME: Handle apostrophes with some measure of grace
            });
            return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype._fastMathOp = function () {
        var npeek = 0, ch;
        if (this.stream.peekChar() === _PRC) {
            npeek = 1;
            ch = this.stream.peekChar(npeek);
            return ((ch === _ADD) || (ch === _MIN));
        }
        return false;
    };
    ChoiceScriptScanner.prototype._number = function () {
        var npeek = 0, ch;
        if (this.stream.peekChar() === _DOT) {
            npeek = 1;
        }
        ch = this.stream.peekChar(npeek);
        if (ch >= _0 && ch <= _9) {
            this.stream.advance(npeek + 1);
            this.stream.advanceWhileChar(function (ch) {
                return ch >= _0 && ch <= _9 || npeek === 0 && ch === _DOT;
            });
            return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype._whitespace = function () {
        var n = this.stream.advanceWhileChar(function (ch) {
            return ch === _WSP || ch === _TAB;
            /*const n = this.stream.advanceWhileChar((ch) => {
                return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;*/
        });
        return n > 0;
    };
    ChoiceScriptScanner.prototype._name = function (result) {
        var matched = false;
        while (this._identChar(result) || this._escape(result)) {
            matched = true;
        }
        return matched;
    };
    // FIXME: The way we try to ignore words is *horrible*
    ChoiceScriptScanner.prototype.ident = function (result) {
        if (this._identFirstChar(result)) {
            while (this._identChar(result)) {
                // loop
            }
            return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype._identFirstChar = function (result) {
        var ch = this.stream.peekChar();
        if (ch >= _a && ch <= _z || // a-z
            ch >= _A && ch <= _Z) {
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype._identChar = function (result) {
        var ch = this.stream.peekChar();
        if (ch === _USC || // _
            ch >= _a && ch <= _z || // a-z
            ch >= _A && ch <= _Z || // A-Z
            ch >= _0 && ch <= _9) { // 0/9
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype._escape = function (result, includeNewLines) {
        var ch = this.stream.peekChar();
        if (ch === _BSL) {
            this.stream.advance(1);
            ch = this.stream.peekChar();
            var hexNumCount = 0;
            while (hexNumCount < 6 && (ch >= _0 && ch <= _9 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
                this.stream.advance(1);
                ch = this.stream.peekChar();
                hexNumCount++;
            }
            if (hexNumCount > 0) {
                try {
                    var hexVal = parseInt(this.stream.substring(this.stream.offset() - hexNumCount), 16);
                    if (hexVal) {
                        result.push(String.fromCharCode(hexVal));
                    }
                }
                catch (e) {
                    // ignore
                }
                // optional whitespace or new line, not part of result text
                if (ch === _WSP || ch === _TAB) {
                    this.stream.advance(1);
                }
                else {
                    this._newline([]);
                }
                return true;
            }
            if (ch !== _CAR && ch !== _LFD && ch !== _NWL) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            else if (includeNewLines) {
                return this._newline(result);
            }
        }
        return false;
    };
    ChoiceScriptScanner.prototype._newline = function (result) {
        var ch = this.stream.peekChar();
        switch (ch) {
            case _CAR:
            case _LFD:
            case _NWL:
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                if (ch === _CAR && this.stream.advanceIfChar(_NWL)) {
                    result.push('\n');
                }
                return true;
        }
        return false;
    };
    ChoiceScriptScanner.prototype.comment = function () {
        if (this.stream.advanceIfChars([_FSL, _MUL])) {
            var success_1 = false, hot_1 = false;
            this.stream.advanceWhileChar(function (ch) {
                if (hot_1 && ch === _FSL) {
                    success_1 = true;
                    return false;
                }
                hot_1 = ch === _MUL;
                return true;
            });
            if (success_1) {
                this.stream.advance(1);
            }
            return true;
        }
        return false;
    };
    return ChoiceScriptScanner;
}());
export { ChoiceScriptScanner };
var Scanner = /** @class */ (function () {
    function Scanner() {
        this.stream = new MultiLineStream('');
        this.ignoreComment = true;
        this.ignoreWhitespace = true;
        this.inURL = false;
        this.newLine = true;
    }
    Scanner.prototype.setSource = function (input) {
        this.stream = new MultiLineStream(input);
    };
    Scanner.prototype.finishToken = function (offset, type, text) {
        return {
            offset: offset,
            len: this.stream.pos() - offset,
            type: type,
            text: text || this.stream.substring(offset)
        };
    };
    Scanner.prototype.substring = function (offset, len) {
        return this.stream.substring(offset, offset + len);
    };
    Scanner.prototype.pos = function () {
        return this.stream.pos();
    };
    Scanner.prototype.goBackTo = function (pos) {
        this.stream.goBackTo(pos);
    };
    Scanner.prototype.scanUnquotedString = function () {
        var offset = this.stream.pos();
        var content = [];
        if (this._unquotedString(content)) {
            return this.finishToken(offset, TokenType.UnquotedString, content.join(''));
        }
        return null;
    };
    Scanner.prototype.scan = function () {
        // processes all whitespaces and comments... BUT NOT NEW LINES (or does it now?! CJW)
        var triviaToken = this.trivia();
        if (triviaToken !== null) {
            return triviaToken;
        }
        var offset = this.stream.pos();
        // End of file/input
        if (this.stream.eos()) {
            return this.finishToken(offset, TokenType.EOF);
        }
        return this.scanNext(offset);
    };
    Scanner.prototype.scanNext = function (offset) {
        var content = [];
        // don't ignore WS at the beginning of a line
        if (this.newLine) {
            while (this._whitespace()) {
                return this.finishToken(offset, TokenType.Indentation);
            }
            this.newLine = false;
        }
        // newlines
        if (this._newline(content)) {
            this.newLine = true;
            return this.finishToken(offset, TokenType.EOL, content.join(''));
        }
        // Comment
        if (this.stream.advanceIfChars([_MUL, _c, _o, _m, _m, _e, _n, _t])) {
            return this.finishToken(offset, TokenType.SingleLineComment);
        }
        else if (this.stream.advanceIfChar(_MUL)) {
            return this.finishToken(offset, TokenType.Asterisk, '*');
        }
        // Command
        if (this.ident(content)) {
            return this.finishToken(offset, TokenType.Ident, content.join(''));
        }
        else if (this._word()) {
            return this.finishToken(offset, TokenType.Word);
        }
        else if (this._number()) {
            return this.finishToken(offset, TokenType.Num, content.join(''));
        }
        else if (content.length === 1) {
            return this.finishToken(offset, TokenType.Delim);
        }
        // String, BadString
        content = [];
        var tokenType = this._string(content);
        if (tokenType !== null) {
            return this.finishToken(offset, tokenType, content.join(''));
        }
        // hash
        if (this.stream.advanceIfChar(_HSH)) {
            return this.finishToken(offset, TokenType.Hash);
        }
        // Numbers
        if (this._number()) {
            var pos = this.stream.pos();
            content = [this.stream.substring(offset, pos)];
            if (this.stream.advanceIfChar(_PRC)) {
                // Percentage 43%
                return this.finishToken(offset, TokenType.Percentage);
            }
            else if (this.ident(content)) {
                var dim = this.stream.substring(pos).toLowerCase();
                var tokenType_1 = staticUnitTable[dim];
                if (typeof tokenType_1 !== 'undefined') {
                    // Known dimension 43px
                    return this.finishToken(offset, tokenType_1, content.join(''));
                }
                else {
                    // Unknown dimension 43ft
                    return this.finishToken(offset, TokenType.Dimension, content.join(''));
                }
            }
            return this.finishToken(offset, TokenType.Num);
        }
        // Fairmath Operators
        if (this._fastMathOp()) {
            this.stream.advance(1);
            return this.finishToken(offset, this.stream.advanceIfChar(_MIN) ?
                TokenType.FairMathSub : (this.stream.advance(1), TokenType.FairMathAdd), content.join(''));
        }
        // Brackets, commas, etc.
        tokenType = staticTokenTable[this.stream.peekChar()];
        if (typeof tokenType !== 'undefined') {
            this.stream.advance(1);
            return this.finishToken(offset, tokenType);
        }
        // Delim
        this.stream.nextChar();
        return this.finishToken(offset, TokenType.Delim);
    };
    Scanner.prototype.trivia = function () {
        while (!this.newLine) {
            var offset = this.stream.pos();
            if (this._whitespace()) {
                if (!this.ignoreWhitespace) {
                    return this.finishToken(offset, TokenType.Whitespace);
                }
            }
            else if (this.comment()) {
                if (!this.ignoreComment) {
                    return this.finishToken(offset, TokenType.Comment);
                }
            }
            else {
                return null;
            }
        }
        return null;
    };
    Scanner.prototype.comment = function () {
        if (this.stream.advanceIfChars([_FSL, _MUL])) {
            var success_2 = false, hot_2 = false;
            this.stream.advanceWhileChar(function (ch) {
                if (hot_2 && ch === _FSL) {
                    success_2 = true;
                    return false;
                }
                hot_2 = ch === _MUL;
                return true;
            });
            if (success_2) {
                this.stream.advance(1);
            }
            return true;
        }
        return false;
    };
    Scanner.prototype._fastMathOp = function () {
        var ch;
        if (this.stream.peekChar() === _PRC) {
            ch = this.stream.peekChar(1);
            return ((ch === _ADD) || (ch === _MIN));
        }
        return false;
    };
    Scanner.prototype._number = function () {
        var npeek = 0, ch;
        if (this.stream.peekChar() === _DOT) {
            npeek = 1;
        }
        ch = this.stream.peekChar(npeek);
        if (ch >= _0 && ch <= _9) {
            this.stream.advance(npeek + 1);
            this.stream.advanceWhileChar(function (ch) {
                return ch >= _0 && ch <= _9 || npeek === 0 && ch === _DOT;
            });
            return true;
        }
        return false;
    };
    Scanner.prototype._word = function () {
        var npeek = 0, ch;
        ch = this.stream.peekChar(npeek);
        if ((ch >= _A && ch <= _Z) ||
            (ch >= _a && ch <= _z) ||
            (ch >= 0x00C0 && ch <= 0x017F)) { // nonascii
            this.stream.advance(npeek + 1);
            this.stream.advanceWhileChar(function (ch) {
                return ((ch >= _A && ch <= _Z) ||
                    (ch >= _a && ch <= _z) ||
                    (ch >= 0x00C0 && ch <= 0x017F) ||
                    (ch === _SQO)); // FIXME: Handle apostrophes with some measure of grace
            });
            return true;
        }
        return false;
    };
    Scanner.prototype._newline = function (result) {
        var ch = this.stream.peekChar();
        switch (ch) {
            case _CAR:
            case _LFD:
            case _NWL:
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                if (ch === _CAR && this.stream.advanceIfChar(_NWL)) {
                    result.push('\n');
                }
                return true;
        }
        return false;
    };
    Scanner.prototype._escape = function (result, includeNewLines) {
        var ch = this.stream.peekChar();
        if (ch === _BSL) {
            this.stream.advance(1);
            ch = this.stream.peekChar();
            var hexNumCount = 0;
            while (hexNumCount < 6 && (ch >= _0 && ch <= _9 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
                this.stream.advance(1);
                ch = this.stream.peekChar();
                hexNumCount++;
            }
            if (hexNumCount > 0) {
                try {
                    var hexVal = parseInt(this.stream.substring(this.stream.pos() - hexNumCount), 16);
                    if (hexVal) {
                        result.push(String.fromCharCode(hexVal));
                    }
                }
                catch (e) {
                    // ignore
                }
                // optional whitespace or new line, not part of result text
                if (ch === _WSP || ch === _TAB) {
                    this.stream.advance(1);
                }
                else {
                    this._newline([]);
                }
                return true;
            }
            if (ch !== _CAR && ch !== _LFD && ch !== _NWL) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            else if (includeNewLines) {
                return this._newline(result);
            }
        }
        return false;
    };
    Scanner.prototype._stringChar = function (closeQuote, result) {
        // not closeQuote, not backslash, not newline
        var ch = this.stream.peekChar();
        if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR && ch !== _LFD && ch !== _NWL) {
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    Scanner.prototype._string = function (result) {
        return null;
        if (this.stream.peekChar() === _SQO || this.stream.peekChar() === _DQO) {
            var closeQuote = this.stream.nextChar();
            result.push(String.fromCharCode(closeQuote));
            while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
                // loop
            }
            if (this.stream.peekChar() === closeQuote) {
                this.stream.nextChar();
                result.push(String.fromCharCode(closeQuote));
                return TokenType.String;
            }
            else {
                return TokenType.BadString;
            }
        }
        return null;
    };
    Scanner.prototype._unquotedChar = function (result) {
        // not closeQuote, not backslash, not newline
        var ch = this.stream.peekChar();
        if (ch !== 0 && ch !== _BSL && ch !== _SQO && ch !== _DQO && ch !== _LPA && ch !== _RPA && ch !== _WSP && ch !== _TAB && ch !== _NWL && ch !== _LFD && ch !== _CAR) {
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    Scanner.prototype._unquotedString = function (result) {
        var hasContent = false;
        while (this._unquotedChar(result) || this._escape(result)) {
            hasContent = true;
        }
        return hasContent;
    };
    Scanner.prototype._whitespace = function () {
        var n = this.stream.advanceWhileChar(function (ch) {
            return ch === _WSP || ch === _TAB;
            /*const n = this.stream.advanceWhileChar((ch) => {
                return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;*/
        });
        return n > 0;
    };
    Scanner.prototype._name = function (result) {
        var matched = false;
        while (this._identChar(result) || this._escape(result)) {
            matched = true;
        }
        return matched;
    };
    // FIXME: The way we try to ignore words is *horrible*
    Scanner.prototype.ident = function (result) {
        var pos = this.stream.pos();
        if (this._identFirstChar(result)) {
            while (this._identChar(result)) {
                // loop
            }
            var ch = this.stream.peekChar();
            // If a none ASCII char follows, it's probably a word
            if (ch >= 0x00C0 && ch <= 0x017F) {
                return false;
            }
            switch (ch) {
                case _SQO: // apostrophe's are words
                    this.stream.goBackTo(pos);
                    return false;
                default:
                    return true;
            }
            return true;
        }
        return false;
    };
    Scanner.prototype._identFirstChar = function (result) {
        var ch = this.stream.peekChar();
        if (ch >= _a && ch <= _z || // a-z
            ch >= _A && ch <= _Z) {
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    Scanner.prototype._identChar = function (result) {
        var ch = this.stream.peekChar();
        if (ch === _USC || // _
            ch >= _a && ch <= _z || // a-z
            ch >= _A && ch <= _Z || // A-Z
            ch >= _0 && ch <= _9) { // 0/9
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    Scanner.prototype._minus = function (result) {
        var ch = this.stream.peekChar();
        if (ch === _MIN) {
            this.stream.advance(1);
            result.push(String.fromCharCode(ch));
            return true;
        }
        return false;
    };
    return Scanner;
}());
export { Scanner };
