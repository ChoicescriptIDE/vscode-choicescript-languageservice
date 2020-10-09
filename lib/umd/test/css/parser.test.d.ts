import { Parser } from '../../parser/cssParser';
import * as nodes from '../../parser/cssNodes';
export declare function assertNode(text: string, parser: Parser, f: (...args: any[]) => nodes.Node | null): nodes.Node;
export declare function assertFunction(text: string, parser: Parser, f: () => nodes.Node | null): void;
export declare function assertNoNode(text: string, parser: Parser, f: () => nodes.Node | null): void;
export declare function assertError(text: string, parser: Parser, f: () => nodes.Node | null, error: nodes.IRule): void;
