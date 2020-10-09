import * as nodes from '../parser/cssNodes';
import { Range, CodeActionContext, Command, CodeAction, TextDocument } from '../cssLanguageTypes';
import { CSSDataManager } from '../languageFacts/dataManager';
export declare class CSSCodeActions {
    private readonly cssDataManager;
    constructor(cssDataManager: CSSDataManager);
    doCodeActions(document: TextDocument, range: Range, context: CodeActionContext, stylesheet: nodes.Stylesheet): Command[];
    doCodeActions2(document: TextDocument, range: Range, context: CodeActionContext, stylesheet: nodes.Stylesheet): CodeAction[];
    private getFixesForUnknownProperty;
    private appendFixesForMarker;
}
