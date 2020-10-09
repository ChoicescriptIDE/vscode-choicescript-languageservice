import * as nodes from './cssNodes';
export declare class Scope {
    parent: Scope | null;
    children: Scope[];
    offset: number;
    length: number;
    private symbols;
    constructor(offset: number, length: number);
    addChild(scope: Scope): void;
    setParent(scope: Scope): void;
    findScope(offset: number, length?: number): Scope | null;
    private findInScope;
    addSymbol(symbol: Symbol): void;
    getSymbol(name: string, type: nodes.ReferenceType): Symbol | null;
    getSymbols(): Symbol[];
}
export declare class GlobalScope extends Scope {
    constructor();
}
export declare class Symbol {
    name: string;
    value: string | undefined;
    type: nodes.ReferenceType;
    node: nodes.Node;
    constructor(name: string, value: string | undefined, node: nodes.Node, type: nodes.ReferenceType);
}
export declare class ScopeBuilder implements nodes.IVisitor {
    scope: Scope;
    constructor(scope: Scope);
    private addSymbol;
    private addScope;
    private addSymbolToChildScope;
    visitNode(node: nodes.Node): boolean;
    visitRuleSet(node: nodes.RuleSet): boolean;
    visitVariableDeclarationNode(node: nodes.VariableDeclaration): boolean;
    visitFunctionParameterNode(node: nodes.FunctionParameter): boolean;
    visitCustomPropertyDeclarationNode(node: nodes.CustomPropertyDeclaration): boolean;
    private addCSSVariable;
}
export declare class Symbols {
    private global;
    constructor(node: nodes.Node);
    findSymbolsAtOffset(offset: number, referenceType: nodes.ReferenceType): Symbol[];
    private internalFindSymbol;
    private evaluateReferenceTypes;
    findSymbolFromNode(node: nodes.Node): Symbol | null;
    matchesSymbol(node: nodes.Node, symbol: Symbol): boolean;
    findSymbol(name: string, type: nodes.ReferenceType, offset: number): Symbol | null;
}
