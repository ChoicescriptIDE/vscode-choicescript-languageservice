import * as nodes from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { SymbolInformation } from 'vscode-languageserver-types';
export declare function assertSymbols(p: ChoiceScriptParser, input: string, expected: SymbolInformation[], lang?: string): void;
export declare function assertSymbolsInScope(p: ChoiceScriptParser, input: string, offset: number, ...selections: {
    name: string;
    type: nodes.ReferenceType;
}[]): void;
export declare function assertScopeBuilding(p: ChoiceScriptParser, input: string, ...scopes: {
    offset: number;
    length: number;
}[]): void;
export declare function assertScopesAndSymbols(p: ChoiceScriptParser, input: string, expected: string): void;
