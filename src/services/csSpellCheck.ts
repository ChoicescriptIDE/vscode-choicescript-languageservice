/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/cssNodes';
import { TextDocument, Range, Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';
import { LintConfigurationSettings, Rules } from './textRules';
import { SpellCheckVisitor } from './spellcheck';
import { LanguageSettings } from '../cssLanguageTypes';
import { Typo } from './typo/typo';

export class CSSpellCheck {

	private settings: LanguageSettings;
	public typo: Typo;

	constructor() {
	}

	public configure(settings: LanguageSettings) {
		this.settings = settings;
	}

	public doSpellCheck(document: TextDocument, stylesheet: nodes.Stylesheet, settings: LanguageSettings = this.settings): Diagnostic[] {
		if (settings && settings.validate === false) {
			return [];
		}
		
		// Might be a better place to do this...
		this.typo = new Typo("", "", "", {
			platform: 'any'
		});
		this.typo = new Typo("en_US", this.typo._readFile("https://raw.githubusercontent.com/cfinke/Typo.js/master/typo/dictionaries/en_US/en_US.aff"),  this.typo._readFile("https://raw.githubusercontent.com/cfinke/Typo.js/master/typo/dictionaries/en_US/en_US.dic"), {
			platform: 'any'
		});

		let entries: nodes.IMarker[] = [];
		entries.push.apply(entries, nodes.ParseErrorCollector.entries(stylesheet));
		entries.push.apply(entries, SpellCheckVisitor.entries(stylesheet, document, null, (nodes.Level.Warning | nodes.Level.Error), this.typo));

		const ruleIds: string[] = [];
		for (let r in Rules) {
			ruleIds.push(Rules[r].id);
		}

		function toDiagnostic(marker: nodes.IMarker): Diagnostic {
			let range = Range.create(document.positionAt(marker.getOffset()), document.positionAt(marker.getOffset() + marker.getLength()));
			let source = ruleIds.indexOf(marker.getRule().id) !== -1
				? `${document.languageId}.lint.${marker.getRule().id}`
				: document.languageId;

			return <Diagnostic>{
				code: marker.getRule().id,
				source: source,
				message: marker.getMessage(),
				severity: marker.getLevel() === nodes.Level.Warning ? DiagnosticSeverity.Warning : DiagnosticSeverity.Error,
				range: range
			};
		}

		return entries.filter(entry => entry.getLevel() !== nodes.Level.Ignore).map(toDiagnostic);
	}
}
