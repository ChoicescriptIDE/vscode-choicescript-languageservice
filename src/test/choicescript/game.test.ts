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
import { readFileSync, readdirSync, fstat } from 'fs';
import { Scene, ParseErrorCollector, IRule, Level, Node, IMarker } from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptIndexer } from '../../parser/ChoiceScriptIndexer';
import { LintVisitor } from '../../services/ChoiceScriptLint';
import { LintConfigurationSettings } from '../../services/ChoiceScriptLintRules';

const lintConfiguration = {
	"typeError": 'ignore',
	"constError": 'ignore'
};

function addParseErrors(results: IMarker[], sceneNode: Node, document: TextDocument): void {
	let markers = ParseErrorCollector.entries(sceneNode!);
	for (let marker of markers) {
		results.push(marker);
	}
	notify(markers, document, "parse");
}

function addLintEntries(results: IMarker[], node: Node, document: TextDocument, settings = new LintConfigurationSettings(lintConfiguration)): void {
	let markers = LintVisitor.entries(node, document, settings, Level.Error | Level.Warning | Level.Ignore);
	for (let marker of markers) {
		results.push(marker);
	}
	notify(markers, document, "lint");
}

function notify(results: IMarker[], document: TextDocument, type: string): void {
	if (results.length === 0) {
		return;
	}
	console.error(`Node for Scene '${document.uri}' had the following ${type} issues:\n\t${results.map((m)=>m.getMessage() + " Line " + document.positionAt(m.getOffset()).line).join("\n\t")}`);
}

suite('ChoiceScript — Full Games', () => {

	const games = ['demo', 'dragon', 'CSIDE Tutorial'];

	for (let g of games) {
		test(g, async function () {
			/* tslint:disable */
			this.skip();
			/* tslint:enable */
			/* need to comment out or TS complains
			const gamePath = `./src/test/choicescript/data/scenes/game/${g}/`;
			let scenePaths = readdirSync(gamePath).map((path)=>gamePath+path);
			let textDocs: TextDocument[] = [];
			let totalIssues = 0;
			for (let sp of scenePaths) {
				textDocs.push(TextDocument.create(sp, 'choicescript', 0, readFileSync(sp).toString()));
			}
			let projectIndex = ChoiceScriptIndexer.index.sync(textDocs[0].uri, textDocs);
			if (!projectIndex) {
				assert.fail("No project index returned.");
			}			
			for (let doc of textDocs) {
				let parseErrors: IMarker [] = [];
				let lintErrors: IMarker [] = [];
				let sceneNode = projectIndex!.getSceneNode(doc.uri);
				assert(sceneNode, `No node returned for '${doc.uri}'`);
				addParseErrors(parseErrors, sceneNode!, doc);
				addLintEntries(lintErrors, sceneNode!, doc);
				totalIssues += parseErrors.length;
				totalIssues += lintErrors.length;
			}
			ChoiceScriptIndexer.index.purge(textDocs[0].uri);
			if (totalIssues > 0) {
				assert.fail(`${totalIssues} issues detected in game '${g}'.`);
			}*/
		});
	}
});
