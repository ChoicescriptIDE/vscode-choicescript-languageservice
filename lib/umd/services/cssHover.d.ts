import * as nodes from '../parser/cssNodes';
import { TextDocument, Position, Hover, ClientCapabilities } from '../cssLanguageTypes';
import { CSSDataManager } from '../languageFacts/dataManager';
export declare class CSSHover {
    private readonly clientCapabilities;
    private readonly cssDataManager;
    private supportsMarkdown;
    private readonly selectorPrinting;
    constructor(clientCapabilities: ClientCapabilities | undefined, cssDataManager: CSSDataManager);
    doHover(document: TextDocument, position: Position, stylesheet: nodes.Stylesheet): Hover | null;
    private convertContents;
    private doesSupportMarkdown;
}
