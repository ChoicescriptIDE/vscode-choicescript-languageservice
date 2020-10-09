import * as nodes from '../parser/ChoiceScriptNodes';
import { TextDocument, Position, Hover, ClientCapabilities } from '../cssLanguageTypes';
export declare class ChoiceScriptHover {
    private clientCapabilities;
    private supportsMarkdown;
    constructor(clientCapabilities: ClientCapabilities | undefined);
    doHover(document: TextDocument, position: Position, stylesheet: nodes.Scene): Hover | null;
    private convertContents;
    private doesSupportMarkdown;
}
