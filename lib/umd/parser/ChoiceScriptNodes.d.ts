import { DocumentUri } from 'vscode-languageserver-types';
export declare enum ChoiceScriptType {
    Number = 0,
    String = 1,
    Boolean = 2
}
export declare enum LineType {
    Text = 0,
    ChoiceScript = 1,
    Comment = 2,
    ChoiceOption = 3
}
export declare enum IndentType {
    Spaces = 0,
    Tab = 1,
    Mixed = 2
}
export declare enum NodeType {
    Undefined = 0,
    ChoiceScriptComment = 1,
    Identifier = 2,
    Scene = 3,
    SceneRef = 4,
    Line = 5,
    Label = 6,
    LabelRef = 7,
    ChoiceScriptLine = 8,
    ChoiceScriptStatement = 9,
    TextLine = 10,
    StringLiteral = 11,
    Operator = 12,
    Expression = 13,
    BinaryExpression = 14,
    StringExpression = 15,
    Term = 16,
    Value = 17,
    RealWord = 18,
    ChoiceCommand = 19,
    ChoiceOption = 20,
    MultiReplace = 21,
    MultiReplaceOption = 22,
    VariableReplacement = 23,
    PrintVariable = 24,
    NumericValue = 25,
    Boolean = 26,
    Indentation = 27,
    VariableDeclaration = 28,
    LabelDeclaration = 29,
    FlowCommand = 30,
    HexColorValue = 31,
    Variable = 32,
    CreateVariable = 33,
    If = 34,
    Else = 35,
    For = 36,
    Each = 37,
    While = 38,
    MixinContentReference = 39,
    MixinContentDeclaration = 40,
    Media = 41,
    Keyframe = 42,
    FontFace = 43,
    Import = 44,
    Namespace = 45,
    Invocation = 46,
    FunctionDeclaration = 47,
    ReturnStatement = 48,
    MediaQuery = 49,
    FunctionParameter = 50,
    FunctionArgument = 51,
    KeyframeSelector = 52,
    ViewPort = 53,
    Document = 54,
    AtApplyRule = 55,
    CustomPropertyDeclaration = 56,
    CustomPropertySet = 57,
    ListEntry = 58,
    Supports = 59,
    SupportsCondition = 60,
    NamespacePrefix = 61,
    GridLine = 62,
    Plugin = 63,
    UnknownAtRule = 64,
    Command = 65,
    StandardCommand = 66,
    InvalidBuiltin = 67
}
export declare enum ReferenceType {
    Label = 0,
    Variable = 1,
    Unknown = 2
}
export declare function getNodeAtOffset(node: Node, offset: number): Node | null;
export declare function getNodePath(node: Node, offset: number): Node[];
export interface ITextProvider {
    (offset: number, length: number): string;
}
export declare class Node {
    parent: Node | null;
    offset: number;
    length: number;
    get end(): number;
    options: {
        [name: string]: any;
    } | undefined;
    textProvider: ITextProvider | undefined;
    private children;
    private issues;
    private nodeType;
    constructor(offset?: number, len?: number, nodeType?: NodeType);
    set type(type: NodeType);
    get type(): NodeType;
    private getTextProvider;
    getText(): string;
    matches(str: string): boolean;
    startsWith(str: string): boolean;
    endsWith(str: string): boolean;
    accept(visitor: IVisitorFunction): void;
    acceptVisitor(visitor: IVisitor): void;
    adoptChild(node: Node, index?: number): Node;
    attachTo(parent: Node, index?: number): Node;
    collectIssues(results: any[]): void;
    addIssue(issue: IMarker): void;
    hasIssue(rule: IRule): boolean;
    isErroneous(recursive?: boolean): boolean;
    setNode(field: keyof this, node: Node | null, index?: number): boolean;
    addChild(node: Node | null): node is Node;
    private updateOffsetAndLength;
    hasChildren(): boolean;
    getChildren(): Node[];
    getChild(index: number): Node | null;
    addChildren(nodes: Node[]): void;
    findFirstChildBeforeOffset(offset: number): Node | null;
    findChildAtOffset(offset: number, goDeep: boolean): Node | null;
    encloses(candidate: Node): boolean;
    getParent(): Node | null;
    findParent(type: NodeType): Node | null;
    findAParent(...types: NodeType[]): Node | null;
    setData(key: string, value: any): void;
    getData(key: string): any;
}
export declare class Indentation extends Node {
    private iType;
    private depth;
    constructor(offset: number, length: number);
    setIndentUnit(indentType: IndentType): void;
    setIndentDepth(depth: number): void;
    get type(): NodeType;
    get indentDepth(): number;
    get indentType(): IndentType;
}
export interface NodeConstructor<T> {
    new (offset: number, len: number): T;
}
export declare class Nodelist extends Node {
    private _nodeList;
    constructor(parent: Node, index?: number);
}
export declare class VariableReplacement extends Node {
    get type(): NodeType;
}
export declare class ChoiceScriptStatement extends Node {
    get type(): NodeType;
}
export declare class ChoiceScriptComment extends Node {
    get type(): NodeType;
}
export declare class Identifier extends Node {
    referenceTypes?: ReferenceType[];
    isCustomProperty: boolean;
    constructor(offset: number, length: number);
    get type(): NodeType;
    containsInterpolation(): boolean;
}
export declare class Scene extends Node {
    private sceneName?;
    private uri?;
    constructor(offset: number, length: number);
    get type(): NodeType;
    get name(): string | undefined;
    setUri(uri: DocumentUri): void;
    getUri(): DocumentUri | undefined;
    isStartup(): boolean;
    isStats(): boolean;
}
export declare class SceneRef extends Node {
    private sceneName?;
    private uri?;
    constructor(offset: number, length: number);
    get type(): NodeType;
    get name(): string | undefined;
    getUri(): DocumentUri | undefined;
    isStartup(): boolean;
}
export declare class Command extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
    get name(): string;
}
export declare class Label extends Command {
    private labelName?;
    constructor(offset: number, length: number);
    get type(): NodeType;
    getValue(): string;
}
export declare class LabelRef extends Node {
    private sceneRef;
    constructor(offset: number, length: number);
    get type(): NodeType;
    get scene(): SceneRef | null;
    setSceneRef(node: SceneRef): boolean;
}
export declare class StandardCommand extends Command {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class FlowCommand extends Command {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class RandCommand extends Command {
    get type(): NodeType;
}
export declare class SetCommand extends Command {
    private variable?;
    private expr?;
    constructor(offset: number, length: number);
    getExpr(): Expression | undefined;
    getVariable(): Variable | undefined;
    setVariable(node: Variable): boolean;
    setValue(node: Expression): boolean;
    get type(): NodeType;
}
export declare class ChoiceCommand extends StandardCommand {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class ChoiceOption extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class RealWord extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class Line extends Node {
    private lineType;
    private indentDepth;
    private indentNode;
    lineNumber?: number | undefined;
    constructor(offset: number, length: number);
    getLineNum(): number;
    setLineNum(lineNumber: number): boolean;
    get type(): NodeType;
    setLineType(lineType: LineType): void;
    getLineType(): LineType;
    addIndent(node: Indentation | null): boolean;
    getIndentNode(): Indentation | undefined;
    get indent(): number;
}
export declare class TextLine extends Line {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class ChoiceScriptLine extends Line {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class AtApplyRule extends Node {
    identifier: Identifier | undefined;
    constructor(offset: number, length: number);
    get type(): NodeType;
    setIdentifier(node: Identifier): boolean;
    getIdentifier(): Identifier | undefined;
    getName(): string;
}
export declare class Invocation extends Node {
    private arguments?;
    constructor(offset: number, length: number);
    get type(): NodeType;
    getArguments(): Nodelist;
}
export declare class FunctionParameter extends Node {
    identifier?: Node;
    defaultValue?: Node;
    constructor(offset: number, length: number);
    get type(): NodeType;
    setIdentifier(node: Node | null): node is Node;
    getIdentifier(): Node | undefined;
    getName(): string;
    setDefaultValue(node: Node | null): node is Node;
    getDefaultValue(): Node | undefined;
}
export declare class FunctionArgument extends Node {
    identifier?: Node;
    value?: Node;
    constructor(offset: number, length: number);
    get type(): NodeType;
    setIdentifier(node: Node | null): node is Node;
    getIdentifier(): Node | undefined;
    getName(): string;
    setValue(node: Node | null): node is Node;
    getValue(): Node | undefined;
}
export declare class Import extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
    setMedialist(node: Node | null): node is Node;
}
export declare class Namespace extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class MediaQuery extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class SupportsCondition extends Node {
    lParent?: number;
    rParent?: number;
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class MultiReplaceOption extends Node {
    get type(): NodeType;
}
export declare class MultiReplace extends VariableReplacement {
    variants?: MultiReplaceOption[];
    right?: Node;
    expression?: Expression;
    constructor(offset: number, length: number);
    get type(): NodeType;
    addVariant(variant: MultiReplaceOption | null): number;
    setExpression(value: Node | null): value is Node;
    getExpression(): Expression | undefined;
    getOptions(): MultiReplaceOption[] | undefined;
}
export declare class Expression extends Node {
    private exprType;
    left?: Node;
    right?: Node;
    operator?: Node;
    constructor(offset: number, length: number);
    get type(): NodeType;
    setLeft(left: Node | null): left is Node;
    getLeft(): Node | undefined;
    setRight(right: Node | null): right is Node;
    getRight(): Node | undefined;
    setOperator(node: Operator): node is Operator;
    getOperator(): Node | undefined;
    isSingleValue(): boolean;
    get csType(): ChoiceScriptType | undefined;
}
export declare class BinaryExpression extends Expression {
    left?: Term;
    right?: Term;
    operator?: Node;
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class StringExpression extends Expression {
    left?: Term;
    right?: Term;
    operator?: Node;
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class Term extends Node {
    operator?: Node;
    expression?: Node;
    private valueType?;
    constructor(offset: number, length: number);
    get type(): NodeType;
    setValue(node: Node | null): node is Node;
    get csType(): ChoiceScriptType | undefined;
}
export declare class Operator extends Node {
    private operatorType;
    constructor(offset: number, length: number);
    setCSType(type: ChoiceScriptType): void;
    get type(): NodeType;
    get csType(): ChoiceScriptType | undefined;
}
export declare class HexColorValue extends Node {
    private _hexColorValue;
    constructor(offset: number, length: number);
    get type(): NodeType;
}
export declare class NumericValue extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
    getValue(): {
        value: string;
        unit?: string;
    };
}
export declare class StringValue extends Node {
    constructor(offset: number, length: number);
    get type(): NodeType;
    getValue(): String;
}
export declare class Declarations extends Node {
    private _declarations;
    constructor(offset: number, length: number);
}
export declare class BodyDeclaration extends Node {
    declarations: Declarations | undefined;
    constructor(offset: number, length: number);
    getDeclarations(): Declarations | undefined;
    setDeclarations(decls: Declarations): boolean;
}
export declare class Document extends BodyDeclaration {
    constructor(offset: number, length: number);
}
export declare class VariableDeclaration extends Command {
    private variable;
    private expr;
    constructor(offset: number, length: number);
    setVariable(node: Variable | null): node is Variable;
    setExpr(node: Expression | null): node is Expression;
    get csType(): ChoiceScriptType | undefined;
    get type(): NodeType;
    isConstant(): boolean;
    getVariable(): Variable | null;
    getName(): string;
    getExpr(): Expression | null;
}
export declare class LabelDeclaration extends Command {
    private label?;
    constructor(offset: number, length: number);
    get type(): NodeType;
    setLabel(node: Label | null): boolean;
    getLabel(): Label;
}
export declare class Variable extends Node {
    private varType;
    private value?;
    constructor(offset: number, length: number);
    private _setCSType;
    setValue(node: Node | null): node is Node;
    get csType(): ChoiceScriptType | undefined;
    get const(): boolean;
    get type(): NodeType;
    getName(): string;
    getValue(): Node;
}
export declare class ListEntry extends Node {
    key?: Node;
    value?: Node;
    get type(): NodeType;
    setKey(node: Node | null): node is Node;
    setValue(node: Node | null): node is Node;
}
export declare class LessGuard extends Node {
    isNegated?: boolean;
    private conditions?;
    getConditions(): Nodelist;
}
export declare class GuardCondition extends Node {
    variable?: Node;
    isEquals?: boolean;
    isGreater?: boolean;
    isEqualsGreater?: boolean;
    isLess?: boolean;
    isEqualsLess?: boolean;
    setVariable(node: Node | null): node is Node;
}
export interface IRule {
    id: string;
    message: string;
}
export declare enum Level {
    Ignore = 0,
    Error = 1,
    Warning = 2,
    Information = 3,
    Hint = 4
}
export interface IMarker {
    getNode(): Node;
    getMessage(): string;
    getOffset(): number;
    getLength(): number;
    getRule(): IRule;
    getLevel(): Level;
}
export declare class Marker implements IMarker {
    private node;
    private rule;
    private level;
    private message;
    private offset;
    private length;
    constructor(node: Node, rule: IRule, level: Level, message?: string, offset?: number, length?: number);
    getRule(): IRule;
    getLevel(): Level;
    getOffset(): number;
    getLength(): number;
    getNode(): Node;
    getMessage(): string;
}
export interface IVisitor {
    visitNode: (node: Node) => boolean;
}
export interface IVisitorFunction {
    (node: Node): boolean;
}
export declare class ParseErrorCollector implements IVisitor {
    static entries(node: Node): IMarker[];
    entries: IMarker[];
    constructor();
    visitNode(node: Node): boolean;
}
