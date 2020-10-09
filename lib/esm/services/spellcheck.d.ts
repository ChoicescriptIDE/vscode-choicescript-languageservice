import { TextDocument, UserDictionary } from '../cssLanguageTypes';
import * as nodes from '../parser/ChoiceScriptNodes';
export declare class SpellCheckVisitor implements nodes.IVisitor {
    static entries(node: nodes.Node, document: TextDocument, typo: any, userDics?: UserDictionary): nodes.IMarker[];
    static prefixes: string[];
    private misspellings;
    private documentText;
    private typo;
    private userDics;
    private constructor();
    private findValueInExpression;
    getEntries(): nodes.IMarker[];
    private addEntry;
    private getMissingNames;
    wordInUserDics(word: string): boolean;
    visitNode(node: nodes.Node): boolean;
    private visitScene;
    private visitWord;
}
