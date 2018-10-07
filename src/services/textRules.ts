/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/cssNodes';
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
export let Rules = {
	BadSpelling: new Rule('badSpelling', localize('rule.badSpelling', "Bad spelling."), Warning),
};

export class LintConfigurationSettings {
	constructor(private conf: LintSettings = {}) {
	}

	get(rule: Rule): nodes.Level {
		if (this.conf.hasOwnProperty(rule.id)) {
			let level = toLevel(this.conf[rule.id]);
			if (level) {
				return level;
			}
		}
		return rule.defaultValue;
	}
}

function toLevel(level: string): nodes.Level {
	switch (level) {
		case 'ignore': return nodes.Level.Ignore;
		case 'warning': return nodes.Level.Warning;
		case 'error': return nodes.Level.Error;
	}
	return null;
}
