/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as choicescriptLanguageService from '../../cssLanguageService';
import { SpellCheckDictionary } from '../../cssLanguageTypes';
import { readFileSync } from 'fs';
import { TextEdit, CompletionList, TextDocument, Position, CompletionItemKind, InsertTextFormat, Range, Location, DocumentUri } from 'vscode-languageserver-types';

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

export let assertCompletion = function (completions: CompletionList, expected: ItemDescription, document: TextDocument, offset: number) {
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
		assert.equal(match.detail, expected.detail);
	}
	if (expected.documentation) {
		assert.equal(match.documentation, expected.documentation);
	}
	if (expected.kind) {
		assert.equal(match.kind, expected.kind);
	}
	if (expected.resultText && match.textEdit) {
		const edit = TextEdit.is(match.textEdit) ? match.textEdit : TextEdit.replace(match.textEdit.replace, match.textEdit.newText);
		assert.equal(TextDocument.applyEdits(document, [edit]), expected.resultText);
	}
	if (expected.insertTextFormat) {
		assert.equal(match.insertTextFormat, expected.insertTextFormat);
	}
};

suite('ChoiceScript — Experimental', () => {

	let assertDefinition = async function (target: {uri: DocumentUri, position: Position }, exp: Location, resources: TextDocument[]) {
		try {
			let ls = choicescriptLanguageService.getChoiceScriptLanguageService();
			await ls.configure({ validate: true, spellcheck: { enabled: false, dictionaryPath: null!, dictionary: null!, userDictionary: null! }});
			let projectIndex = ls.updateProject(target.uri, resources, true /* forceUpdate */);
			let targetScene = projectIndex?.getSceneIndex(target.uri);
			let startupScene = projectIndex?.getStartupIndex();
			if (!targetScene) {
				assert.fail("Couldn't find target scene in project index. Was it passed as a resource?");
			}
			let def: Location | null = await ls.findDefinition(targetScene!.textDocument, target.position, targetScene!.node);
			if (def) {
				assert(def.uri === exp.uri, `URI '${def.uri}' does not match expected: '${exp.uri}'`);
				assert(def.range.start.line === exp.range.start.line, `Start line '${def.range.start.line}' does not match expected: '${exp.range.start.line}'`);
				assert(def.range.start.character === exp.range.start.character, `Start character '${def.range.start.character}' does not match expected: '${exp.range.start.character}'`);
				assert(def.range.end.line === exp.range.end.line, `End line '${def.range.end.line}' does not match expected: '${exp.range.end.line}'`);
				assert(def.range.end.character === exp.range.end.character, `End character '${def.range.end.character}' does not match expected: '${exp.range.end.character}'`);
			} else {
				assert(false, "definition not found");
			}
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	};

	test('#1', async function () {
		try {
			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, '*create a "e"\n' +
				'*create n 0\n' +
				'*create t false\n' +
				'*temp x "y"\n' +
				'*temp y "z"');
			let not_startup = TextDocument.create('test://test/not_startup.txt', 'choicescript', 0, '*label look\n' +
				'*temp z 7\n' +
				'*set a "b"\n' +
				'*set n 0\n' +
				'*set t false');
			await assertDefinition({uri: "test://test/not_startup.txt", position: Position.create(4,5)},
									{uri: "test://test/startup.txt" , range: Range.create(Position.create(2,0), Position.create(2,15))},
									[startup, not_startup]
								);
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	});

	test('#2 Prefer temp def over create def', async function () {
		try {
			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0,
				readFileSync("./src/test/choicescript/data/scenes/navigation/find_temp_over_create_def_startup.txt").toString());
			let not_startup = TextDocument.create('test://test/not_startup.txt', 'choicescript', 0,
				readFileSync("./src/test/choicescript/data/scenes/navigation/find_temp_over_create_def_local.txt").toString());
			await assertDefinition({uri: "test://test/not_startup.txt", position: Position.create(3,5)},
									{uri: "test://test/not_startup.txt", range: Range.create(Position.create(1,0), Position.create(1,9))},
									[startup, not_startup]
								);
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	});

	test('#3 local label definitions', async function () {
		try {
			let not_startup = TextDocument.create('test://test/not_startup.txt', 'choicescript', 0,
				readFileSync("./src/test/choicescript/data/scenes/navigation/local_label_defs.txt").toString());

			let value = not_startup.getText();
			let lines = value.split("\n");
			let line = lines.filter((line) => line.indexOf("*goto start") >= 0)[0];
			let defLine = lines.filter((line) => line.indexOf("*label start") >= 0)[0];
			let charPos = line.indexOf("s") + 1;
			await assertDefinition({uri: "test://test/not_startup.txt", position:  Position.create(lines.indexOf(line), charPos) },
									{uri: "test://test/not_startup.txt", range: Range.create(Position.create(lines.indexOf(defLine),0), Position.create(lines.indexOf(defLine),defLine.length-1))},
									[not_startup]
								);
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	});

	test('#3 goto_scene scene reference', async function () {
		try {

			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0,
				readFileSync("./src/test/choicescript/data/scenes/navigation/goto_scene_scene_def.txt").toString());
			let not_startup = TextDocument.create('test://test/not_startup.txt', 'choicescript', 0, "");				

			let value = startup.getText();
			let lines = value.split("\n");
			let line = lines.filter((line) => line.indexOf("*goto_scene not_startup") >= 0)[0];
			let charPos = line.indexOf("not") + 1;
			await assertDefinition({uri: "test://test/startup.txt", position:  Position.create(lines.indexOf(line), charPos) },
									{uri: "test://test/not_startup.txt", range: Range.create(Position.create(0,0), Position.create(0,0))},
									[startup, not_startup]
								);
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	});

	test('#4 goto_scene scene and label reference', async function () {
		try {

			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0,
				readFileSync("./src/test/choicescript/data/scenes/navigation/goto_scene_scene_def.txt").toString());
			let not_startup = TextDocument.create('test://test/not_startup.txt', 'choicescript', 0,
				"*label not_this_one\nHello\nWorld!\n*label mylabel\n*finish");

			// target
			let lines = startup.getText().split("\n");
			let line = lines.filter((line) => line.indexOf("*goto_scene not_startup mylabel") >= 0)[0];
			let charPos = line.indexOf("mylabel") + 1;

			// definition
			let dlines = not_startup.getText().split("\n");
			let dline = dlines.filter((line) => line.indexOf("*label mylabel") >= 0)[0];
			let dlineNum = dlines.indexOf(dline);

			await assertDefinition({uri: "test://test/startup.txt", position:  Position.create(lines.indexOf(line), charPos) },
									{
										uri: "test://test/not_startup.txt", 
										range: Range.create(Position.create(dlineNum, 0), Position.create(dlineNum, dline.length))
									},
									[startup, not_startup]
								);
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	});
	
});