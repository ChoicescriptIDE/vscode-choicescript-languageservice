import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import * as nodes from '../../parser/ChoiceScriptNodes';
export declare function assertNode(text: string, parser: ChoiceScriptParser, f: (...args: any[]) => nodes.Node | null): nodes.Node;
export declare function assertFunction(text: string, parser: ChoiceScriptParser, f: () => nodes.Node | null): void;
export declare function assertNoNode(text: string, parser: ChoiceScriptParser, f: () => nodes.Node | null): void;
export declare function assertError(text: string, parser: ChoiceScriptParser, f: () => nodes.Node | null, error: nodes.IRule): void;
