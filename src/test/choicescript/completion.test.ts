/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { SpellCheckDictionary } from '../../cssLanguageTypes';
import {
	getChoiceScriptLanguageService,
	LanguageSettings, PropertyCompletionContext, PropertyValueCompletionContext, URILiteralCompletionContext, ImportPathCompletionContext,
	TextDocument, CompletionList, Position, CompletionItemKind, InsertTextFormat, Range, Command, MarkupContent, 
} from '../../cssLanguageService';
import { readFileSync } from 'fs';
import { Scene } from '../../parser/ChoiceScriptNodes';
import { TextEdit } from 'vscode-languageserver-types';

export interface ItemDescription {
	label: string;
	detail?: string;
	documentation?: string;
	kind?: CompletionItemKind;
	insertTextFormat?: InsertTextFormat;
	resultText?: string;
	notAvailable?: boolean;
}

function asPromise<T>(result: T): Promise<T> {
	return Promise.resolve(result);
}

export let assertCompletion = function (completions: CompletionList, expected: ItemDescription, document: TextDocument) {
	let matches = completions.items.filter(completion => {
		return completion.label === expected.label;
	});
	if (expected.notAvailable) {
		assert.equal(matches.length, 0, expected.label + " should not be present");
	} else {
		assert.equal(matches.length, 1, expected.label + " should only existing once, Actual - " + completions.items.map(c => c.label).join(', '));
	}

	let match = matches[0];
	if (expected.detail) {
		assert.equal(match.detail, expected.detail, `Detail '${match.detail}' does match expected '${expected.detail}'`);
	}
	if (expected.documentation) {
		assert.equal(match.documentation, expected.documentation, `Documentation '${match.documentation}' does match expected '${expected.documentation}'`);
	}
	if (expected.kind) {
		assert.equal(match.kind, expected.kind, `Kind '${match.kind}' does match expected '${expected.kind}'`);
	}
	if (expected.resultText && match.textEdit) {
		const edit = TextEdit.is(match.textEdit) ? match.textEdit : TextEdit.replace(match.textEdit.replace, match.textEdit.newText);
		let res = TextDocument.applyEdits(document, [edit]);
		assert.equal(res, expected.resultText, `Result text '${res}' does match expected '${expected.resultText}'`);
	}
	if (expected.insertTextFormat) {
		assert.equal(match.insertTextFormat, expected.insertTextFormat, `Insert format text '${match.insertTextFormat}' does match expected '${expected.insertTextFormat}'`);
	}
};

suite('ChoiceScript — Completion', () => {

	// TODO: Ensure these tests can handle errors thrown by ls.doComplete.
	let testCompletionFor = async function (value: string, position: Position, expected: { items: ItemDescription[], participant?: { onProperty?: PropertyCompletionContext[], onPropertyValue?: PropertyValueCompletionContext[], onURILiteralValue?: URILiteralCompletionContext[], onImportPath?: ImportPathCompletionContext[] } }, resources?: TextDocument[]) {
		let actualBadSpellingContexts: { text: string; range: Range; }[] = [];
		let actualPropertyContexts: { propertyName: string; range: Range; }[] = [];
		let actualPropertyValueContexts: { propertyName: string; propertyValue?: string; range: Range; }[] = [];
		let actualURILiteralValueContexts: { uriValue: string; position: Position; range: Range; }[] = [];
		let actualImportPathContexts: { pathValue: string; position: Position; range: Range; }[] = [];

		let ls = getChoiceScriptLanguageService();
		ls.configure({validate: true, spellcheck: { enabled: false, dictionaryPath: '../../services/typo/dictionaries', dictionary: SpellCheckDictionary.EN_US, userDictionary: null! }});
		if (expected.participant) {
			ls.setCompletionParticipants([{
				onBadSpelling: context => actualBadSpellingContexts.push(context),
				onCssProperty: context => actualPropertyContexts.push(context),
				onCssPropertyValue: context => actualPropertyValueContexts.push(context),
				onCssURILiteralValue: context => actualURILiteralValueContexts.push(context),
				onCssImportPath: context => actualImportPathContexts.push(context),
			}]);
		}
		let document = TextDocument.create('test://test/local.txt', 'choicescript', 0, value);
		let doc = ls.parseScene(document);
		ls.updateProject(document.uri, resources, true /* forceUpdate */);
		let list = await ls.doComplete(document, position, doc);
		ls.purgeProject(document.uri);
		assert.equal(list.items.length, expected.items.length,
			`\nGot ${list.items.length}:\n\t${list.items.map((i)=>i.label).join("\n\t")}\n\nExpected ${expected.items.length}:\n\t${expected.items.map((i)=>i.label).join("\n\t")}`);
		for (let item of expected.items) {
			assertCompletion(list, item, document);
		}
		return list;
	};
	
	test('commands', async function () {
		try {
			let value = "*c";
			await testCompletionFor(value, Position.create(0, value.length), {
				items: [
					{ label: 'check_achievements', resultText: '*check_achievements' },
					{ label: 'check_purchase', resultText: '*check_purchase' },
					{ label: 'check_registration', resultText: '*check_registration' },
					{ label: 'choice', resultText: '*choice' },
					{ label: 'create', resultText: '*create' },
					{ label: 'config', resultText: '*config' },
					{ label: 'comment', resultText: '*comment' },
				],
			});
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('commands - nothing', async function () {
		try {
			let value = "*";
			await testCompletionFor('*', Position.create(0, value.length), {
				items: [],
			});
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('Replacement variables (${}, @{})', async function () {
		try {
			let value = readFileSync("./src/test/choicescript/data/scenes/completion/replacement_vars.txt").toString();

			// ${}
			let lines = value.split("\n");
			let line = lines.filter((line) => line.indexOf("${f}") >= 0)[0];
			let charPos = line.indexOf("${f") + 3;
			await testCompletionFor(value, Position.create(lines.indexOf(line), charPos), {
				items: [ 
					{ label: 'first_name', resultText: value.replace("${f}", "${first_name}") },
					{ label: 'full_name', resultText: value.replace("${f}", "${full_name}") }
				],
			});

			// @{}
			line = lines.filter((line) => line.indexOf("@{h") >= 0)[0];
			charPos = line.indexOf("@{h") + 3;
			await testCompletionFor(value, Position.create(lines.indexOf(line), charPos), {
				items: [ 
					{ label: 'hobby', resultText: value.replace("@{h", "@{hobby") },
					{ label: 'home_address', resultText: value.replace("@{h", "@{home_address") },
				],
			});
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('*set variables', async function () {
		try {
			let value = readFileSync("./src/test/choicescript/data/scenes/completion/variables.txt").toString();
			let lines = value.split("\n");
			let line = lines[lines.length - 1];
			let charPos = line.indexOf("my") + 2;
			await testCompletionFor(value, Position.create(lines.length - 1, charPos), {
				items: [ 
					{ label: 'myname', resultText: value.replace("*set my", "*set myname") },
					{ label: 'mynum', resultText: value.replace("*set my", "*set mynum") }
				],
			});
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('global variables', async function () {
		try {
			let startupScene = TextDocument.create('test://test/startup.txt', 'choicescript', 0, readFileSync("./src/test/choicescript/data/scenes/completion/variables_startup.txt").toString());

			let value = readFileSync("./src/test/choicescript/data/scenes/completion/variables.txt").toString();
			let lines = value.split("\n");
			let line = lines[lines.length - 1];
			let charPos = line.indexOf("my") + 2;
			await testCompletionFor(value, Position.create(lines.length - 1, charPos), {
				items: [ 
					{ label: 'myname', resultText: value.replace("*set my", "*set myname") },
					{ label: 'mynum', resultText: value.replace("*set my", "*set mynum") },
					{ label: 'myglobalvar', resultText: value.replace("*set my", "*set myglobalvar") },
					{ label: 'myglobalnum', resultText: value.replace("*set my", "*set myglobalnum") }
				],
			}, [startupScene]);
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('labels goto', async function () {
		try {
			let value = readFileSync("./src/test/choicescript/data/scenes/completion/labels_goto.txt").toString();
			let lines = value.split("\n");
			let line = lines.filter((line) => line.indexOf("*goto s") >= 0)[0];
			let charPos = line.indexOf("s") + 1;
			await testCompletionFor(value, Position.create(lines.indexOf(line), charPos), {
				items: [ 
					{ label: 'secondlabel', resultText: value.replace("*goto s", "*goto secondlabel") },
				],
			});
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('variables - nothing', async function () {
		try {
			let value = readFileSync("./src/test/choicescript/data/scenes/completion/variables_nothing.txt").toString();
			await testCompletionFor(value, Position.create(value.split("\n").length, value.length), {
				items: [],
			});
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('goto/gosub_scene scene suggestions', async function () {
		let scenes = [
			TextDocument.create('test://test/startup.txt', 'choicescript', 0, ""),
			TextDocument.create('test://test/local.txt', 'choicescript', 0, ""), // don't suggest itself
			TextDocument.create('test://test/little_town.txt', 'choicescript', 0, ""),
			TextDocument.create('test://test/later.txt', 'choicescript', 0, ""),
			TextDocument.create('test://testproject2/silicon.txt', 'choicescript', 0, ""),
			TextDocument.create('test://testproject2/random.txt', 'choicescript', 0, "")
		];

		try {
			let value = "*goto_scene l";
			await testCompletionFor(value, Position.create(value.split("\n").length, value.length), {
				items: [
					{ label: 'local', resultText: "*goto_scene local" }, // should we *not* suggest ourself?
					{ label: 'later', resultText: "*goto_scene later" },
					{ label: 'little_town', resultText: "*goto_scene little_town" },
				],
			}, scenes);
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('goto/gosub_scene label suggestions', async function () {
		let scenes = [
			TextDocument.create('test://test/startup.txt', 'choicescript', 0, ""),
			TextDocument.create('test://test/second_chapter.txt', 'choicescript', 0, "*label mylabel\n*label secondlabel\n*label myladel\n*"),
		];

		try {
			let value = "*label myinvalidlabel\n*goto_scene second_chapter m";
			await testCompletionFor(value, Position.create(value.split("\n").length, value.length), {
				items: [
					{ label: 'mylabel', resultText: value.replace("*goto_scene second_chapter m", "*goto_scene second_chapter mylabel") },
					{ label: 'myladel', resultText: value.replace("*goto_scene second_chapter m", "*goto_scene second_chapter myladel") },
				],
			}, scenes);
		} catch (e) {
			assert.fail(e.message);
		}
	});

	test('fake test', async function () {
		/* tslint:disable */
		this.skip();
		/* tslint:enable */
	});

	/*
	test('variables', function (): any {
		testCompletionFor(':root { --myvar: red; } body { color: |', {
			items: [
				{ label: '--myvar', documentation: 'red', resultText: ':root { --myvar: red; } body { color: var(--myvar)' },
			]
		});
		testCompletionFor('body { --myvar: 0px; border-right: var| ', {
			items: [
				{ label: '--myvar', documentation: '0px', resultText: 'body { --myvar: 0px; border-right: var(--myvar) ' },
			]
		});
		testCompletionFor('body { --myvar: 0px; border-right: var(| ', {
			items: [
				{ label: '--myvar', documentation: '0px', resultText: 'body { --myvar: 0px; border-right: var(--myvar ' },
			]
		});
		testCompletionFor('a { color: | } :root { --bg-color: red; } ', {
			items: [
				{ label: '--bg-color', documentation: 'red', resultText: 'a { color: var(--bg-color) } :root { --bg-color: red; } ' },
			]
		});
	});*/

});

function newRange(start: number, end: number) {
	return Range.create(Position.create(0, start), Position.create(0, end));
}

