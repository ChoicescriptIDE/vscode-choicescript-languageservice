/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/ChoiceScriptNodes';
import { LintSettings } from '../cssLanguageTypes';

import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();

const Warning = nodes.Level.Warning;
const Error = nodes.Level.Error;
const Ignore = nodes.Level.Ignore;

export class Rule implements nodes.IRule {

	public constructor(public id: string, public message: string, public defaultValue: nodes.Level) {
		// nothing to do
	}
}

export class Setting {

	public constructor(public id: string, public message: string, public defaultValue: any) {
		// nothing to do
	}
}

export const Rules = {
	ReservedVariablePrefix: new Rule ('reservedWord', localize('rule.reservedWord', "This is a reserved word and cannot be used as a variable name."), Error),
	ReservedWord: new Rule ('reservedVariablePrefix', localize('rule.reservedVariablePrefix', "You cannot create variables with the reserved 'choice_' prefix."), Error),
	DuplicateUniqueCommand: new Rule ('duplicateUniqueCommand', localize('rule.duplicateUniqueCommand', "You only need to execute this command once."), Warning),
	UnusualStatsCommand: new Rule ('unusualStats', localize('rule.unusualStatCommand', "Unexpected use of a scene navigation command from within choicescript_stats.txt."), Warning),
	ConstError: new Rule('constError', localize('rule.constError', "Assignment to a constant variable."), Warning),
	TypeError: new Rule('typeError', localize('rule.typeError', "Assignment of a value type that does not match the definition type."), Warning),
	ScriptCommandUnsupported: new Rule('scriptCommandUnsupported', localize('rule.scriptCommandUnsupported', "The *script command is not supported."), Error),
	InvalidInitialCommand: new Rule('invalidInitialCommand', localize('rule.invalidInitialCommand', "This command is only allowed at the top of startup.txt."), Error),
	DeprecatedCommand: new Rule('deprecatedCommand', localize('rule.deprecatedCommand', "This command has been deprecated and may be removed in the future."), Warning),
	DeprecatedOperatorPercent: new Rule('DeprecatedOperatorPercent', localize('rule.deprecatedOperatorPercent', "The percent '%' operator has been removed in favour of 'modulo'."), Error)
};

export const Settings = {
	TypeSafety: new Setting('typeSafety', localize('setting.typeSafety', "Error on type conflict"), false),
	ValidProperties: new Setting('validProperties', localize('rule.validProperties', "A list of properties that are not validated against the `unknownProperties` rule."), [])
};

export class LintConfigurationSettings {
	constructor(private conf: LintSettings = {}) {
	}

	getRule(rule: Rule): nodes.Level {
		if (this.conf.hasOwnProperty(rule.id)) {
			const level = toLevel(this.conf[rule.id]);
			if (level !== null) {
				return level;
			}
		}
		return rule.defaultValue;
	}

	getSetting(setting: Setting): any {
		return this.conf[setting.id];
	}
}

function toLevel(level: string): nodes.Level | null {
	switch (level) {
		case 'ignore': return nodes.Level.Ignore;
		case 'warning': return nodes.Level.Warning;
		case 'error': return nodes.Level.Error;
	}
	return null;
}
