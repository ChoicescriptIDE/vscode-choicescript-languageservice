import * as assert from 'assert';
import { Scope, GlobalScope, ScopeBuilder } from '../../parser/ChoiceScriptSymbolScope';
import * as nodes from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { ChoiceScriptNavigation } from '../../services/ChoiceScriptNavigation';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import { getChoiceScriptLanguageService, SpellCheckDictionary } from '../../cssLanguageService';
import { readFileSync } from 'fs';
function scopeToString(scope) {
    var str = '';
    var symbols = scope.getSymbols();
    for (var index = 0; index < symbols.length; index++) {
        if (str.length > 0) {
            str += ',';
        }
        str += symbols[index].name;
    }
    var scopes = scope.children;
    for (var index = 0; index < scopes.length; index++) {
        if (str.length > 0) {
            str += ',';
        }
        str += ('[' + scopeToString(scopes[index]) + ']');
    }
    return str;
}
export function assertSymbols(p, input, expected, lang) {
    if (lang === void 0) { lang = 'css'; }
    var document = TextDocument.create("test://test/test." + lang, lang, 0, input);
    var scene = p.parseScene(document);
    var symbols = new ChoiceScriptNavigation().findDocumentSymbols(document, scene);
    assert.deepEqual(symbols, expected);
}
function assertNoErrors(node) {
    var markers = nodes.ParseErrorCollector.entries(node);
    //console.log(markers);
    if (markers.length > 0) {
        assert.ok(false, 'node has errors: ' + markers[0].getMessage() + ', offset: ' + markers[0].getNode().offset);
    }
}
function createScope(p, input) {
    var document = TextDocument.create('test://test/test.css', 'css', 0, input);
    var scene = p.parseScene(document), global = new GlobalScope(), builder = new ScopeBuilder(global);
    //assertNoErrors(scene);
    scene.acceptVisitor(builder);
    return global;
}
export function assertSymbolsInScope(p, input, offset) {
    var selections = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        selections[_i - 3] = arguments[_i];
    }
    var global = createScope(p, input);
    var scope = global.findScope(offset);
    var getErrorMessage = function (name) {
        var all = 'symbol ' + name + ' not found. In scope: ';
        scope.getSymbols().forEach(function (sym) { all += (sym.name + ' '); });
        return all;
    };
    for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        var sym = scope.getSymbol(selection.name, selection.type) || global.getSymbol(selection.name, selection.type);
        assert.ok(!!sym, getErrorMessage(selection.name));
    }
}
export function assertScopeBuilding(p, input) {
    var scopes = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        scopes[_i - 2] = arguments[_i];
    }
    var global = createScope(p, input);
    console.log(global);
    function assertChildren(scope) {
        scope.children.forEach(function (scope) {
            // check bounds
            var expected = scopes.shift();
            assert.equal(scope.offset, expected.offset);
            assert.equal(scope.length, expected.length);
            // recursive descent
            assertChildren(scope);
        });
    }
    assertChildren(global);
    assert.equal(scopes.length, 0, 'remaining scopes: ' + scopes.join());
}
export function assertScopesAndSymbols(p, input, expected) {
    var global = createScope(p, input);
    assert.equal(scopeToString(global), expected);
}
suite('ChoiceScript - Navigation', function () {
    suite('Scope', function () {
        test('scope creation', function () {
            var global = new GlobalScope(), child1 = new Scope(10, 5), child2 = new Scope(15, 5);
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
            assert.ok(global.findScope(19).parent === global);
        });
        test('test create variables in root scope', function () {
            var p = new ChoiceScriptParser();
            assertSymbolsInScope(p, "*create var1 \"string\"\n*create var2 1", 0, { name: 'var1', type: nodes.ReferenceType.Variable }, { name: 'var2', type: nodes.ReferenceType.Variable });
        });
        test('test temp variables in root scope', function () {
            var p = new ChoiceScriptParser();
            assertSymbolsInScope(p, "*temp var1 \"string\"\n*temp var2 5", 0, { name: 'var1', type: nodes.ReferenceType.Variable }, { name: 'var2', type: nodes.ReferenceType.Variable });
        });
        test('test temp variables -- bad label syntax', function () {
            var p = new ChoiceScriptParser();
            assertSymbolsInScope(p, "*temp var1\n*set v\n*label", 0, { name: 'var1', type: nodes.ReferenceType.Variable });
        });
        test('test labels in local scene', function () {
            var p = new ChoiceScriptParser();
            assertSymbolsInScope(p, "*label myvar\n*temp var2\n*label end\nor not\n*label realend", 0, { name: 'myvar', type: nodes.ReferenceType.Label }, { name: 'end', type: nodes.ReferenceType.Label }, { name: 'realend', type: nodes.ReferenceType.Label });
        });
        test('References, local', function () {
            var p = new ChoiceScriptParser();
            var doc = TextDocument.create('test://not_startup.txt', 'choicescript', 0, readFileSync("./src/test/choicescript/data/scenes/navigation/references_local.txt").toString());
            var lines = doc.getText().split("\n");
            var target = "*temp myvar";
            var symbolName = "myvar";
            var targetLine = lines.filter(function (l) { return l.indexOf(target) >= 0; })[0];
            var targetLineNum = lines.indexOf(targetLine);
            var occurences = ["*set myvar \"something else\"", "*set myvar \"another thing\"", "${myvar}"];
            var expected = [];
            var _loop_1 = function (occ) {
                var line = lines.filter(function (l) { return l.indexOf(occ) >= 0; })[0];
                expected.push({ uri: doc.uri, range: Range.create(Position.create(lines.indexOf(line), line.indexOf(symbolName)), Position.create(lines.indexOf(line), line.indexOf(symbolName) + symbolName.length))
                });
            };
            for (var _i = 0, occurences_1 = occurences; _i < occurences_1.length; _i++) {
                var occ = occurences_1[_i];
                _loop_1(occ);
            }
            var ls = getChoiceScriptLanguageService();
            ls.configure({ validate: true, spellcheck: { enabled: false, dictionaryPath: '../../services/typo/dictionaries', dictionary: SpellCheckDictionary.EN_US, userDictionary: null } });
            ls.updateProject(doc.uri, [doc]);
            var refs = ls.findReferences(doc, Position.create(targetLineNum, targetLine.indexOf(symbolName)), p.parseScene(doc));
            assert(refs.length === expected.length, "Got " + refs.length + " references, but expected " + expected.length);
            for (var _a = 0, expected_1 = expected; _a < expected_1.length; _a++) {
                var exp = expected_1[_a];
                var match = false;
                for (var _b = 0, refs_1 = refs; _b < refs_1.length; _b++) {
                    var r = refs_1[_b];
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
                    assert.fail("Found no match for: { uri: " + exp.uri + ", range: { start: { line: " + exp.range.start.line + ", character: " + exp.range.start.character + " }, end: { line: " + exp.range.end.line + ", character: " + exp.range.end.character + " }}}");
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
