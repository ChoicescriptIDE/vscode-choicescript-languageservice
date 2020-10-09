import { DocumentUri } from 'vscode-languageserver-types';
import { ICompletionParticipant, URILiteralCompletionContext, ImportPathCompletionContext, FileType, DocumentContext, TextDocument, CompletionList } from '../cssLanguageTypes';
export declare class PathCompletionParticipant implements ICompletionParticipant {
    private readonly readDirectory;
    private literalCompletions;
    private importCompletions;
    constructor(readDirectory: (uri: DocumentUri) => Promise<[string, FileType][]>);
    onCssURILiteralValue(context: URILiteralCompletionContext): void;
    onCssImportPath(context: ImportPathCompletionContext): void;
    computeCompletions(document: TextDocument, documentContext: DocumentContext): Promise<CompletionList>;
    private providePathSuggestions;
}
