import { LintConfigurationSettings } from './ChoiceScriptLintRules';
import * as nodes from '../parser/ChoiceScriptNodes';
import { TextDocument } from '../cssLanguageTypes';
export declare class LintVisitor implements nodes.IVisitor {
    static entries(node: nodes.Node, document: TextDocument, settings: LintConfigurationSettings, entryFilter?: number): nodes.IMarker[];
    static prefixes: string[];
    private warnings;
    private settings;
    private keyframes;
    private document;
    private documentText;
    private validProperties;
    private constructor();
    private isValidPropertyDeclaration;
    private fetch;
    private findValueInExpression;
    getEntries(filter?: number): nodes.IMarker[];
    private addEntry;
    visitNode(node: nodes.Node): boolean;
    private completeValidations;
    private visitScene;
    private visitVariableDeclaration;
    private visitCommand;
    private visitOperator;
    private lintInitialCommands;
    private lintChoiceScriptStats;
    private lintUniqueCommands;
}
