import * as assert from 'assert';
import * as url from 'url';
import { Scope, GlobalScope, ScopeBuilder } from '../../parser/ChoiceScriptSymbolScope';
import * as nodes from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { ChoiceScriptNavigation } from '../../services/ChoiceScriptNavigation';

import { TextDocument, DocumentHighlightKind, Range, Position, TextEdit, Color, ColorInformation, DocumentLink, DocumentSymbol, SymbolKind, SymbolInformation, Location } from 'vscode-languageserver-types';
import { getCSSLanguageService, LanguageService, DocumentContext, getChoiceScriptLanguageService, SpellCheckDictionary } from '../../cssLanguageService';
import { readFileSync } from 'fs';

function scopeToString(scope: Scope): string {
	let str = '';
	let symbols = scope.getSymbols();
	for (let index = 0; index < symbols.length; index++) {
		if (str.length > 0) {
			str += ',';
		}
		str += symbols[index].name;
	}
	let scopes = scope.children;
	for (let index = 0; index < scopes.length; index++) {
		if (str.length > 0) {
			str += ',';
		}
		str += ('[' + scopeToString(scopes[index]) + ']');
	}
	return str;
}

export function assertSymbols(p: ChoiceScriptParser, input: string, expected: SymbolInformation[], lang: string = 'css') {
	let document = TextDocument.create(`test://test/test.${lang}`, lang, 0, input);

	let scene = p.parseScene(document);

	let symbols = new ChoiceScriptNavigation().findDocumentSymbols(document, scene);
	assert.deepEqual(symbols, expected);
}

function assertNoErrors(node: nodes.Node): void {
	let markers = nodes.ParseErrorCollector.entries(node);
	//console.log(markers);
	if (markers.length > 0) {
		assert.ok(false, 'node has errors: ' + markers[0].getMessage() + ', offset: ' + markers[0].getNode().offset);
	}
}

function createScope(p: ChoiceScriptParser, input: string): Scope {
	let document = TextDocument.create('test://test/test.css', 'css', 0, input);

	let scene = p.parseScene(document),
		global = new GlobalScope(),
		builder = new ScopeBuilder(global);

	//assertNoErrors(scene);
	scene.acceptVisitor(builder);
	return global;
}

export function assertSymbolsInScope(p: ChoiceScriptParser, input: string, offset: number, ...selections: { name: string; type: nodes.ReferenceType }[]): void {

	let global = createScope(p, input);

	let scope = global.findScope(offset);

	let getErrorMessage = function (name: string) {
		let all = 'symbol ' + name + ' not found. In scope: ';
		scope!.getSymbols().forEach((sym) => { all += (sym.name + ' '); });
		return all;
	};

	for (let i = 0; i < selections.length; i++) {
		let selection = selections[i];
		let sym = scope!.getSymbol(selection.name, selection.type) || global.getSymbol(selection.name, selection.type);
		assert.ok(!!sym, getErrorMessage(selection.name));
	}
}

export function assertScopeBuilding(p: ChoiceScriptParser, input: string, ...scopes: { offset: number; length: number; }[]): void {

	let global = createScope(p, input);


	console.log(global);
	function assertChildren(scope: Scope): void {

		scope.children.forEach((scope) => {

			// check bounds
			let expected = scopes.shift();
			assert.equal(scope.offset, expected!.offset);
			assert.equal(scope.length, expected!.length);

			// recursive descent
			assertChildren(scope);
		});
	}

	assertChildren(global);

	assert.equal(scopes.length, 0, 'remaining scopes: ' + scopes.join());
}

export function assertScopesAndSymbols(p: ChoiceScriptParser, input: string, expected: string): void {
	let global = createScope(p, input);
	assert.equal(scopeToString(global), expected);
}

suite('ChoiceScript - Navigation', () => {

	suite('Scope', () => {

		test('scope creation', function () {
			let global = new GlobalScope(),
				child1 = new Scope(10, 5),
				child2 = new Scope(15, 5);

			global.addChild(child1);
			global.addChild(child2);

			assert.equal(global.children.length, 2);
			assert.ok(child1.parent === global);
			assert.ok(child2.parent === global);

			// find children
			assert.ok(global.findScope(-1) === null);
			assert.ok(global.findScope(0) === global);
			assert.ok(global.findScope(10) === child1);
			assert.ok(global.findScope(14) === child1);
			assert.ok(global.findScope(15) === child2);
			assert.ok(global.findScope(19) === child2);
			assert.ok(global.findScope(19)!.parent === global);
		});

		test('test create variables in root scope', function () {
			let p = new ChoiceScriptParser();
			assertSymbolsInScope(p, "*create var1 \"string\"\n*create var2 1", 0, { name: 'var1', type: nodes.ReferenceType.Variable }, { name: 'var2', type: nodes.ReferenceType.Variable });
		});

		test('test temp variables in root scope', function () {
			let p = new ChoiceScriptParser();
			assertSymbolsInScope(p, "*temp var1 \"string\"\n*temp var2 5", 0, { name: 'var1', type: nodes.ReferenceType.Variable }, { name: 'var2', type: nodes.ReferenceType.Variable });
		});

		test('test temp variables -- bad label syntax', function () {
			let p = new ChoiceScriptParser();
			assertSymbolsInScope(p, "*temp var1\n*set v\n*label", 0, { name: 'var1', type: nodes.ReferenceType.Variable });
		});

		test('test labels in local scene', function () {
			let p = new ChoiceScriptParser();
			assertSymbolsInScope(p, "*label myvar\n*temp var2\n*label end\nor not\n*label realend", 0, 
				{ name: 'myvar', type: nodes.ReferenceType.Label },
				{ name: 'end', type: nodes.ReferenceType.Label },
				{ name: 'realend', type: nodes.ReferenceType.Label }
			);
		});

		test('References, local', function () {
			let p = new ChoiceScriptParser();
			let doc = TextDocument.create('test://not_startup.txt', 'choicescript', 0, readFileSync("./src/test/choicescript/data/scenes/navigation/references_local.txt").toString());

			let lines = doc.getText().split("\n");
			
			let target = "*temp myvar";
			let symbolName = "myvar";
			let targetLine = lines.filter((l) => l.indexOf(target) >= 0)[0];
			let targetLineNum = lines.indexOf(targetLine);
			let occurences = ["*set myvar \"something else\"", "*set myvar \"another thing\"", "${myvar}"];
			let expected: Location[] = [];
			for (let occ of occurences) {
				let line = lines.filter((l) => l.indexOf(occ) >= 0)[0];
				expected.push({uri: doc.uri, range:
					Range.create(
						Position.create(lines.indexOf(line), line.indexOf(symbolName)), 
						Position.create(lines.indexOf(line), line.indexOf(symbolName) + symbolName.length)
					)
				});
			}

			let ls = getChoiceScriptLanguageService();
			ls.configure({validate: true, spellcheck: { enabled: false, dictionaryPath: '../../services/typo/dictionaries', dictionary: SpellCheckDictionary.EN_US, userDictionary: null! }});
			ls.updateProject(doc.uri, [doc]);
			let refs = ls.findReferences(doc, Position.create(targetLineNum, targetLine.indexOf(symbolName)), p.parseScene(doc));
			assert(refs.length === expected.length, `Got ${refs.length} references, but expected ${expected.length}`);

			for (let exp of expected) {
				let match = false;
				for (let r of refs) {
					if (r.uri === exp.uri) {
						if (r.range.start.line === exp.range.start.line) {
							if (r.range.start.character === exp.range.start.character) {
								if (r.range.end.line === exp.range.end.line) {
									if (r.range.end.character === exp.range.end.character) {
										match = true;
									}
								}
							}
						}
					}
				}
				if (!match) {
					assert.fail(`Found no match for: { uri: ${exp.uri}, range: { start: { line: ${exp.range.start.line}, character: ${exp.range.start.character} }, end: { line: ${exp.range.end.line}, character: ${exp.range.end.character} }}}`);
				}
			}
		});

		test('References, global', function () {
			/* tslint:disable */
			this.skip();
			/* tslint:enable */
		});


	});
});