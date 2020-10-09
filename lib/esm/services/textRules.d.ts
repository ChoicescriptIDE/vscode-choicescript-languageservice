import * as nodes from '../parser/cssNodes';
import { LintSettings } from '../cssLanguageTypes';
export declare class Rule implements nodes.IRule {
    id: string;
    message: string;
    defaultValue: nodes.Level;
    constructor(id: string, message: string, defaultValue: nodes.Level);
}
export declare let Rules: {
    BadSpelling: Rule;
};
export declare class LintConfigurationSettings {
    private conf;
    constructor(conf?: LintSettings);
    get(rule: Rule): nodes.Level;
}
