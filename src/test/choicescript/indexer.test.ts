/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as choicescriptLanguageService from '../../cssLanguageService';
import { SpellCheckDictionary } from '../../cssLanguageTypes';
import { readFileSync } from 'fs';
import { URI } from 'vscode-uri';
import { TextEdit, CompletionList, TextDocument, Position, CompletionItemKind, InsertTextFormat, Range, Location, DocumentUri } from 'vscode-languageserver-types';
import { ChoiceScriptIndexer, ChoiceScriptProjectIndex } from '../../parser/ChoiceScriptIndexer';
import { start } from 'repl';

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

suite('ChoiceScript — Project Indexer', () => {

	let assertIndexContents = async function (sceneUri: DocumentUri, resources: TextDocument[], expected: { uri: DocumentUri, contents: string}[]) {
		try {
			let ls = choicescriptLanguageService.getChoiceScriptLanguageService();
			await ls.configure({ validate: true, spellcheck: { enabled: false, dictionaryPath: null!, dictionary: null!, userDictionary: null! }});
			let projectIndex: ChoiceScriptProjectIndex | null = ls.updateProject(sceneUri, resources, true /* forceUpdate */);
			if (projectIndex) {
				for (let exp of expected) {
					let scene = projectIndex.getSceneNode(exp.uri);
					assert(scene);
					assert(scene!.getText() === exp.contents);
				}
			}
			else {
				assert(false);
			}
		} catch(e) {
			if (e && e.message) {
				assert.fail(e.message);
			}
		}
	};

	test('#1 Adding scenes', async function () {
		try {
			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, "*title mygame\n*create myvar\n*gosub_scene second_scene\n*finish");
			let secondScene = TextDocument.create('test://test/second_scene.txt', 'choicescript', 0, "Hello!\nGoodbye...\n*return");
			await assertIndexContents(startup.uri, [startup, secondScene], 
				[
					{ uri: startup.uri, contents: startup.getText() },
					{ uri: secondScene.uri, contents: secondScene.getText() }
				]);
		} catch(e) {
			assert.fail(e.message);
		}
	});

	test('#2 Purging projects', async function () {
		try {
			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, "*title mygame\n*create myvar\n*gosub_scene second_scene\n*finish");
			let secondScene = TextDocument.create('test://test/second_scene.txt', 'choicescript', 0, "Hello!\nGoodbye...\n*return");
			await assertIndexContents(startup.uri, [startup, secondScene], 
				[
					{ uri: startup.uri, contents: startup.getText() },
					{ uri: secondScene.uri, contents: secondScene.getText() }
				]);
			ChoiceScriptIndexer.index.purge(startup.uri);
			let index = ChoiceScriptIndexer.index.sync(startup.uri);
			if (index) {
				assert.fail(`Project index exists unexpectedly, containing:\n\t${index.getSceneList().join("\n\t")}`);
			}
		} catch(e) {
			assert.fail(e.message);
		}
	});

	test('#2 Removing specific scenes', async function () {
		try {
			let startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, "*title mygame\n*create myvar\n*gosub_scene second_scene\n*finish");
			let secondScene = TextDocument.create('test://test/second_scene.txt', 'choicescript', 0, "Hello!\nGoodbye...\n*return");
			let thirdChapter = TextDocument.create('test://test/third_chapter.txt', 'choicescript', 0, "");
			ChoiceScriptIndexer.index.sync(startup.uri, [startup, secondScene, thirdChapter]);
			let index = ChoiceScriptIndexer.index.getProjectIndexForScene(startup.uri);
			if (!index) {
				assert.fail("Couldn't find project index.");
			}
			assert(index.getSceneList().length === 3, `Index not populating correctly`);
			let purgedIndex = ChoiceScriptIndexer.index.purge(startup.uri, [startup.uri, secondScene.uri]);
			if (!purgedIndex) {
				assert.fail("Couldn't find project index. Was purge too aggressive?");
			}
			assert(purgedIndex.getSceneList().length === 1, `Purged scene list was expected to be length '1', but got: '${purgedIndex.getSceneList().length}'`);
			assert(purgedIndex.getSceneList()[0] === "third_chapter", `Last scene in purged scene was expected to be 'third_chapter' but was '${purgedIndex.getSceneList()[0]}'`);
		} catch(e) {
			assert.fail(e.message);
		}
	});

});