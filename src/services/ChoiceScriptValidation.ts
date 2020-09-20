/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/ChoiceScriptNodes';
import { LintConfigurationSettings, Rules } from './ChoiceScriptLintRules';
import { TextDocument, Range, Diagnostic, DiagnosticSeverity, ChoiceScriptLanguageSettings, UserDictionary, SpellCheckDictionary } from '../cssLanguageTypes';
import { SpellCheckVisitor } from './spellcheck';
import { LintVisitor } from './ChoiceScriptLint';
import { Typo } from './typo/typo';
//import * as fs from 'fs';

export class ChoiceScriptValidation {

	private settings?: ChoiceScriptLanguageSettings = { validate: true,	spellcheck: { enabled: false, dictionaryPath: '', 
		dictionary: SpellCheckDictionary.EN_US, userDictionary: { "session": {}, "persistent": {}} }, lint: {}};
	public typo: any = null;
	
	constructor() {
		this.typo = new Typo("", "", "", {
			platform: 'any'
		});
	}

	public configure(settings: ChoiceScriptLanguageSettings) {
		// Reload typo here rather than every time we call a visitor.
		// Don't bother reloading a dictionary if spellcheck is disabled.
		this.settings = settings;
		if (typeof this.settings!.spellcheck !== 'undefined' && this.settings!.spellcheck.enabled) {
			if (this.settings!.spellcheck.dictionaryPath) {
				this.loadTypo(settings);
			}
		}
	}

	private async loadTypo(settings: ChoiceScriptLanguageSettings) {
		if (!this.settings && this.settings!.spellcheck.enabled) {
			return;
		}
		let baseUrl = settings.spellcheck.dictionaryPath;
		let dict = settings.spellcheck.dictionary;
		// TODO handle failure
		this.typo = new Typo(dict,
			//fs.readFileSync(baseUrl + "/" + dict + "/" + dict + ".aff").toString(),
			//fs.readFileSync(baseUrl + "/" + dict + "/" + dict + ".dic").toString(),
			this.typo._readFile(baseUrl + "/" + dict + "/" + dict + ".aff"),
			this.typo._readFile(baseUrl + "/" + dict + "/" + dict + ".dic"),
			{
				platform: 'any'
			}
		);
	}

	public doValidation(document: TextDocument, scene: nodes.Scene, settings: ChoiceScriptLanguageSettings | undefined = this.settings): Diagnostic[] {
		const entries: nodes.IMarker[] = [];

		if (settings && settings.validate === true) {
			entries.push.apply(entries, nodes.ParseErrorCollector.entries(scene));
		}

		if (settings && settings.spellcheck.enabled === true) {
			entries.push.apply(entries, SpellCheckVisitor.entries(scene, document, this.typo, this.settings!.spellcheck.userDictionary));
		}
		if (settings && settings.lint && settings.lint.enabled === true) {
			entries.push.apply(entries, LintVisitor.entries(scene, document, new LintConfigurationSettings(settings && settings.lint)));
		}

		if (settings && !settings.spellcheck.enabled && !settings.validate) {
			return [];
		}

		const ruleIds: string[] = [];
		for (const r in Rules) {
			ruleIds.push(Rules[r as keyof typeof Rules].id);
		}

		function toDiagnostic(marker: nodes.IMarker): Diagnostic {
			const range = Range.create(document.positionAt(marker.getOffset()), document.positionAt(marker.getOffset() + marker.getLength()));
			const source = document.languageId;

			return <Diagnostic>{
				code: marker.getRule().id,
				source: source,
				message: marker.getMessage(),
				severity: marker.getLevel(),
				range: range
			};
		}

		return entries.filter(entry => entry.getLevel() !== nodes.Level.Ignore).map(toDiagnostic);
	}
}
