import * as nodes from '../parser/ChoiceScriptNodes';
import { LintSettings } from '../cssLanguageTypes';
export declare class Rule implements nodes.IRule {
    id: string;
    message: string;
    defaultValue: nodes.Level;
    constructor(id: string, message: string, defaultValue: nodes.Level);
}
export declare class Setting {
    id: string;
    message: string;
    defaultValue: any;
    constructor(id: string, message: string, defaultValue: any);
}
export declare const Rules: {
    ReservedVariablePrefix: Rule;
    ReservedWord: Rule;
    DuplicateUniqueCommand: Rule;
    UnusualStatsCommand: Rule;
    ConstError: Rule;
    TypeError: Rule;
    ScriptCommandUnsupported: Rule;
    InvalidInitialCommand: Rule;
    DeprecatedCommand: Rule;
    DeprecatedOperatorPercent: Rule;
};
export declare const Settings: {
    TypeSafety: Setting;
    ValidProperties: Setting;
};
export declare class LintConfigurationSettings {
    private conf;
    constructor(conf?: LintSettings);
    getRule(rule: Rule): nodes.Level;
    getSetting(setting: Setting): any;
}
