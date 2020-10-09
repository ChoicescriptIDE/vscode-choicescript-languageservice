import * as nodes from '../../parser/cssNodes';
import { Range, Color, ColorInformation, DocumentLink, SymbolInformation, LanguageService } from '../../cssLanguageService';
export declare function assertScopesAndSymbols(ls: LanguageService, input: string, expected: string): void;
export declare function assertHighlights(ls: LanguageService, input: string, marker: string, expectedMatches: number, expectedWrites: number, elementName?: string): void;
export declare function assertLinks(ls: LanguageService, input: string, expected: DocumentLink[], lang?: string, testUri?: string, workspaceFolder?: string): Promise<void>;
export declare function assertSymbols(ls: LanguageService, input: string, expected: SymbolInformation[], lang?: string): void;
export declare function assertColorSymbols(ls: LanguageService, input: string, ...expected: ColorInformation[]): void;
export declare function assertColorPresentations(ls: LanguageService, color: Color, ...expected: string[]): void;
export declare function assertSymbolsInScope(ls: LanguageService, input: string, offset: number, ...selections: {
    name: string;
    type: nodes.ReferenceType;
}[]): void;
export declare function assertScopeBuilding(ls: LanguageService, input: string, ...scopes: {
    offset: number;
    length: number;
}[]): void;
export declare function getTestResource(path: string): string;
export declare function newRange(start: number, end: number): Range;
