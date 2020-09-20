/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { Node, IRule, Level } from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { SpellCheckVisitor } from '../../services/spellcheck';
import { Rule, Rules, LintConfigurationSettings } from '../../services/textRules';
import { TextDocument } from 'vscode-languageserver-types';
import { Typo } from '../../services/typo/typo';
import { readFileSync } from 'fs';
import { UserDictionary } from '../../cssLanguageTypes';

export function assertEntries(node: Node, document: TextDocument, typo: any, userDics: UserDictionary, rules: IRule[]): void {
	
	let entries = SpellCheckVisitor.entries(node, document, typo, userDics);
	assert.equal(entries.length, rules.length, entries.map(e => e.getRule().id).join(', '));

	for (let entry of entries) {
		assert.ok(rules.indexOf(entry.getRule()) !== -1, `${entry.getRule().id} found but not expected (${rules.map(r => r.id).join(', ')})`);
	}
}
let parsers = [new ChoiceScriptParser()];
let typo = new Typo("", "", "", {
	platform: 'any'
});

function assertScene(input: string, typo: any, userDics: UserDictionary, ...rules: Rule[]): void {
	for (let p of parsers) {
		let document = TextDocument.create('test://test/startup.txt', 'choicescript', 0, input);
		let node = p.parseScene(document);

		assertEntries(node, document, typo, userDics, rules);
	}
}

function assertRuleSet(input: string, typo: any, userDics: UserDictionary, ...rules: Rule[]): void {
	for (let p of parsers) {
		let document = TextDocument.create('test://test/spelling.txt', 'choicescript', 0, input);
		let node = p.internalParse(input, p._parseLine);
		assertEntries(node, document, typo, userDics, rules);
	}
}

suite('Typo SpellCheck', () => {

	let userDics: UserDictionary = { "session": {}, "persistent": {}};

	let typoGB = new Typo("en_GB", 
		readFileSync("./test/typo/dictionaries/en_GB/en_GB.aff").toString(),
		readFileSync("./test/typo/dictionaries/en_GB/en_GB.dic").toString(),
		{
			platform: 'any'
		}
	);

	test('General', function () {
		assertRuleSet('heello', typoGB, userDics, Rules.BadSpelling);
		assertRuleSet('thaz', typoGB, userDics, Rules.BadSpelling);
		assertRuleSet('anp', typoGB, userDics, Rules.BadSpelling);
		assertRuleSet('arna', typoGB, userDics, Rules.BadSpelling);
		assertRuleSet('hpoliday', typoGB, userDics, Rules.BadSpelling);
	});

	test('Correct', function () {
		assertRuleSet('elephant', typoGB, userDics);
		assertRuleSet('antelope', typoGB, userDics);
		assertRuleSet('dog', typoGB, userDics);
		assertRuleSet('zebra', typoGB, userDics);
		assertRuleSet('armadillo', typoGB, userDics);
	});

	test('Compounds and Constructs', function() {
		assertRuleSet('mother-in-law', typoGB, userDics);
		assertRuleSet('up-to-date', typoGB, userDics);
		assertRuleSet('on-campus', typoGB, userDics);
		assertRuleSet('border-top', typoGB, userDics);
	});

	test('Variable Replacements', function() {
		// Spellcheck should only kick in for MultiReplaceOption text, not expressions.
		assertRuleSet('My name is ${first_name&second_name}, but you can call me ${first_name}.', typoGB, userDics);
		assertRuleSet('I am from the @{direction north|east|soeuth|west}', typoGB, userDics, Rules.BadSpelling);
		assertRuleSet('I @{weapon_id take aim with my riefle|draw mey sword|raise my spear}', typoGB, userDics, Rules.BadSpelling, Rules.BadSpelling);
	});

	test('(Command Line) Strings', function() {
		assertRuleSet('*set paladin_description "A stoic warrior who uhelds justice and embodies the light"', typoGB, userDics, Rules.BadSpelling);
		assertScene('*set hold_task "deax nigOhts awe"', typoGB, userDics, Rules.BadSpelling, Rules.BadSpelling);
		assertRuleSet('*temp my_desc "I wear a ${mainaccessory}, amd 5\' foot smol, and have short, black hair."', typoGB, userDics, Rules.BadSpelling, Rules.BadSpelling);
		assertRuleSet('*if profession = "preest"', typoGB, userDics, Rules.BadSpelling);
		assertRuleSet('*if ("my bad speeeling" = string)', typoGB, userDics, Rules.BadSpelling);
	});


	test('Dictionary: EN_US', function () {
		let typoUS = new Typo("en_US", 
			readFileSync("./test/typo/dictionaries/en_US/en_US.aff").toString(),
			readFileSync("./test/typo/dictionaries/en_US/en_US.dic").toString(),
			{
				platform: 'any'
			}
		);
		assertRuleSet('colour', typoUS, userDics, Rules.BadSpelling);
	});

	test('Dictionary: EN_GB', function () {
		assertRuleSet('color', typoGB, userDics, Rules.BadSpelling);
	});

	test('User Dictionary', function () {
		userDics["session"]["gargoogle"] = true;
		userDics["persistent"]["cthulhu"] = true;
		assertRuleSet('cthulhu', typoGB, userDics);
		assertRuleSet('gargoogle', typoGB, userDics);

		// confirm case-insensitivity
		userDics["persistent"]["lol"] = true;
		assertRuleSet('LOL', typoGB, userDics);
	});

});