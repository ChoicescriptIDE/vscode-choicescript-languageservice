/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes';
import * as nls from 'vscode-nls';
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
export { Rule };
export var Rules = {
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
export { LintConfigurationSettings };
function toLevel(level) {
    switch (level) {
        case 'ignore': return nodes.Level.Ignore;
        case 'warning': return nodes.Level.Warning;
        case 'error': return nodes.Level.Error;
    }
    return null;
}
