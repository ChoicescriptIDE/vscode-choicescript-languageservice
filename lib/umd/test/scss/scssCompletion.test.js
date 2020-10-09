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
        define(["require", "exports", "path", "../../cssLanguageService", "../css/completion.test", "../css/navigation.test", "vscode-uri"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var cssLanguageService_1 = require("../../cssLanguageService");
    var completion_test_1 = require("../css/completion.test");
    var navigation_test_1 = require("../css/navigation.test");
    var vscode_uri_1 = require("vscode-uri");
    function testCompletionFor(value, expected, settings, testUri, workspaceFolderUri) {
        if (settings === void 0) { settings = undefined; }
        if (testUri === void 0) { testUri = 'test://test/test.scss'; }
        if (workspaceFolderUri === void 0) { workspaceFolderUri = 'test://test'; }
        return completion_test_1.testCompletionFor(value, expected, settings, testUri, workspaceFolderUri);
    }
    ;
    suite('SCSS - Completions', function () {
        test('stylesheet', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('$i: 0; body { width: |', {
                            items: [
                                { label: '$i', documentation: '0' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@for $i from 1 through 3 { .item-#{|} { width: 2em * $i; } }', {
                                items: [
                                    { label: '$i' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@for $i from 1 through 3 { .item-#{|$i} { width: 2em * $i; } }', {
                                items: [
                                    { label: '$i' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { background-color: d|', {
                                items: [
                                    { label: 'darken', resultText: '.foo { background-color: darken(\\$color: ${1:#000000}, \\$amount: ${2:0})' },
                                    { label: 'desaturate' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@function foo($x, $y) { @return $x + $y; } .foo { background-color: f|', {
                                items: [
                                    { label: 'foo', resultText: '@function foo($x, $y) { @return $x + $y; } .foo { background-color: foo(${1:$x}, ${2:$y})' }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@mixin mixin($a: 1, $b) { content: $|}', {
                                items: [
                                    { label: '$a', documentation: '1', detail: 'argument from \'mixin\'' },
                                    { label: '$b', documentation: null, detail: 'argument from \'mixin\'' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@mixin mixin($a: 1, $b) { content: $a + $b; } @include m|', {
                                items: [
                                    { label: 'mixin', resultText: '@mixin mixin($a: 1, $b) { content: $a + $b; } @include mixin(${1:$a}, ${2:$b})' }
                                ]
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('di| span { } ', {
                                items: [
                                    { label: 'div' },
                                    { label: 'display', notAvailable: true }
                                ]
                            })];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('span { di|} ', {
                                items: [
                                    { notAvailable: true, label: 'div' },
                                    { label: 'display' }
                                ]
                            })];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { .|', {
                                items: [
                                    { label: '.foo' }
                                ]
                            })];
                    case 10:
                        _a.sent();
                        // issue #250
                        return [4 /*yield*/, testCompletionFor('.foo { display: block;|', {
                                count: 0
                            })];
                    case 11:
                        // issue #250
                        _a.sent();
                        // issue #17726
                        return [4 /*yield*/, testCompletionFor('.foo { &:|', {
                                items: [
                                    { label: ':last-of-type', resultText: '.foo { &:last-of-type' }
                                ]
                            })];
                    case 12:
                        // issue #17726
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { &:l|', {
                                items: [
                                    { label: ':last-of-type', resultText: '.foo { &:last-of-type' }
                                ]
                            })];
                    case 13:
                        _a.sent();
                        // issue 33911
                        return [4 /*yield*/, testCompletionFor('@include media(\'ddd\') { dis| &:not(:first-child) {', {
                                items: [
                                    { label: 'display' }
                                ]
                            })];
                    case 14:
                        // issue 33911
                        _a.sent();
                        // issue 43876
                        return [4 /*yield*/, testCompletionFor('.foo { } @mixin bar { @extend | }', {
                                items: [
                                    { label: '.foo' }
                                ]
                            })];
                    case 15:
                        // issue 43876
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { } @mixin bar { @extend fo| }', {
                                items: [
                                    { label: '.foo' }
                                ]
                            })];
                    case 16:
                        _a.sent();
                        // issue 76572
                        return [4 /*yield*/, testCompletionFor('.foo { mask: no|', {
                                items: [
                                    { label: 'round' }
                                ]
                            })];
                    case 17:
                        // issue 76572
                        _a.sent();
                        // issue 76507
                        return [4 /*yield*/, testCompletionFor('.foo { .foobar { .foobar2 {  outline-color: blue; cool  }| } .fokzlb {} .baaaa { counter - reset: unset;}', {
                                items: [
                                    { label: 'display' }
                                ]
                            })];
                    case 18:
                        // issue 76507
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('div { &:hover { } | }', {
                                items: [
                                    { label: 'display' }
                                ]
                            })];
                    case 19:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('suggestParticipants', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor("html { @include | }", {
                            participant: {
                                onMixinReference: [{ mixinName: '', range: navigation_test_1.newRange(16, 16) }]
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { @include m| }", {
                                participant: {
                                    onMixinReference: [{ mixinName: 'm', range: navigation_test_1.newRange(16, 17) }]
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { @include mixin(|) }", {
                                participant: {
                                    onMixinReference: [{ mixinName: '', range: navigation_test_1.newRange(22, 22) }]
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('at rules', function () { return __awaiter(void 0, void 0, void 0, function () {
            var allAtProposals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allAtProposals = {
                            items: [
                                { label: '@extend' },
                                { label: '@at-root' },
                                { label: '@debug' },
                                { label: '@warn' },
                                { label: '@error' },
                                { label: '@if' },
                                { label: '@for' },
                                { label: '@each' },
                                { label: '@while' },
                                { label: '@mixin' },
                                { label: '@include' },
                                { label: '@function' }
                            ]
                        };
                        return [4 /*yield*/, testCompletionFor('@', {
                                items: [
                                    { label: '@extend' },
                                    { label: '@at-root' },
                                    { label: '@debug' },
                                    { label: '@warn' },
                                    { label: '@error' },
                                    { label: '@if', insertTextFormat: cssLanguageService_1.InsertTextFormat.Snippet },
                                    { label: '@for', insertTextFormat: cssLanguageService_1.InsertTextFormat.Snippet },
                                    { label: '@each', insertTextFormat: cssLanguageService_1.InsertTextFormat.Snippet },
                                    { label: '@while', insertTextFormat: cssLanguageService_1.InsertTextFormat.Snippet },
                                    { label: '@mixin', insertTextFormat: cssLanguageService_1.InsertTextFormat.Snippet },
                                    { label: '@include' },
                                    { label: '@function' }
                                ]
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { | }', allAtProposals)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("@for $i from 1 through 3 { .item-#{$i} { width: 2em * $i; } } @|", allAtProposals)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { @if $a = 5 { } @| }', allAtProposals)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { @debug 10em + 22em; @| }', allAtProposals)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { @if $a = 5 { } @f| }', {
                                items: [
                                    { label: '@for' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        suite('Modules', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                test('module-loading at-rules', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var builtIns;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, testCompletionFor('@', {
                                    items: [
                                        { label: '@use', documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/at-rules/use)' },
                                        { label: '@forward', documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/at-rules/forward)' },
                                    ],
                                })];
                            case 1:
                                _a.sent();
                                // Limit to top-level scope.
                                return [4 /*yield*/, testCompletionFor('.foo { @| }', {
                                        items: [
                                            { label: '@use', notAvailable: true },
                                            { label: '@forward', notAvailable: true },
                                        ],
                                    })];
                            case 2:
                                // Limit to top-level scope.
                                _a.sent();
                                builtIns = {
                                    items: [
                                        { label: 'sass:math', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/math)' },
                                        { label: 'sass:string', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/string)' },
                                        { label: 'sass:color', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/color)' },
                                        { label: 'sass:list', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/list)' },
                                        { label: 'sass:map', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/map)' },
                                        { label: 'sass:selector', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/selector)' },
                                        { label: 'sass:meta', kind: cssLanguageService_1.CompletionItemKind.Module, documentationIncludes: '[Sass documentation](https://sass-lang.com/documentation/modules/meta)' },
                                    ],
                                };
                                return [4 /*yield*/, testCompletionFor("@use '|'", builtIns)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, testCompletionFor("@forward '|'", builtIns)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, testCompletionFor("@use 'sass:|'", {
                                        items: [
                                            { label: 'sass:math', resultText: "@use 'sass:math'" }
                                        ],
                                    })];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, testCompletionFor("@use '|'", {
                                        items: [
                                            { label: 'sass:math', resultText: "@use 'sass:math'" }
                                        ],
                                    })];
                            case 6:
                                _a.sent();
                                return [4 /*yield*/, testCompletionFor("@use '|", {
                                        items: [
                                            { label: 'sass:math', resultText: "@use 'sass:math'" }
                                        ],
                                    })];
                            case 7:
                                _a.sent();
                                return [4 /*yield*/, testCompletionFor("@use './|'", {
                                        participant: {
                                            onImportPath: [{ pathValue: "'./'", position: cssLanguageService_1.Position.create(0, 8), range: navigation_test_1.newRange(5, 9) }]
                                        }
                                    })];
                            case 8:
                                _a.sent();
                                return [4 /*yield*/, testCompletionFor("@forward './|'", {
                                        participant: {
                                            onImportPath: [{ pathValue: "'./'", position: cssLanguageService_1.Position.create(0, 12), range: navigation_test_1.newRange(9, 13) }]
                                        }
                                    })];
                            case 9:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        test('Enum + color restrictions are sorted properly', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('.foo { text-decoration: | }', {
                            items: [
                                // Enum come before everything
                                { label: 'dashed', sortText: ' ' },
                                // Others come later
                                { label: 'aqua', sortText: undefined },
                                { label: 'inherit', sortText: undefined }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        var testFixturesPath = path.join(__dirname, '../../../../test');
        /**
         * For SCSS, `@import 'foo';` can be used for importing partial file `_foo.scss`
         */
        test('SCSS @import Path completion', function () {
            return __awaiter(this, void 0, void 0, function () {
                var testCSSUri, workspaceFolderUri, testSCSSUri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            testCSSUri = vscode_uri_1.URI.file(path.resolve(testFixturesPath, 'pathCompletionFixtures/about/about.css')).toString();
                            workspaceFolderUri = vscode_uri_1.URI.file(path.resolve(testFixturesPath)).toString();
                            /**
                             * We are in a CSS file, so no special treatment for SCSS partial files
                            */
                            return [4 /*yield*/, completion_test_1.testCompletionFor("@import '../scss/|'", {
                                    items: [
                                        { label: 'main.scss', resultText: "@import '../scss/main.scss'" },
                                        { label: '_foo.scss', resultText: "@import '../scss/_foo.scss'" }
                                    ]
                                }, undefined, testCSSUri, workspaceFolderUri)];
                        case 1:
                            /**
                             * We are in a CSS file, so no special treatment for SCSS partial files
                            */
                            _a.sent();
                            testSCSSUri = vscode_uri_1.URI.file(path.resolve(testFixturesPath, 'pathCompletionFixtures/scss/main.scss')).toString();
                            return [4 /*yield*/, testCompletionFor("@import './|'", {
                                    items: [
                                        { label: '_foo.scss', resultText: "@import './foo'" }
                                    ]
                                }, undefined, testSCSSUri, workspaceFolderUri)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
