import { LanguageSettings, PropertyCompletionContext, PropertyValueCompletionContext, URILiteralCompletionContext, ImportPathCompletionContext, TextDocument, CompletionList, CompletionItemKind, InsertTextFormat, Command, MarkupContent, MixinReferenceCompletionContext, ICSSDataProvider } from '../../cssLanguageService';
export interface ItemDescription {
    label: string;
    detail?: string;
    documentation?: string | MarkupContent | null;
    /**
     * Only test that the documentation includes the substring
     */
    documentationIncludes?: string;
    kind?: CompletionItemKind;
    insertTextFormat?: InsertTextFormat;
    resultText?: string;
    notAvailable?: boolean;
    command?: Command;
    sortText?: string;
}
export declare function assertCompletion(completions: CompletionList, expected: ItemDescription, document: TextDocument): void;
export declare type ExpectedCompetions = {
    count?: number;
    items?: ItemDescription[];
    participant?: {
        onProperty?: PropertyCompletionContext[];
        onPropertyValue?: PropertyValueCompletionContext[];
        onURILiteralValue?: URILiteralCompletionContext[];
        onImportPath?: ImportPathCompletionContext[];
        onMixinReference?: MixinReferenceCompletionContext[];
    };
};
export declare function testCompletionFor(value: string, expected: ExpectedCompetions, settings?: LanguageSettings, testUri?: string, workspaceFolderUri?: string, customData?: ICSSDataProvider[]): Promise<void>;
