import { CompletionList, TextDocument, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types';
export interface ItemDescription {
    label: string;
    detail?: string;
    documentation?: string;
    kind?: CompletionItemKind;
    insertTextFormat?: InsertTextFormat;
    resultText?: string;
    notAvailable?: boolean;
}
export declare let assertCompletion: (completions: CompletionList, expected: ItemDescription, document: TextDocument, offset: number) => void;
