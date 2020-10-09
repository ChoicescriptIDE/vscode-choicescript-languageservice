export declare enum LineType {
    CommentLine = 0,
    OptionLine = 1,
    CommandLine = 2,
    TextLine = 3
}
export declare enum TokenType {
    Char = 0,
    Ident = 1,
    AtKeyword = 2,
    Asterisk = 3,
    String = 4,
    BadString = 5,
    UnquotedString = 6,
    Hash = 7,
    Num = 8,
    Percentage = 9,
    Dimension = 10,
    UnicodeRange = 11,
    CDO = 12,
    CDC = 13,
    Colon = 14,
    SemiColon = 15,
    CurlyL = 16,
    CurlyR = 17,
    ParenthesisL = 18,
    ParenthesisR = 19,
    BracketL = 20,
    BracketR = 21,
    Indentation = 22,
    Whitespace = 23,
    Includes = 24,
    Dashmatch = 25,
    SubstringOperator = 26,
    PrefixOperator = 27,
    SuffixOperator = 28,
    Delim = 29,
    EMS = 30,
    EXS = 31,
    Length = 32,
    Angle = 33,
    Time = 34,
    Freq = 35,
    Exclamation = 36,
    Resolution = 37,
    Comma = 38,
    Charset = 39,
    EscapedJavaScript = 40,
    BadEscapedJavaScript = 41,
    Comment = 42,
    SingleLineComment = 43,
    EOF = 44,
    EOL = 45,
    CustomToken = 46,
    Builtin = 47,
    Invalid = 48,
    Word = 49,
    Dollar = 50,
    FairMathAdd = 51,
    FairMathSub = 52
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
    pos: {
        line: number;
        ch: number;
    };
    len: number;
}
export declare class SingleLineStream {
    private source;
    private sourceLen;
    private lines;
    private lineNum;
    private linePos;
    constructor(source: string);
    getLineText(n?: number): string;
    gotoNextLine(): void;
    gotoPrevLine(): void;
    substring(from: number, to?: number): string;
    eol(): boolean;
    eos(): boolean;
    pos(): {
        line: number;
        ch: number;
    };
    line(): number;
    offset(): number;
    lineOffset(): number;
    goBackToOffset(pos: number): void;
    goBackToPos(pos: {
        line: number;
        ch: number;
    }): void;
    goBack(n: number): void;
    advance(n: number): void;
    nextChar(): number;
    peekChar(n?: number): number;
    lookbackChar(n?: number): number;
    advanceIfChar(ch: number): boolean;
    onCommandLine(): boolean;
    advanceIfChars(ch: number[]): boolean;
    advanceWhileLine(): number;
    advanceWhileChar(condition: (ch: number) => boolean): number;
}
export declare class MultiLineStream {
    private source;
    private len;
    private position;
    constructor(source: string);
    substring(from: number, to?: number): string;
    eos(): boolean;
    pos(): number;
    goBackTo(pos: number): void;
    goBack(n: number): void;
    advance(n: number): void;
    nextChar(): number;
    peekChar(n?: number): number;
    lookbackChar(n?: number): number;
    advanceIfChar(ch: number): boolean;
    advanceIfChars(ch: number[]): boolean;
    advanceWhileChar(condition: (ch: number) => boolean): number;
}
export declare class ChoiceScriptScanner {
    stream: SingleLineStream;
    ignoreComment: boolean;
    ignoreWhitespace: boolean;
    isNewLine: boolean;
    currentLineType: LineType | null;
    setSource(input: string): void;
    finishToken(pos: {
        line: number;
        ch: number;
    }, type: TokenType, text?: string): ITokenCS;
    pos(): {
        line: number;
        ch: number;
    };
    goBackToPos(pos: {
        line: number;
        ch: number;
    }): void;
    scan(): ITokenCS;
    protected scanLine(line: number): ITokenCS;
    protected scanNext(pos: {
        line: number;
        ch: number;
    }): ITokenCS;
    protected trivia(): ITokenCS | null;
    private _stringChar;
    private _string;
    private _word;
    private _fastMathOp;
    private _number;
    private _whitespace;
    private _name;
    protected ident(result: string[]): boolean;
    private _identFirstChar;
    private _identChar;
    private _escape;
    private _newline;
    protected comment(): boolean;
}
export declare class Scanner {
    stream: MultiLineStream;
    ignoreComment: boolean;
    ignoreWhitespace: boolean;
    inURL: boolean;
    newLine: boolean;
    setSource(input: string): void;
    finishToken(offset: number, type: TokenType, text?: string): IToken;
    substring(offset: number, len: number): string;
    pos(): number;
    goBackTo(pos: number): void;
    scanUnquotedString(): IToken | null;
    scan(): IToken;
    protected scanNext(offset: number): IToken;
    protected trivia(): IToken | null;
    protected comment(): boolean;
    private _fastMathOp;
    private _number;
    private _word;
    private _newline;
    private _escape;
    private _stringChar;
    private _string;
    private _unquotedChar;
    protected _unquotedString(result: string[]): boolean;
    private _whitespace;
    private _name;
    protected ident(result: string[]): boolean;
    private _identFirstChar;
    private _identChar;
    private _minus;
}
