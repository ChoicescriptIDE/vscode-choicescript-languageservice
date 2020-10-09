import { CSSNavigation } from './cssNavigation';
import { FileSystemProvider, DocumentContext } from '../cssLanguageTypes';
import * as nodes from '../parser/cssNodes';
export declare class SCSSNavigation extends CSSNavigation {
    constructor(fileSystemProvider: FileSystemProvider | undefined);
    protected isRawStringDocumentLinkNode(node: nodes.Node): boolean;
    protected resolveRelativeReference(ref: string, documentUri: string, documentContext: DocumentContext): Promise<string | undefined>;
}
