import { Color, ColorInformation, ColorPresentation, DocumentHighlight, DocumentLink, Location, Position, Range, SymbolInformation, WorkspaceEdit, TextDocument, DocumentContext, FileSystemProvider } from '../cssLanguageTypes';
import * as nodes from '../parser/cssNodes';
export declare class CSSNavigation {
    protected fileSystemProvider: FileSystemProvider | undefined;
    constructor(fileSystemProvider: FileSystemProvider | undefined);
    findDefinition(document: TextDocument, position: Position, stylesheet: nodes.Node): Location | null;
    findReferences(document: TextDocument, position: Position, stylesheet: nodes.Stylesheet): Location[];
    findDocumentHighlights(document: TextDocument, position: Position, stylesheet: nodes.Stylesheet): DocumentHighlight[];
    protected isRawStringDocumentLinkNode(node: nodes.Node): boolean;
    findDocumentLinks(document: TextDocument, stylesheet: nodes.Stylesheet, documentContext: DocumentContext): DocumentLink[];
    findDocumentLinks2(document: TextDocument, stylesheet: nodes.Stylesheet, documentContext: DocumentContext): Promise<DocumentLink[]>;
    private findUnresolvedLinks;
    findDocumentSymbols(document: TextDocument, stylesheet: nodes.Stylesheet): SymbolInformation[];
    findDocumentColors(document: TextDocument, stylesheet: nodes.Stylesheet): ColorInformation[];
    getColorPresentations(document: TextDocument, stylesheet: nodes.Stylesheet, color: Color, range: Range): ColorPresentation[];
    doRename(document: TextDocument, position: Position, newName: string, stylesheet: nodes.Stylesheet): WorkspaceEdit;
    protected resolveRelativeReference(ref: string, documentUri: string, documentContext: DocumentContext): Promise<string | undefined>;
    private resolvePathToModule;
    protected fileExists(uri: string): Promise<boolean>;
}
