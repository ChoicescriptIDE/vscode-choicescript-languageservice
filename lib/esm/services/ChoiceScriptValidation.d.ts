import * as nodes from '../parser/ChoiceScriptNodes';
import { TextDocument, Diagnostic, ChoiceScriptLanguageSettings } from '../cssLanguageTypes';
export declare class ChoiceScriptValidation {
    private settings?;
    typo: any;
    constructor();
    configure(settings: ChoiceScriptLanguageSettings): void;
    private loadTypo;
    doValidation(document: TextDocument, scene: nodes.Scene, settings?: ChoiceScriptLanguageSettings | undefined): Diagnostic[];
}
