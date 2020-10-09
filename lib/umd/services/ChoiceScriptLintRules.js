(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../parser/ChoiceScriptNodes", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LintConfigurationSettings = exports.Settings = exports.Rules = exports.Setting = exports.Rule = void 0;
    var nodes = require("../parser/ChoiceScriptNodes");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var Warning = nodes.Level.Warning;
    var Error = nodes.Level.Error;
    var Ignore = nodes.Level.Ignore;
    var Rule = /** @class */ (function () {
        function Rule(id, message, defaultValue) {
            this.id = id;
            this.message = message;
            this.defaultValue = defaultValue;
            // nothing to do
        }
        return Rule;
    }());
    exports.Rule = Rule;
    var Setting = /** @class */ (function () {
        function Setting(id, message, defaultValue) {
            this.id = id;
            this.message = message;
            this.defaultValue = defaultValue;
            // nothing to do
        }
        return Setting;
    }());
    exports.Setting = Setting;
    exports.Rules = {
        ReservedVariablePrefix: new Rule('reservedWord', localize('rule.reservedWord', "This is a reserved word and cannot be used as a variable name."), Error),
        ReservedWord: new Rule('reservedVariablePrefix', localize('rule.reservedVariablePrefix', "You cannot create variables with the reserved 'choice_' prefix."), Error),
        DuplicateUniqueCommand: new Rule('duplicateUniqueCommand', localize('rule.duplicateUniqueCommand', "You only need to execute this command once."), Warning),
        UnusualStatsCommand: new Rule('unusualStats', localize('rule.unusualStatCommand', "Unexpected use of a scene navigation command from within choicescript_stats.txt."), Warning),
        ConstError: new Rule('constError', localize('rule.constError', "Assignment to a constant variable."), Warning),
        TypeError: new Rule('typeError', localize('rule.typeError', "Assignment of a value type that does not match the definition type."), Warning),
        ScriptCommandUnsupported: new Rule('scriptCommandUnsupported', localize('rule.scriptCommandUnsupported', "The *script command is not supported."), Error),
        InvalidInitialCommand: new Rule('invalidInitialCommand', localize('rule.invalidInitialCommand', "This command is only allowed at the top of startup.txt."), Error),
        DeprecatedCommand: new Rule('deprecatedCommand', localize('rule.deprecatedCommand', "This command has been deprecated and may be removed in the future."), Warning),
        DeprecatedOperatorPercent: new Rule('DeprecatedOperatorPercent', localize('rule.deprecatedOperatorPercent', "The percent '%' operator has been removed in favour of 'modulo'."), Error)
    };
    exports.Settings = {
        TypeSafety: new Setting('typeSafety', localize('setting.typeSafety', "Error on type conflict"), false),
        ValidProperties: new Setting('validProperties', localize('rule.validProperties', "A list of properties that are not validated against the `unknownProperties` rule."), [])
    };
    var LintConfigurationSettings = /** @class */ (function () {
        function LintConfigurationSettings(conf) {
            if (conf === void 0) { conf = {}; }
            this.conf = conf;
        }
        LintConfigurationSettings.prototype.getRule = function (rule) {
            if (this.conf.hasOwnProperty(rule.id)) {
                var level = toLevel(this.conf[rule.id]);
                if (level !== null) {
                    return level;
                }
            }
            return rule.defaultValue;
        };
        LintConfigurationSettings.prototype.getSetting = function (setting) {
            return this.conf[setting.id];
        };
        return LintConfigurationSettings;
    }());
    exports.LintConfigurationSettings = LintConfigurationSettings;
    function toLevel(level) {
        switch (level) {
            case 'ignore': return nodes.Level.Ignore;
            case 'warning': return nodes.Level.Warning;
            case 'error': return nodes.Level.Error;
        }
        return null;
    }
});
