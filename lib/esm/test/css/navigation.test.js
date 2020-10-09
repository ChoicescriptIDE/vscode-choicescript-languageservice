/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as assert from 'assert';
import { join } from 'path';
import { Scope, GlobalScope, ScopeBuilder } from '../../parser/cssSymbolScope';
import * as nodes from '../../parser/cssNodes';
import { colorFrom256RGB, colorFromHSL } from '../../languageFacts/facts';
import { TextDocument, DocumentHighlightKind, Range, Position, TextEdit, SymbolKind, Location, getCSSLanguageService, } from '../../cssLanguageService';
import { URI } from 'vscode-uri';
import { getFsProvider } from '../testUtil/fsProvider';
import { getDocumentContext } from '../testUtil/documentContext';
export function assertScopesAndSymbols(ls, input, expected) {
    var global = createScope(ls, input);
    assert.equal(scopeToString(global), expected);
}
export function assertHighlights(ls, input, marker, expectedMatches, expectedWrites, elementName) {
    var document = TextDocument.create('test://test/test.css', 'css', 0, input);
    var stylesheet = ls.parseStylesheet(document);
    assertNoErrors(stylesheet);
    var index = input.indexOf(marker) + marker.length;
    var position = document.positionAt(index);
    var highlights = ls.findDocumentHighlights(document, position, stylesheet);
    assert.equal(highlights.length, expectedMatches, input);
    var nWrites = 0;
    for (var _i = 0, highlights_1 = highlights; _i < highlights_1.length; _i++) {
        var highlight = highlights_1[_i];
        if (highlight.kind === DocumentHighlightKind.Write) {
            nWrites++;
        }
        var range = highlight.range;
        var start = document.offsetAt(range.start), end = document.offsetAt(range.end);
        assert.equal(document.getText().substring(start, end), elementName || marker);
    }
    assert.equal(nWrites, expectedWrites, input);
}
export function assertLinks(ls, input, expected, lang, testUri, workspaceFolder) {
    if (lang === void 0) { lang = 'css'; }
    return __awaiter(this, void 0, void 0, function () {
        var document, stylesheet, links;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = TextDocument.create(testUri || "test://test/test." + lang, lang, 0, input);
                    stylesheet = ls.parseStylesheet(document);
                    return [4 /*yield*/, ls.findDocumentLinks2(document, stylesheet, getDocumentContext(workspaceFolder || 'test://test'))];
                case 1:
                    links = _a.sent();
                    assert.deepEqual(links, expected);
                    return [2 /*return*/];
            }
        });
    });
}
export function assertSymbols(ls, input, expected, lang) {
    if (lang === void 0) { lang = 'css'; }
    var document = TextDocument.create("test://test/test." + lang, lang, 0, input);
    var stylesheet = ls.parseStylesheet(document);
    var symbols = ls.findDocumentSymbols(document, stylesheet);
    assert.deepEqual(symbols, expected);
}
export function assertColorSymbols(ls, input) {
    var expected = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        expected[_i - 2] = arguments[_i];
    }
    var document = TextDocument.create('test://test/test.css', 'css', 0, input);
    var stylesheet = ls.parseStylesheet(document);
    var result = ls.findDocumentColors(document, stylesheet);
    assert.deepEqual(result, expected);
}
export function assertColorPresentations(ls, color) {
    var expected = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        expected[_i - 2] = arguments[_i];
    }
    var document = TextDocument.create('test://test/test.css', 'css', 0, '');
    var stylesheet = ls.parseStylesheet(document);
    var range = newRange(1, 2);
    var result = ls.getColorPresentations(document, stylesheet, color, range);
    assert.deepEqual(result.map(function (r) { return r.label; }), expected);
    assert.deepEqual(result.map(function (r) { return r.textEdit; }), expected.map(function (l) { return TextEdit.replace(range, l); }));
}
export function assertSymbolsInScope(ls, input, offset) {
    var selections = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        selections[_i - 3] = arguments[_i];
    }
    var global = createScope(ls, input);
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
export function assertScopeBuilding(ls, input) {
    var scopes = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        scopes[_i - 2] = arguments[_i];
    }
    var global = createScope(ls, input);
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
export function getTestResource(path) {
    return URI.file(join(__dirname, '../../../../test/linksTestFixtures', path)).toString();
}
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
function assertNoErrors(stylesheet) {
    var markers = nodes.ParseErrorCollector.entries(stylesheet);
    if (markers.length > 0) {
        assert.ok(false, 'node has errors: ' + markers[0].getMessage() + ', offset: ' + markers[0].getNode().offset);
    }
}
function createScope(ls, input) {
    var document = TextDocument.create('test://test/test.css', 'css', 0, input);
    var styleSheet = ls.parseStylesheet(document), global = new GlobalScope(), builder = new ScopeBuilder(global);
    assertNoErrors(styleSheet);
    styleSheet.acceptVisitor(builder);
    return global;
}
function getCSSLS() {
    return getCSSLanguageService({ fileSystemProvider: getFsProvider() });
}
suite('CSS - Navigation', function () {
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
        test('scope building', function () {
            var ls = getCSSLS();
            assertScopeBuilding(ls, '.class {}', { offset: 7, length: 2 });
            assertScopeBuilding(ls, '.class {} .class {}', { offset: 7, length: 2 }, { offset: 17, length: 2 });
        });
        test('symbols in scopes', function () {
            var ls = getCSSLS();
            assertSymbolsInScope(ls, '@keyframes animation {};', 0, { name: 'animation', type: nodes.ReferenceType.Keyframe });
            assertSymbolsInScope(ls, ' .class1 {} .class2 {}', 0, { name: '.class1', type: nodes.ReferenceType.Rule }, { name: '.class2', type: nodes.ReferenceType.Rule });
        });
        test('scopes and symbols', function () {
            var ls = getCSSLS();
            assertScopesAndSymbols(ls, '.class {}', '.class,[]');
            assertScopesAndSymbols(ls, '@keyframes animation {}; .class {}', 'animation,.class,[],[]');
            assertScopesAndSymbols(ls, '@page :pseudo-class { margin:2in; }', '[]');
            assertScopesAndSymbols(ls, '@media print { body { font-size: 10pt } }', '[body,[]]');
            assertScopesAndSymbols(ls, '@-moz-keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; }}', 'identifier,[[],[]]');
            assertScopesAndSymbols(ls, '@font-face { font-family: "Bitstream Vera Serif Bold"; }', '[]');
        });
        test('test variables in root scope', function () {
            var ls = getCSSLS();
            assertSymbolsInScope(ls, ':root{ --var1: abc; --var2: def; }', 0, { name: '--var1', type: nodes.ReferenceType.Variable }, { name: '--var2', type: nodes.ReferenceType.Variable });
        });
        test('test variables in local scope', function () {
            var ls = getCSSLS();
            assertSymbolsInScope(ls, '.a{ --var1: abc; --var2: def; }', 2, { name: '--var1', type: nodes.ReferenceType.Variable }, { name: '--var2', type: nodes.ReferenceType.Variable });
        });
        test('test variables in local scope get root variables too', function () {
            var ls = getCSSLS();
            assertSymbolsInScope(ls, '.a{ --var1: abc; } :root{ --var2: abc;}', 2, { name: '--var1', type: nodes.ReferenceType.Variable }, { name: '--var2', type: nodes.ReferenceType.Variable });
        });
        test('test variables in local scope get root variables and other local variables too', function () {
            var ls = getCSSLS();
            assertSymbolsInScope(ls, '.a{ --var1: abc; } .b{ --var2: abc; } :root{ --var3: abc;}', 2, { name: '--var1', type: nodes.ReferenceType.Variable }, { name: '--var2', type: nodes.ReferenceType.Variable }, { name: '--var3', type: nodes.ReferenceType.Variable });
        });
    });
    suite('Symbols', function () {
        test('basic symbols', function () {
            var ls = getCSSLS();
            assertSymbols(ls, '.foo {}', [{ name: '.foo', kind: SymbolKind.Class, location: Location.create('test://test/test.css', newRange(0, 7)) }]);
            assertSymbols(ls, '.foo:not(.selected) {}', [{ name: '.foo:not(.selected)', kind: SymbolKind.Class, location: Location.create('test://test/test.css', newRange(0, 22)) }]);
            // Media Query
            assertSymbols(ls, '@media screen, print {}', [{ name: '@media screen, print', kind: SymbolKind.Module, location: Location.create('test://test/test.css', newRange(0, 23)) }]);
        });
    });
    suite('Highlights', function () {
        test('mark highlights', function () {
            var ls = getCSSLS();
            assertHighlights(ls, '@keyframes id {}; #main { animation: id 4s linear 0s infinite alternate; }', 'id', 2, 1);
            assertHighlights(ls, '@keyframes id {}; #main { animation-name: id; foo: id;}', 'id', 2, 1);
        });
        test('mark occurrences for variable defined in root and used in a rule', function () {
            var ls = getCSSLS();
            assertHighlights(ls, '.a{ background: let(--var1); } :root{ --var1: abc;}', '--var1', 2, 1);
        });
        test('mark occurrences for variable defined in a rule and used in a different rule', function () {
            var ls = getCSSLS();
            assertHighlights(ls, '.a{ background: let(--var1); } :b{ --var1: abc;}', '--var1', 2, 1);
        });
        test('mark occurrences for property', function () {
            var ls = getCSSLS();
            assertHighlights(ls, 'body { display: inline } #foo { display: inline }', 'display', 2, 0);
        });
        test('mark occurrences for value', function () {
            var ls = getCSSLS();
            assertHighlights(ls, 'body { display: inline } #foo { display: inline }', 'inline', 2, 0);
        });
        test('mark occurrences for selector', function () {
            var ls = getCSSLS();
            assertHighlights(ls, 'body { display: inline } #foo { display: inline }', 'body', 1, 1);
        });
        test('mark occurrences for comment', function () {
            var ls = getCSSLS();
            assertHighlights(ls, '/* comment */body { display: inline } ', 'comment', 0, 0);
        });
        test('mark occurrences for whole classname instead of only class identifier', function () {
            var ls = getCSSLS();
            assertHighlights(ls, '.foo { }', '.foo', 1, 1);
            assertHighlights(ls, '.body { } body { }', '.body', 1, 1);
        });
    });
    suite('Links', function () {
        test('basic @import links', function () { return __awaiter(void 0, void 0, void 0, function () {
            var ls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ls = getCSSLS();
                        return [4 /*yield*/, assertLinks(ls, "@import 'foo.css';", [
                                { range: newRange(8, 17), target: 'test://test/foo.css' }
                            ])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, assertLinks(ls, "@import './foo.css';", [
                                { range: newRange(8, 19), target: 'test://test/foo.css' }
                            ])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, assertLinks(ls, "@import '../foo.css';", [
                                { range: newRange(8, 20), target: 'test://foo.css' }
                            ])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('complex @import links', function () { return __awaiter(void 0, void 0, void 0, function () {
            var ls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ls = getCSSLS();
                        return [4 /*yield*/, assertLinks(ls, "@import url(\"foo.css\") print;", [
                                { range: newRange(12, 21), target: 'test://test/foo.css' }
                            ])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, assertLinks(ls, "@import url(\"chrome://downloads\")", [
                                { range: newRange(12, 32), target: 'chrome://downloads' }
                            ])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, assertLinks(ls, "@import url('landscape.css') screen and (orientation:landscape);", [
                                { range: newRange(12, 27), target: 'test://test/landscape.css' }
                            ])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('links in rulesets', function () { return __awaiter(void 0, void 0, void 0, function () {
            var ls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ls = getCSSLS();
                        return [4 /*yield*/, assertLinks(ls, "body { background-image: url(./foo.jpg)", [
                                { range: newRange(29, 38), target: 'test://test/foo.jpg' }
                            ])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, assertLinks(ls, "body { background-image: url('./foo.jpg')", [
                                { range: newRange(29, 40), target: 'test://test/foo.jpg' }
                            ])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('No links with empty range', function () { return __awaiter(void 0, void 0, void 0, function () {
            var ls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ls = getCSSLS();
                        return [4 /*yield*/, assertLinks(ls, "body { background-image: url()", [])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, assertLinks(ls, "@import url();", [])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('url links', function () {
            return __awaiter(this, void 0, void 0, function () {
                var ls, testUri, workspaceFolder;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ls = getCSSLS();
                            testUri = getTestResource('about.css');
                            workspaceFolder = getTestResource('');
                            return [4 /*yield*/, assertLinks(ls, 'html { background-image: url("hello.html")', [{ range: newRange(29, 41), target: getTestResource('hello.html') }], 'css', testUri, workspaceFolder)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('node module resolving', function () {
            return __awaiter(this, void 0, void 0, function () {
                var ls, testUri, workspaceFolder;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ls = getCSSLS();
                            testUri = getTestResource('about.css');
                            workspaceFolder = getTestResource('');
                            return [4 /*yield*/, assertLinks(ls, 'html { background-image: url("~foo/hello.html")', [{ range: newRange(29, 46), target: getTestResource('node_modules/foo/hello.html') }], 'css', testUri, workspaceFolder)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('node module subfolder resolving', function () {
            return __awaiter(this, void 0, void 0, function () {
                var ls, testUri, workspaceFolder;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ls = getCSSLS();
                            testUri = getTestResource('subdir/about.css');
                            workspaceFolder = getTestResource('');
                            return [4 /*yield*/, assertLinks(ls, 'html { background-image: url("~foo/hello.html")', [{ range: newRange(29, 46), target: getTestResource('node_modules/foo/hello.html') }], 'css', testUri, workspaceFolder)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    suite('Color', function () {
        test('color symbols', function () {
            var ls = getCSSLS();
            assertColorSymbols(ls, 'body { backgroundColor: #ff9977; }', { color: colorFrom256RGB(0xff, 0x99, 0x77), range: newRange(24, 31) });
            assertColorSymbols(ls, 'body { backgroundColor: hsl(0, 0%, 100%); }', { color: colorFrom256RGB(255, 255, 255), range: newRange(24, 40) });
            assertColorSymbols(ls, 'body { backgroundColor: hsl(0, 1%, 100%); }', { color: colorFrom256RGB(255, 255, 255), range: newRange(24, 40) });
            assertColorSymbols(ls, '.oo { color: rgb(1,40,1); borderColor: hsl(120, 75%, 85%) }', { color: colorFrom256RGB(1, 40, 1), range: newRange(13, 24) }, { color: colorFromHSL(120, 0.75, 0.85), range: newRange(39, 57) });
            assertColorSymbols(ls, 'body { backgroundColor: rgba(1, 40, 1, 0.3); }', { color: colorFrom256RGB(1, 40, 1, 0.3), range: newRange(24, 43) });
        });
        test('color presentations', function () {
            var ls = getCSSLS();
            assertColorPresentations(ls, colorFrom256RGB(255, 0, 0), 'rgb(255, 0, 0)', '#ff0000', 'hsl(0, 100%, 50%)');
            assertColorPresentations(ls, colorFrom256RGB(77, 33, 111, 0.5), 'rgba(77, 33, 111, 0.5)', '#4d216f80', 'hsla(274, 54%, 28%, 0.5)');
        });
    });
});
export function newRange(start, end) {
    return Range.create(Position.create(0, start), Position.create(0, end));
}
