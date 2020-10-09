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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../parser/cssNodes", "../css/navigation.test", "../../cssLanguageService", "assert", "path", "vscode-uri", "../testUtil/fsProvider", "../testUtil/documentContext"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../../parser/cssNodes");
    var navigation_test_1 = require("../css/navigation.test");
    var cssLanguageService_1 = require("../../cssLanguageService");
    var assert = require("assert");
    var path = require("path");
    var vscode_uri_1 = require("vscode-uri");
    var fsProvider_1 = require("../testUtil/fsProvider");
    var documentContext_1 = require("../testUtil/documentContext");
    function getSCSSLS() {
        return cssLanguageService_1.getSCSSLanguageService({ fileSystemProvider: fsProvider_1.getFsProvider() });
    }
    function assertDynamicLinks(docUri, input, expected) {
        return __awaiter(this, void 0, void 0, function () {
            var ls, document, stylesheet, links;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ls = getSCSSLS();
                        document = cssLanguageService_1.TextDocument.create(docUri, 'scss', 0, input);
                        stylesheet = ls.parseStylesheet(document);
                        return [4 /*yield*/, ls.findDocumentLinks2(document, stylesheet, documentContext_1.getDocumentContext(document.uri))];
                    case 1:
                        links = _a.sent();
                        assert.deepEqual(links, expected);
                        return [2 /*return*/];
                }
            });
        });
    }
    function assertNoDynamicLinks(docUri, input) {
        return __awaiter(this, void 0, void 0, function () {
            var ls, document, stylesheet, links;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ls = getSCSSLS();
                        document = cssLanguageService_1.TextDocument.create(docUri, 'scss', 0, input);
                        stylesheet = ls.parseStylesheet(document);
                        return [4 /*yield*/, ls.findDocumentLinks2(document, stylesheet, documentContext_1.getDocumentContext(document.uri))];
                    case 1:
                        links = _a.sent();
                        assert.deepEqual(links.length, 0, docUri.toString() + " should have no link");
                        return [2 /*return*/];
                }
            });
        });
    }
    suite('SCSS - Navigation', function () {
        suite('Scopes and Symbols', function () {
            test('symbols in scopes', function () {
                var ls = getSCSSLS();
                navigation_test_1.assertSymbolsInScope(ls, '$var: iable;', 0, { name: '$var', type: nodes.ReferenceType.Variable });
                navigation_test_1.assertSymbolsInScope(ls, '$var: iable;', 11, { name: '$var', type: nodes.ReferenceType.Variable });
                navigation_test_1.assertSymbolsInScope(ls, '$var: iable; .class { $color: blue; }', 11, { name: '$var', type: nodes.ReferenceType.Variable }, { name: '.class', type: nodes.ReferenceType.Rule });
                navigation_test_1.assertSymbolsInScope(ls, '$var: iable; .class { $color: blue; }', 22, { name: '$color', type: nodes.ReferenceType.Variable });
                navigation_test_1.assertSymbolsInScope(ls, '$var: iable; .class { $color: blue; }', 36, { name: '$color', type: nodes.ReferenceType.Variable });
                navigation_test_1.assertSymbolsInScope(ls, '@namespace "x"; @mixin mix() {}', 0, { name: 'mix', type: nodes.ReferenceType.Mixin });
                navigation_test_1.assertSymbolsInScope(ls, '@mixin mix { @mixin nested() {} }', 12, { name: 'nested', type: nodes.ReferenceType.Mixin });
                navigation_test_1.assertSymbolsInScope(ls, '@mixin mix () { @mixin nested() {} }', 13);
            });
            test('scopes and symbols', function () {
                var ls = getSCSSLS();
                navigation_test_1.assertScopesAndSymbols(ls, '$var1: 1; $var2: 2; .foo { $var3: 3; }', '$var1,$var2,.foo,[$var3]');
                navigation_test_1.assertScopesAndSymbols(ls, '@mixin mixin1 { $var0: 1} @mixin mixin2($var1) { $var3: 3 }', 'mixin1,mixin2,[$var0],[$var1,$var3]');
                navigation_test_1.assertScopesAndSymbols(ls, 'a b { $var0: 1; c { d { } } }', '[$var0,c,[d,[]]]');
                navigation_test_1.assertScopesAndSymbols(ls, '@function a($p1: 1, $p2: 2) { $v1: 3; @return $v1; }', 'a,[$p1,$p2,$v1]');
                navigation_test_1.assertScopesAndSymbols(ls, '$var1: 3; @if $var1 == 2 { $var2: 1; } @else { $var2: 2; $var3: 2;} ', '$var1,[$var2],[$var2,$var3]');
                navigation_test_1.assertScopesAndSymbols(ls, '@if $var1 == 2 { $var2: 1; } @else if $var1 == 2 { $var3: 2; } @else { $var3: 2; } ', '[$var2],[$var3],[$var3]');
                navigation_test_1.assertScopesAndSymbols(ls, '$var1: 3; @while $var1 < 2 { #rule { a: b; } }', '$var1,[#rule,[]]');
                navigation_test_1.assertScopesAndSymbols(ls, '$i:0; @each $name in f1, f2, f3  { $i:$i+1; }', '$i,[$name,$i]');
                navigation_test_1.assertScopesAndSymbols(ls, '$i:0; @for $x from $i to 5  { }', '$i,[$x]');
                navigation_test_1.assertScopesAndSymbols(ls, '@each $i, $j, $k in f1, f2, f3  { }', '[$i,$j,$k]');
            });
        });
        suite('Highlight', function () {
            test('mark highlights', function () {
                var ls = getSCSSLS();
                navigation_test_1.assertHighlights(ls, '$var1: 1; $var2: /**/$var1;', '$var1', 2, 1);
                navigation_test_1.assertHighlights(ls, '$var1: 1; ls { $var2: /**/$var1; }', '/**/', 2, 1, '$var1');
                navigation_test_1.assertHighlights(ls, 'r1 { $var1: 1; p1: $var1;} r2,r3 { $var1: 1; p1: /**/$var1 + $var1;}', '/**/', 3, 1, '$var1');
                navigation_test_1.assertHighlights(ls, '.r1 { r1: 1em; } r2 { r1: 2em; @extend /**/.r1;}', '/**/', 2, 1, '.r1');
                navigation_test_1.assertHighlights(ls, '/**/%r1 { r1: 1em; } r2 { r1: 2em; @extend %r1;}', '/**/', 2, 1, '%r1');
                navigation_test_1.assertHighlights(ls, '@mixin r1 { r1: $p1; } r2 { r2: 2em; @include /**/r1; }', '/**/', 2, 1, 'r1');
                navigation_test_1.assertHighlights(ls, '@mixin r1($p1) { r1: $p1; } r2 { r2: 2em; @include /**/r1(2px); }', '/**/', 2, 1, 'r1');
                navigation_test_1.assertHighlights(ls, '$p1: 1; @mixin r1($p1: $p1) { r1: $p1; } r2 { r2: 2em; @include /**/r1; }', '/**/', 2, 1, 'r1');
                navigation_test_1.assertHighlights(ls, '/**/$p1: 1; @mixin r1($p1: $p1) { r1: $p1; }', '/**/', 2, 1, '$p1');
                navigation_test_1.assertHighlights(ls, '$p1 : 1; @mixin r1($p1) { r1: /**/$p1; }', '/**/', 2, 1, '$p1');
                navigation_test_1.assertHighlights(ls, '/**/$p1 : 1; @mixin r1($p1) { r1: $p1; }', '/**/', 1, 1, '$p1');
                navigation_test_1.assertHighlights(ls, '$p1 : 1; @mixin r1(/**/$p1) { r1: $p1; }', '/**/', 2, 1, '$p1');
                navigation_test_1.assertHighlights(ls, '$p1 : 1; @function r1($p1, $p2: /**/$p1) { @return $p1 + $p1 + $p2; }', '/**/', 2, 1, '$p1');
                navigation_test_1.assertHighlights(ls, '$p1 : 1; @function r1($p1, /**/$p2: $p1) { @return $p1 + $p2 + $p2; }', '/**/', 3, 1, '$p2');
                navigation_test_1.assertHighlights(ls, '@function r1($p1, $p2) { @return $p1 + $p2; } @function r2() { @return /**/r1(1, 2); }', '/**/', 2, 1, 'r1');
                navigation_test_1.assertHighlights(ls, '@function /**/r1($p1, $p2) { @return $p1 + $p2; } @function r2() { @return r1(1, 2); } ls { x: r2(); }', '/**/', 2, 1, 'r1');
                navigation_test_1.assertHighlights(ls, '@function r1($p1, $p2) { @return $p1 + $p2; } @function r2() { @return r1(/**/$p1 : 1, $p2 : 2); } ls { x: r2(); }', '/**/', 3, 1, '$p1');
                navigation_test_1.assertHighlights(ls, '@mixin /*here*/foo { display: inline } foo { @include foo; }', '/*here*/', 2, 1, 'foo');
                navigation_test_1.assertHighlights(ls, '@mixin foo { display: inline } foo { @include /*here*/foo; }', '/*here*/', 2, 1, 'foo');
                navigation_test_1.assertHighlights(ls, '@mixin foo { display: inline } /*here*/foo { @include foo; }', '/*here*/', 1, 1, 'foo');
                navigation_test_1.assertHighlights(ls, '@function /*here*/foo($i) { @return $i*$i; } #foo { width: foo(2); }', '/*here*/', 2, 1, 'foo');
                navigation_test_1.assertHighlights(ls, '@function foo($i) { @return $i*$i; } #foo { width: /*here*/foo(2); }', '/*here*/', 2, 1, 'foo');
                navigation_test_1.assertHighlights(ls, '.text { @include mixins.responsive using ($multiplier) { font-size: /*here*/$multiplier * 10px; } }', '/*here*/$', 2, 1, '$multiplier');
            });
        });
        suite('Links', function () {
            // For invalid links that have no corresponding file on disk, return no link
            test('Invalid SCSS partial file links', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fixtureRoot, getDocumentUri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fixtureRoot = path.resolve(__dirname, '../../../../src/test/scss/linkFixture/non-existent');
                            getDocumentUri = function (relativePath) {
                                return vscode_uri_1.URI.file(path.resolve(fixtureRoot, relativePath)).toString();
                            };
                            return [4 /*yield*/, assertNoDynamicLinks(getDocumentUri('./index.scss'), "@import 'foo'")];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, assertNoDynamicLinks(getDocumentUri('./index.scss'), "@import './foo'")];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, assertNoDynamicLinks(getDocumentUri('./index.scss'), "@import './_foo'")];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, assertNoDynamicLinks(getDocumentUri('./index.scss'), "@import './foo-baz'")];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('SCSS partial file dynamic links', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fixtureRoot, getDocumentUri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fixtureRoot = path.resolve(__dirname, '../../../../src/test/scss/linkFixture');
                            getDocumentUri = function (relativePath) {
                                return vscode_uri_1.URI.file(path.resolve(fixtureRoot, relativePath)).toString();
                            };
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./noUnderscore/index.scss'), "@import 'foo'", [
                                    { range: navigation_test_1.newRange(8, 13), target: getDocumentUri('./noUnderscore/foo.scss') }
                                ])];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./underscore/index.scss'), "@import 'foo'", [
                                    { range: navigation_test_1.newRange(8, 13), target: getDocumentUri('./underscore/_foo.scss') }
                                ])];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./both/index.scss'), "@import 'foo'", [
                                    { range: navigation_test_1.newRange(8, 13), target: getDocumentUri('./both/foo.scss') }
                                ])];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./both/index.scss'), "@import '_foo'", [
                                    { range: navigation_test_1.newRange(8, 14), target: getDocumentUri('./both/_foo.scss') }
                                ])];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./index/index.scss'), "@import 'foo'", [
                                    { range: navigation_test_1.newRange(8, 13), target: getDocumentUri('./index/foo/index.scss') }
                                ])];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./index/index.scss'), "@import 'bar'", [
                                    { range: navigation_test_1.newRange(8, 13), target: getDocumentUri('./index/bar/_index.scss') }
                                ])];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('SCSS straight links', function () { return __awaiter(void 0, void 0, void 0, function () {
                var ls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ls = getSCSSLS();
                            return [4 /*yield*/, navigation_test_1.assertLinks(ls, "@import 'foo.css'", [
                                    { range: navigation_test_1.newRange(8, 17), target: 'test://test/foo.css' }
                                ], 'scss')];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, navigation_test_1.assertLinks(ls, "@import 'foo.scss' print;", [
                                    { range: navigation_test_1.newRange(8, 18), target: 'test://test/foo.scss' }
                                ])];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, navigation_test_1.assertLinks(ls, "@import 'http://foo.com/foo.css'", [
                                    { range: navigation_test_1.newRange(8, 32), target: 'http://foo.com/foo.css' }
                                ], 'scss')];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, navigation_test_1.assertLinks(ls, "@import url(\"foo.css\") print;", [
                                    { range: navigation_test_1.newRange(12, 21), target: 'test://test/foo.css' }
                                ])];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('SCSS module file links', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fixtureRoot, getDocumentUri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fixtureRoot = path.resolve(__dirname, '../../../../src/test/scss/linkFixture/module');
                            getDocumentUri = function (relativePath) {
                                return vscode_uri_1.URI.file(path.resolve(fixtureRoot, relativePath)).toString();
                            };
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./index.scss'), "@use './foo' as f", [
                                    { range: navigation_test_1.newRange(5, 12), target: getDocumentUri('./foo.scss') }
                                ])];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, assertDynamicLinks(getDocumentUri('./index.scss'), "@forward './foo' hide $private", [
                                    { range: navigation_test_1.newRange(9, 16), target: getDocumentUri('./foo.scss') }
                                ])];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, assertNoDynamicLinks(getDocumentUri('./index.scss'), "@use 'sass:math'")];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, assertNoDynamicLinks(getDocumentUri('./index.scss'), "@use './non-existent'")];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('SCSS empty path', function () { return __awaiter(void 0, void 0, void 0, function () {
                var ls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ls = getSCSSLS();
                            /**
                             * https://github.com/microsoft/vscode/issues/79215
                             * No valid path — gradient-verlay.png is authority and path is ''
                             */
                            return [4 /*yield*/, navigation_test_1.assertLinks(ls, "#navigation { background: #3d3d3d url(gantry-media://gradient-overlay.png); }", [
                                    { range: navigation_test_1.newRange(38, 73), target: 'gantry-media://gradient-overlay.png' }
                                ], 'scss')];
                        case 1:
                            /**
                             * https://github.com/microsoft/vscode/issues/79215
                             * No valid path — gradient-verlay.png is authority and path is ''
                             */
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('SCSS node module resolving', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var ls, testUri, workspaceFolder;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ls = getSCSSLS();
                                testUri = navigation_test_1.getTestResource('about.scss');
                                workspaceFolder = navigation_test_1.getTestResource('');
                                return [4 /*yield*/, navigation_test_1.assertLinks(ls, 'html { background-image: url("~foo/hello.html")', [{ range: navigation_test_1.newRange(29, 46), target: navigation_test_1.getTestResource('node_modules/foo/hello.html') }], 'scss', testUri, workspaceFolder)];
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
                var ls = getSCSSLS();
                navigation_test_1.assertColorSymbols(ls, '$colors: (blue: $blue,indigo: $indigo)'); // issue #47209
            });
        });
    });
});
