import { TextDocument, CompletionList, CompletionItemKind, InsertTextFormat } from '../../cssLanguageService';
export interface ItemDescription {
    label: string;
    detail?: string;
    documentation?: string;
    kind?: CompletionItemKind;
    insertTextFormat?: InsertTextFormat;
    resultText?: string;
    notAvailable?: boolean;
}
export declare let assertCompletion: (completions: CompletionList, expected: ItemDescription, document: TextDocument) => void;
