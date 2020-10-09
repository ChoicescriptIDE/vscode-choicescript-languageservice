import * as nodes from '../parser/cssNodes';
import { CSSCompletion } from './cssCompletion';
import { CompletionList, LanguageServiceOptions, IPropertyData } from '../cssLanguageTypes';
import { CSSDataManager } from '../languageFacts/dataManager';
export declare class LESSCompletion extends CSSCompletion {
    private static builtInProposals;
    private static colorProposals;
    constructor(lsOptions: LanguageServiceOptions, cssDataManager: CSSDataManager);
    private createFunctionProposals;
    getTermProposals(entry: IPropertyData | undefined, existingNode: nodes.Node, result: CompletionList): CompletionList;
    protected getColorProposals(entry: IPropertyData, existingNode: nodes.Node, result: CompletionList): CompletionList;
    getCompletionsForDeclarationProperty(declaration: nodes.Declaration, result: CompletionList): CompletionList;
}
