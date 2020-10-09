(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../parser/cssNodes", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LintConfigurationSettings = exports.Rules = exports.Rule = void 0;
    var nodes = require("../parser/cssNodes");
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
    exports.Rules = {
        BadSpelling: new Rule('badSpelling', localize('rule.badSpelling', "Bad spelling."), Warning),
    };
    var LintConfigurationSettings = /** @class */ (function () {
        function LintConfigurationSettings(conf) {
            if (conf === void 0) { conf = {}; }
            this.conf = conf;
        }
        LintConfigurationSettings.prototype.get = function (rule) {
            if (this.conf.hasOwnProperty(rule.id)) {
                var level = toLevel(this.conf[rule.id]);
                if (level) {
                    return level;
                }
            }
            return rule.defaultValue;
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
