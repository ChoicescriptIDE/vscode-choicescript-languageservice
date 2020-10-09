import * as nodes from '../parser/cssNodes';
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
    AllVendorPrefixes: Rule;
    IncludeStandardPropertyWhenUsingVendorPrefix: Rule;
    DuplicateDeclarations: Rule;
    EmptyRuleSet: Rule;
    ImportStatemement: Rule;
    BewareOfBoxModelSize: Rule;
    UniversalSelector: Rule;
    ZeroWithUnit: Rule;
    RequiredPropertiesForFontFace: Rule;
    HexColorLength: Rule;
    ArgsInColorFunction: Rule;
    UnknownProperty: Rule;
    UnknownAtRules: Rule;
    IEStarHack: Rule;
    UnknownVendorSpecificProperty: Rule;
    PropertyIgnoredDueToDisplay: Rule;
    AvoidImportant: Rule;
    AvoidFloat: Rule;
    AvoidIdSelector: Rule;
};
export declare const Settings: {
    ValidProperties: Setting;
};
export declare class LintConfigurationSettings {
    private conf;
    constructor(conf?: LintSettings);
    getRule(rule: Rule): nodes.Level;
    getSetting(setting: Setting): any;
}
