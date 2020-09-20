/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Line } from "./ChoiceScriptNodes";
import { turquoise } from "color-name";

export enum LineType {
	CommentLine,
	OptionLine,
	CommandLine,
	TextLine,
}

export enum TokenType {
	Char,
	Ident,
	AtKeyword,
	Asterisk,
	String,
	BadString,
	UnquotedString,
	Hash,
	Num,
	Percentage,
	Dimension,
	UnicodeRange,
	CDO, // <!--
	CDC, // -->
	Colon,
	SemiColon,
	CurlyL,
	CurlyR,
	ParenthesisL,
	ParenthesisR,
	BracketL,
	BracketR,
	Indentation,
	Whitespace,
	Includes,
	Dashmatch, // |=
	SubstringOperator, // *=
	PrefixOperator, // ^=
	SuffixOperator, // $=
	Delim,
	EMS, // 3em
	EXS, // 3ex
	Length,
	Angle,
	Time,
	Freq,
	Exclamation,
	Resolution,
	Comma,
	Charset,
	EscapedJavaScript,
	BadEscapedJavaScript,
	Comment,
	SingleLineComment,
	EOF,
	EOL,
	CustomToken,
	Builtin,
	Invalid,
	Word,
	Dollar,
	FairMathAdd,
	FairMathSub
}

export interface IToken {
	type: TokenType;
	text: string;
	offset: number;
	len: number;
}

export interface ITokenCS {
	type: TokenType;
	text: string;
	offset: number;
	pos: { line: number, ch: number };
	len: number;
}

export class SingleLineStream {
	private source: string;
	private sourceLen: number;
	private lines: string[];
	private lineNum: number = 0;
	private linePos: number = 0;

	constructor(source: string) {
		this.source = source;
		this.sourceLen = source.length;
		this.lines = source.split(/\r?\n/);
	}

	public getLineText(n?: number) {
		return this.lines[n??this.lineNum];
	}

	public gotoNextLine() {
		if (this.lineNum < this.lines.length) {
			this.lineNum++;
			this.linePos = 0;
		}
	}

	public gotoPrevLine() {
		if (this.lineNum > 0) {
			this.lineNum--;
			this.linePos = 0;
		}
	}

	public substring(from: number, to: number = this.linePos): string {
		return this.lines[this.lineNum].substring(from, to);
	}

	public eol(): boolean {
		return this.linePos === (this.lines[this.lineNum].length);
	}

	public eos(): boolean {
		return this.eol() && (this.lineNum === this.lines.length - 1);
	}

	// should return { line, ch } ?
	public pos(): { line: number, ch: number } {
		return { line: this.lineNum, ch: this.linePos };
	}

	public line(): number {
		return this.lineNum;
	}

	public offset(): number {
		let offset = 0;
		let priorLines = this.lines.slice(0, this.lineNum);
		if (priorLines.length > 0) {
			offset += priorLines.reduce((acc,val) => acc + val.length + 1, 0); // + 1 allows for fake 'EOL' tokens
		}
		return (offset + this.linePos);
	}

	public lineOffset(): number {
		return this.linePos;
	}

	public goBackToOffset(pos: number): void {
		this.linePos = pos;
	}

	public goBackToPos(pos: { line: number, ch: number }): void {
		this.lineNum = pos.line;
		this.linePos = pos.ch;
	}

	public goBack(n: number): void {
		this.linePos -= n;
	}

	public advance(n: number): void {
		this.linePos += n;
	}

	public nextChar(): number {
		return this.lines[this.lineNum].charCodeAt(this.linePos++) || 0;
	}

	public peekChar(n: number = 0): number {
		return this.lines[this.lineNum].charCodeAt(this.linePos + n) || 0;
	}

	public lookbackChar(n: number = 0): number {
		return this.lines[this.lineNum].charCodeAt(this.linePos - n) || 0;
	}

	public advanceIfChar(ch: number): boolean {
		if (ch === this.lines[this.lineNum].charCodeAt(this.linePos)) {
			this.linePos++;
			return true;
		}
		return false;
	}

	public onCommandLine(): boolean {
		return /^(\s*\*[a-z]+)/.test(this.lines[this.lineNum]);
	}

	public advanceIfChars(ch: number[]): boolean {
		if (this.linePos + ch.length > this.source.length) {
			return false;
		}
		let i = 0;
		for (; i < ch.length; i++) {
			if (this.source.charCodeAt(this.linePos + i) !== ch[i]) {
				return false;
			}
		}
		this.advance(i);
		return true;
	}

	public advanceWhileLine(): number {
		const posNow = this.linePos;
		let len = this.lines[this.lineNum].length;
		while (this.linePos < len) {
			this.linePos++;
		}
		return this.linePos - posNow;
	}

	public advanceWhileChar(condition: (ch: number) => boolean): number {
		const posNow = this.linePos;
		let len = this.lines[this.lineNum].length;
		while (this.linePos < len && condition(this.lines[this.lineNum].charCodeAt(this.linePos))) {
			this.linePos++;
		}
		return this.linePos - posNow;
	}

}

export class MultiLineStream {

	private source: string;
	private len: number;
	private position: number;

	constructor(source: string) {
		this.source = source;
		this.len = source.length;
		this.position = 0;
	}

	public substring(from: number, to: number = this.position): string {
		return this.source.substring(from, to);
	}

	public eos(): boolean {
		return this.len <= this.position;
	}

	public pos(): number {
		return this.position;
	}

	public goBackTo(pos: number): void {
		this.position = pos;
	}

	public goBack(n: number): void {
		this.position -= n;
	}

	public advance(n: number): void {
		this.position += n;
	}

	public nextChar(): number {
		return this.source.charCodeAt(this.position++) || 0;
	}

	public peekChar(n: number = 0): number {
		return this.source.charCodeAt(this.position + n) || 0;
	}

	public lookbackChar(n: number = 0): number {
		return this.source.charCodeAt(this.position - n) || 0;
	}

	public advanceIfChar(ch: number): boolean {
		if (ch === this.source.charCodeAt(this.position)) {
			this.position++;
			return true;
		}
		return false;
	}

	public advanceIfChars(ch: number[]): boolean {
		if (this.position + ch.length > this.source.length) {
			return false;
		}
		let i = 0;
		for (; i < ch.length; i++) {
			if (this.source.charCodeAt(this.position + i) !== ch[i]) {
				return false;
			}
		}
		this.advance(i);
		return true;
	}

	public advanceWhileChar(condition: (ch: number) => boolean): number {
		const posNow = this.position;
		while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
			this.position++;
		}
		return this.position - posNow;
	}
}

const _a = 'a'.charCodeAt(0);
const _c = 'c'.charCodeAt(0);
const _e = 'e'.charCodeAt(0);
const _f = 'f'.charCodeAt(0);
const _m = 'm'.charCodeAt(0);
const _n = 'n'.charCodeAt(0);
const _o = 'o'.charCodeAt(0);
const _t = 't'.charCodeAt(0);
const _z = 'z'.charCodeAt(0);
const _A = 'A'.charCodeAt(0);
const _F = 'F'.charCodeAt(0);
const _Z = 'Z'.charCodeAt(0);
const _0 = '0'.charCodeAt(0);
const _9 = '9'.charCodeAt(0);
const _TLD = '~'.charCodeAt(0);
const _HAT = '^'.charCodeAt(0);
const _EQS = '='.charCodeAt(0);
const _PIP = '|'.charCodeAt(0);
const _MIN = '-'.charCodeAt(0);
const _ADD = '+'.charCodeAt(0);
const _USC = '_'.charCodeAt(0);
const _PRC = '%'.charCodeAt(0);
const _MUL = '*'.charCodeAt(0);
const _LPA = '('.charCodeAt(0);
const _RPA = ')'.charCodeAt(0);
const _LAN = '<'.charCodeAt(0);
const _RAN = '>'.charCodeAt(0);
const _ATS = '@'.charCodeAt(0);
const _HSH = '#'.charCodeAt(0);
const _DLR = '$'.charCodeAt(0);
const _BSL = '\\'.charCodeAt(0);
const _FSL = '/'.charCodeAt(0);
const _NWL = '\n'.charCodeAt(0);
const _CAR = '\r'.charCodeAt(0);
const _LFD = '\f'.charCodeAt(0);
const _DQO = '"'.charCodeAt(0);
const _SQO = '\''.charCodeAt(0);
const _WSP = ' '.charCodeAt(0);
const _TAB = '\t'.charCodeAt(0);
const _SEM = ';'.charCodeAt(0);
const _COL = ':'.charCodeAt(0);
const _CUL = '{'.charCodeAt(0);
const _CUR = '}'.charCodeAt(0);
const _BRL = '['.charCodeAt(0);
const _BRR = ']'.charCodeAt(0);
const _CMA = ','.charCodeAt(0);
const _DOT = '.'.charCodeAt(0);
const _BNG = '!'.charCodeAt(0);
const _QUM = '?'.charCodeAt(0);
const _AST = '*'.charCodeAt(0);

const staticTokenTable: { [code: number]: TokenType; } = {};
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

const staticUnitTable: { [code: string]: TokenType; } = {};
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


export class ChoiceScriptScanner {
	public stream: SingleLineStream = new SingleLineStream('');
	public ignoreComment = true;
	public ignoreWhitespace = true;
	public isNewLine = true;
	public currentLineType: LineType | null = null;

	public setSource(input: string): void {
		this.stream = new SingleLineStream(input);
	}

	public finishToken(pos: { line: number, ch: number}, type: TokenType, text?: string): ITokenCS {
		let len = (this.stream.lineOffset() - pos.ch);
		return {
			pos: pos,
			len: len || 1, // '1' is a special-case for fake EOLs
			offset: this.stream.offset() - len,
			type: type,
			text: text || this.stream.substring(pos.ch)
		};
	}

	public pos() {
		return this.stream.pos();
	}

	public goBackToPos(pos: {line: number, ch: number}) {
		this.stream.goBackToPos(pos);
	}

	public scan(): ITokenCS {
		// End of file/input
		if (this.stream.eos()) {
			return this.finishToken(this.stream.pos(), TokenType.EOF);
		}
		let token = this.scanLine(this.stream.line());
		//console.log(token);
		return token;
	}

	protected scanLine(line: number): ITokenCS {
		if (this.stream.eol()) {
			let pos = this.stream.pos();
			this.isNewLine = true;
			let token = this.finishToken(pos, TokenType.EOL, '\n'); // pseudo line break
			this.stream.gotoNextLine();
			return token;
		}
		return this.scanNext(this.stream.pos());
	}

	protected scanNext(pos: {line: number, ch: number}): ITokenCS {

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
			} else if (this.stream.peekChar() === _AST &&
				/\w+/.test(String.fromCharCode(this.stream.peekChar(1)))) {
				this.currentLineType = LineType.CommandLine;
			} else {
				this.currentLineType = LineType.TextLine;
				//throw new Error("Invalid line type in Scanner.");
			}
			this.isNewLine = false;
		}

		if (!this.currentLineType) {
			throw new Error("Scanner doesn't recognize this line type.");
		}

		let content: string[] = [];
		// Command
		if (this.currentLineType === LineType.CommandLine) {
			if (this.stream.advanceIfChar(_MUL)) {
				return this.finishToken(pos, TokenType.Asterisk, '*');
			} else if (this.ident(content)) {
				return this.finishToken(pos, TokenType.Ident, content.join(''));
			} else if (this._string(content)) {
				return this.finishToken(pos, TokenType.String, content.join(''));
			} else if (this._fastMathOp()) {
				this.stream.advance(1);
				return this.finishToken(pos, 
					this.stream.advanceIfChar(_MIN) ? 
						TokenType.FairMathSub : (this.stream.advance(1), TokenType.FairMathAdd),
					content.join('')
				);
			}
		} else if (this.currentLineType === LineType.TextLine) {
			if (this.stream.advanceIfChar(_HSH)) {
				return this.finishToken(pos, TokenType.Hash);
			} else if (this._word()) {
				return this.finishToken(pos, TokenType.Word);
			}
			//throw new Error(`Scanner failed to parse TextLine at offset ${this.stream.lineOffset()}:\n\t` + this.stream.getLineText());
		} if (this._whitespace()) {
			return this.finishToken(pos, TokenType.Whitespace);
		} else if (this._number()) {
			return this.finishToken(pos, TokenType.Num);
		} else {
			// Brackets, commas, etc.
			let tokenType = <TokenType>staticTokenTable[this.stream.peekChar()];
			if (typeof tokenType !== 'undefined') {
				this.stream.advance(1);
				return this.finishToken(pos, tokenType);
			}

			// anything else
			this.stream.nextChar();
			return this.finishToken(pos, TokenType.Char);
		}
		// throw new Error("unreachable");
	}
	
	protected trivia(): ITokenCS | null {
		while (true) {
			const pos = this.stream.pos();
			if (this._whitespace()) {
				if (!this.ignoreWhitespace) {
					return this.finishToken(pos, TokenType.Whitespace);
				}
			} else if (this.comment()) {
				if (!this.ignoreComment) {
					return this.finishToken(pos, TokenType.Comment);
				}
			} else {
				return null;
			}
		}
	}

	private _stringChar(closeQuote: number, result: string[]) {
		// not closeQuote, not backslash, not newline
		const ch = this.stream.peekChar();
		if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR && ch !== _LFD && ch !== _NWL) {
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}

	private _string(result: string[]): TokenType | null {
		if (this.stream.peekChar() === _DQO) {
			const closeQuote = this.stream.nextChar();
			result.push(String.fromCharCode(closeQuote));

			while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
				// loop
			}

			if (this.stream.peekChar() === closeQuote) {
				this.stream.nextChar();
				result.push(String.fromCharCode(closeQuote));
				return TokenType.String;
			} else {
				return TokenType.BadString;
			}
		}
		return null;
	}

	private _word(): boolean {
		let npeek = 0, ch: number;
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
	}

	private _fastMathOp(): boolean {
		let npeek = 0, ch: number;
		if (this.stream.peekChar() === _PRC) {
			npeek = 1;
			ch = this.stream.peekChar(npeek);
			return ((ch === _ADD) || (ch === _MIN));
		}
		return false;
	}

	private _number(): boolean {
		let npeek = 0, ch: number;
		if (this.stream.peekChar() === _DOT) {
			npeek = 1;
		}
		ch = this.stream.peekChar(npeek);
		if (ch >= _0 && ch <= _9) {
			this.stream.advance(npeek + 1);
			this.stream.advanceWhileChar((ch) => {
				return ch >= _0 && ch <= _9 || npeek === 0 && ch === _DOT;
			});
			return true;
		}
		return false;
	}

	private _whitespace(): boolean {
		let n = this.stream.advanceWhileChar((ch) => {
			return ch === _WSP || ch === _TAB;
		/*const n = this.stream.advanceWhileChar((ch) => {
			return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;*/
		});
		return n > 0;
	}

	private _name(result: string[]): boolean {
		let matched = false;
		while (this._identChar(result) || this._escape(result)) {
			matched = true;
		}
		return matched;
	}

	// FIXME: The way we try to ignore words is *horrible*
	protected ident(result: string[]): boolean {
		if (this._identFirstChar(result)) {
			while (this._identChar(result)) {
				// loop
			}
			return true;
		}
		return false;
	}

	private _identFirstChar(result: string[]): boolean {
		const ch = this.stream.peekChar();
		if (ch >= _a && ch <= _z || // a-z
			ch >= _A && ch <= _Z) {
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}

	private _identChar(result: string[]): boolean {
		const ch = this.stream.peekChar();
		if (ch === _USC || // _
			ch >= _a && ch <= _z || // a-z
			ch >= _A && ch <= _Z || // A-Z
			ch >= _0 && ch <= _9) {  // 0/9
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}

	private _escape(result: string[], includeNewLines?: boolean): boolean {
		let ch = this.stream.peekChar();
		if (ch === _BSL) {
			this.stream.advance(1);
			ch = this.stream.peekChar();
			let hexNumCount = 0;
			while (hexNumCount < 6 && (ch >= _0 && ch <= _9 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
				this.stream.advance(1);
				ch = this.stream.peekChar();
				hexNumCount++;
			}
			if (hexNumCount > 0) {
				try {
					const hexVal = parseInt(this.stream.substring(this.stream.offset() - hexNumCount), 16);
					if (hexVal) {
						result.push(String.fromCharCode(hexVal));
					}
				} catch (e) {
					// ignore
				}

				// optional whitespace or new line, not part of result text
				if (ch === _WSP || ch === _TAB) {
					this.stream.advance(1);
				} else {
					this._newline([]);
				}
				return true;
			}
			if (ch !== _CAR && ch !== _LFD && ch !== _NWL) {
				this.stream.advance(1);
				result.push(String.fromCharCode(ch));
				return true;
			} else if (includeNewLines) {
				return this._newline(result);
			}
		}
		return false;
	}


	private _newline(result: string[]): boolean {
		const ch = this.stream.peekChar();
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
	}

	protected comment(): boolean {
		if (this.stream.advanceIfChars([_FSL, _MUL])) {
			let success = false, hot = false;
			this.stream.advanceWhileChar((ch) => {
				if (hot && ch === _FSL) {
					success = true;
					return false;
				}
				hot = ch === _MUL;
				return true;
			});
			if (success) {
				this.stream.advance(1);
			}
			return true;
		}

		return false;
	}

}

export class Scanner {

	public stream: MultiLineStream = new MultiLineStream('');
	public ignoreComment = true;
	public ignoreWhitespace = true;
	public inURL = false;
	public newLine: boolean = true;

	public setSource(input: string): void {
		this.stream = new MultiLineStream(input);
	}

	public finishToken(offset: number, type: TokenType, text?: string): IToken {
		return {
			offset: offset,
			len: this.stream.pos() - offset,
			type: type,
			text: text || this.stream.substring(offset)
		};
	}

	public substring(offset: number, len: number): string {
		return this.stream.substring(offset, offset + len);
	}

	public pos(): number {
		return this.stream.pos();
	}

	public goBackTo(pos: number): void {
		this.stream.goBackTo(pos);
	}

	public scanUnquotedString(): IToken | null {
		const offset = this.stream.pos();
		const content: string[] = [];
		if (this._unquotedString(content)) {
			return this.finishToken(offset, TokenType.UnquotedString, content.join(''));
		}
		return null;
	}

	public scan(): IToken {
		// processes all whitespaces and comments... BUT NOT NEW LINES (or does it now?! CJW)
		let triviaToken = this.trivia();
		if (triviaToken !== null) {
			return triviaToken;
		}

		const offset = this.stream.pos();

		// End of file/input
		if (this.stream.eos()) {
			return this.finishToken(offset, TokenType.EOF);
		}
		return this.scanNext(offset);
	}

	protected scanNext(offset: number): IToken {

		let content: string[] = [];

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
		} else if (this.stream.advanceIfChar(_MUL)) {
			return this.finishToken(offset, TokenType.Asterisk, '*');
		}

		// Command
		if (this.ident(content)) {
			return this.finishToken(offset, TokenType.Ident, content.join(''));
		} else if (this._word()) {
			return this.finishToken(offset, TokenType.Word);
		} else if (this._number()) {
			return this.finishToken(offset, TokenType.Num, content.join(''));
		} else if (content.length === 1) {
			return this.finishToken(offset, TokenType.Delim);
		}

		// String, BadString
		content = [];
		let tokenType = this._string(content);
		if (tokenType !== null) {
			return this.finishToken(offset, tokenType, content.join(''));
		}

		// hash
		if (this.stream.advanceIfChar(_HSH)) {
			return this.finishToken(offset, TokenType.Hash);
		}
		// Numbers
		if (this._number()) {
			const pos = this.stream.pos();
			content = [this.stream.substring(offset, pos)];
			if (this.stream.advanceIfChar(_PRC)) {
				// Percentage 43%
				return this.finishToken(offset, TokenType.Percentage);
			} else if (this.ident(content)) {
				const dim = this.stream.substring(pos).toLowerCase();
				const tokenType = <TokenType>staticUnitTable[dim];
				if (typeof tokenType !== 'undefined') {
					// Known dimension 43px
					return this.finishToken(offset, tokenType, content.join(''));
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
			return this.finishToken(offset, 
				this.stream.advanceIfChar(_MIN) ? 
					TokenType.FairMathSub : (this.stream.advance(1) ,TokenType.FairMathAdd),
				content.join('')
			);
		}

		// Brackets, commas, etc.
		tokenType = <TokenType>staticTokenTable[this.stream.peekChar()];
		if (typeof tokenType !== 'undefined') {
			this.stream.advance(1);
			return this.finishToken(offset, tokenType);
		}

		// Delim
		this.stream.nextChar();
		return this.finishToken(offset, TokenType.Delim);
	}

	protected trivia(): IToken | null {
		while (!this.newLine) {
			const offset = this.stream.pos();
			if (this._whitespace()) {
				if (!this.ignoreWhitespace) {
					return this.finishToken(offset, TokenType.Whitespace);
				}
			} else if (this.comment()) {
				if (!this.ignoreComment) {
					return this.finishToken(offset, TokenType.Comment);
				}
			} else {
				return null;
			}
		}
		return null;
	}

	protected comment(): boolean {
		if (this.stream.advanceIfChars([_FSL, _MUL])) {
			let success = false, hot = false;
			this.stream.advanceWhileChar((ch) => {
				if (hot && ch === _FSL) {
					success = true;
					return false;
				}
				hot = ch === _MUL;
				return true;
			});
			if (success) {
				this.stream.advance(1);
			}
			return true;
		}

		return false;
	}

	private _fastMathOp(): boolean {
		let ch: number;
		if (this.stream.peekChar() === _PRC) {
			ch = this.stream.peekChar(1);
			return ((ch === _ADD) || (ch === _MIN));			
		}
		return false;
	}

	private _number(): boolean {
		let npeek = 0, ch: number;
		if (this.stream.peekChar() === _DOT) {
			npeek = 1;
		}
		ch = this.stream.peekChar(npeek);
		if (ch >= _0 && ch <= _9) {
			this.stream.advance(npeek + 1);
			this.stream.advanceWhileChar((ch) => {
				return ch >= _0 && ch <= _9 || npeek === 0 && ch === _DOT;
			});
			return true;
		}
		return false;
	}

	private _word(): boolean {
		let npeek = 0, ch: number;
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
	}

	private _newline(result: string[]): boolean {
		const ch = this.stream.peekChar();
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
	}

	private _escape(result: string[], includeNewLines?: boolean): boolean {
		let ch = this.stream.peekChar();
		if (ch === _BSL) {
			this.stream.advance(1);
			ch = this.stream.peekChar();
			let hexNumCount = 0;
			while (hexNumCount < 6 && (ch >= _0 && ch <= _9 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
				this.stream.advance(1);
				ch = this.stream.peekChar();
				hexNumCount++;
			}
			if (hexNumCount > 0) {
				try {
					const hexVal = parseInt(this.stream.substring(this.stream.pos() - hexNumCount), 16);
					if (hexVal) {
						result.push(String.fromCharCode(hexVal));
					}
				} catch (e) {
					// ignore
				}

				// optional whitespace or new line, not part of result text
				if (ch === _WSP || ch === _TAB) {
					this.stream.advance(1);
				} else {
					this._newline([]);
				}
				return true;
			}
			if (ch !== _CAR && ch !== _LFD && ch !== _NWL) {
				this.stream.advance(1);
				result.push(String.fromCharCode(ch));
				return true;
			} else if (includeNewLines) {
				return this._newline(result);
			}
		}
		return false;
	}

	private _stringChar(closeQuote: number, result: string[]) {
		// not closeQuote, not backslash, not newline
		const ch = this.stream.peekChar();
		if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR && ch !== _LFD && ch !== _NWL) {
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}

	private _string(result: string[]): TokenType | null {
		return null;
		if (this.stream.peekChar() === _SQO || this.stream.peekChar() === _DQO) {
			const closeQuote = this.stream.nextChar();
			result.push(String.fromCharCode(closeQuote));

			while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
				// loop
			}

			if (this.stream.peekChar() === closeQuote) {
				this.stream.nextChar();
				result.push(String.fromCharCode(closeQuote));
				return TokenType.String;
			} else {
				return TokenType.BadString;
			}
		}
		return null;
	}

	private _unquotedChar(result: string[]): boolean {
		// not closeQuote, not backslash, not newline
		const ch = this.stream.peekChar();
		if (ch !== 0 && ch !== _BSL && ch !== _SQO && ch !== _DQO && ch !== _LPA && ch !== _RPA && ch !== _WSP && ch !== _TAB && ch !== _NWL && ch !== _LFD && ch !== _CAR) {
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}


	protected _unquotedString(result: string[]): boolean {
		let hasContent = false;
		while (this._unquotedChar(result) || this._escape(result)) {
			hasContent = true;
		}
		return hasContent;
	}

	private _whitespace(): boolean {
		let n = this.stream.advanceWhileChar((ch) => {
			return ch === _WSP || ch === _TAB;
		/*const n = this.stream.advanceWhileChar((ch) => {
			return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;*/
		});
		return n > 0;
	}

	private _name(result: string[]): boolean {
		let matched = false;
		while (this._identChar(result) || this._escape(result)) {
			matched = true;
		}
		return matched;
	}

	// FIXME: The way we try to ignore words is *horrible*
	protected ident(result: string[]): boolean {
		const pos = this.stream.pos();
		if (this._identFirstChar(result)) {
			while (this._identChar(result)) {
				// loop
			}
			const ch = this.stream.peekChar();
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
	}

	private _identFirstChar(result: string[]): boolean {
		const ch = this.stream.peekChar();
		if (ch >= _a && ch <= _z || // a-z
			ch >= _A && ch <= _Z) {
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}

	private _identChar(result: string[]): boolean {
		const ch = this.stream.peekChar();
		if (ch === _USC || // _
			ch >= _a && ch <= _z || // a-z
			ch >= _A && ch <= _Z || // A-Z
			ch >= _0 && ch <= _9) {  // 0/9
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}

	private _minus(result: string[]): boolean {
		const ch = this.stream.peekChar();
		if (ch === _MIN) {
			this.stream.advance(1);
			result.push(String.fromCharCode(ch));
			return true;
		}
		return false;
	}
}
