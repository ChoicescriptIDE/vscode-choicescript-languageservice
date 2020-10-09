import * as nodes from '../../parser/cssNodes';
export declare class PrintingVisitor implements nodes.IVisitor {
    tree: string[];
    visitNode(node: nodes.Node): boolean;
}
export declare function assertNodes(fn: (input: string) => nodes.Node, input: string, expected: string): void;
