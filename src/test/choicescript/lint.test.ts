/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { Node, IRule, Level } from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { LintVisitor } from '../../services/ChoiceScriptLint';
import { Rule, Rules, LintConfigurationSettings } from '../../services/ChoiceScriptLintRules';
import { TextDocument } from '../../cssLanguageTypes';
import { ChoiceScriptIndexer } from '../../parser/ChoiceScriptIndexer';

export function assertEntries(node: Node, document: TextDocument, expectedRules: IRule[], expectedMessages: string[] | undefined = undefined, settings = new LintConfigurationSettings()): void {

	const entries = LintVisitor.entries(node, document, settings, Level.Error | Level.Warning | Level.Ignore);
	const message = `Linting errors:\n\tfound: \t[${entries.map(e => e.getMessage()).join(', ')}]\n\texpected: [${expectedRules.map(e => e.id).join(', ')}]`;

	assert.equal(entries.length, expectedRules.length, message);

	for (const entry of entries) {
		const index = expectedRules.indexOf(entry.getRule());
		assert.ok(index !== -1, `${entry.getRule().id} found but not expected (${expectedRules.map(r => r.id).join(', ')})`);
		if (expectedMessages) {
			assert.equal(entry.getMessage(), expectedMessages[index]);
		}
	}
}
const parsers = [new ChoiceScriptParser()];

function assertScene(input: string, uri: string, ...rules: Rule[]): void {
	for (const p of parsers) {
		const document = TextDocument.create(uri, 'choicescript', 0, input);
		ChoiceScriptIndexer.index.sync(uri, [document]);
		const node = p.parseScene(document);
		ChoiceScriptIndexer.index.purge(uri);
		assertEntries(node, document, rules);
	}
}

function assertChoiceScriptCommand(input: string, ...rules: Rule[]): void {
	assertChoiceScriptCommand2(input, rules);
}

function assertChoiceScriptCommand2(input: string, rules: Rule[], messages?: string[], settings?: LintConfigurationSettings): void {
	for (const p of parsers) {
		const document = TextDocument.create('test://test/startup.txt', 'choicescript', 0, input);
		const node = p.internalParse(input, p._parseChoiceScriptCommand)!;
		assertEntries(node, document, rules, messages, settings);
	}
}

suite('ChoiceScript - Lint', () => {

	test('Deprecated commands', function () {
		assertChoiceScriptCommand('*setref', Rules.DeprecatedCommand);
		assertChoiceScriptCommand('*gotoref', Rules.DeprecatedCommand);
		assertChoiceScriptCommand('*print', Rules.DeprecatedCommand);
	});

	test('Deprecated operators', function () {
		assertChoiceScriptCommand('*set mynum mynum % 2', Rules.DeprecatedOperatorPercent);
		assertChoiceScriptCommand('*set mynum -% 2');
		assertChoiceScriptCommand('*script doSomeJavaScript();', Rules.ScriptCommandUnsupported);
	});

	/*test('Type Conflict — Variables', function () {
		//assertScene('*create n 0+1\n*set n 1 < 2', 'test://test/startup.txt', Rules.TypeError);
		//assertScene('*create str "str"\n*set str 5+5', 'test://test/startup.txt', Rules.TypeError);
		//assertScene('*create n 0\n*set n 5+5', 'test://test/startup.txt');
		//assertScene('*create str "str"\n*set "Jane "&"Doe"', 'test://test/startup.txt');
	});*/

	/*test('Constants — Reassignment', function () {
		//assertScene('*create const_myvar 4\n*set const_myvar 1', 'test://test/startup.txt', Rules.ConstError);
		assertScene('*create myvar 4\n*set myvar 1', 'test://test/startup.txt');
	});*/

	test('Initial commands', function() {
		assertScene('*temp n 0\n*create n 0', 'test://test/startup.txt', Rules.InvalidInitialCommand);
		assertScene('*create n 0', 'test://test/not_startup.txt', Rules.InvalidInitialCommand);
		assertScene('*create n 0\n' +
					 '*create str "Hello World!"\n' +
					 '*comment it\'s all happening here\n' +
					 '*title my brilliant game\n' +
					 '*set str "Goodbye World!"\n',
					 'test://test/not_startup.txt', Rules.InvalidInitialCommand, Rules.InvalidInitialCommand, Rules.InvalidInitialCommand);
		assertScene('*create n 0\n' +
					'*create str "Hello World!"\n' +
					'*comment it\'s all happening here\n' +
					'*title my brilliant game\n' +
					'*set str "Goodbye World!"\n',
					 'test://test/startup.txt');
		assertScene('*create n 0\n' +
					'*create str "Hello World!"\n' +
					'*comment it\'s all happening here\n' +
					'*title my brilliant game\n' +
					'*set str "Goodbye World!"\n',
					'test://test/startup.txt');
	});

	test('Unusual ChoiceScript Stats Commands', function() {
		// It's rarely (if ever?) appropriate to navigate
		// away from the stats screen by traditional means
		// like *goto_scene and *finish. Exception for *gosub_scene,
		// as obviously you'll be returning, and *redirect_scene is specifically
		// designed for exiting the stats screen.
		assertScene('*goto_scene myscene', 'test://test/choicescript_stats.txt', Rules.UnusualStatsCommand);
		assertScene('*finish', 'test://test/choicescript_stats.txt', Rules.UnusualStatsCommand);
		assertScene('*ending', 'test://test/choicescript_stats.txt', Rules.UnusualStatsCommand);
	});

	test('Duplicate unique commands', function() {
		assertScene('*author me\n*author me', 'test://test/startup.txt', Rules.DuplicateUniqueCommand);
		assertScene('*title It\'s a Start!\n*author seconded!\n*title Not Again!', 'test://test/startup.txt', Rules.DuplicateUniqueCommand);
	});

	test('Reserved variable prefix', function() {
		assertScene('*create choice_', 'test://test/startup.txt', Rules.ReservedVariablePrefix);
		assertScene('*create choice_var "string"', 'test://test/startup.txt', Rules.ReservedVariablePrefix);
		assertScene('*temp choice_myvar', 'test://test/startup.txt', Rules.ReservedVariablePrefix);
		assertScene('*temp and "value"', 'test://test/startup.txt', Rules.ReservedWord);
		assertScene('*create scene "my_scene"', 'test://test/startup.txt', Rules.ReservedWord);
		assertScene('*temp true', 'test://test/startup.txt', Rules.ReservedWord);
	});


});
