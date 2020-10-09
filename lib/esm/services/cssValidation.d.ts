import * as nodes from '../parser/cssNodes';
import { TextDocument, Diagnostic, LanguageSettings } from '../cssLanguageTypes';
import { CSSDataManager } from '../languageFacts/dataManager';
export declare class CSSValidation {
    private cssDataManager;
    private settings?;
    constructor(cssDataManager: CSSDataManager);
    configure(settings?: LanguageSettings): void;
    doValidation(document: TextDocument, stylesheet: nodes.Stylesheet, settings?: LanguageSettings | undefined): Diagnostic[];
}
