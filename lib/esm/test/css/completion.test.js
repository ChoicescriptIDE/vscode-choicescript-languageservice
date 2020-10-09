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
import * as path from 'path';
import { getCSSLanguageService, TextDocument, Position, CompletionItemKind, InsertTextFormat, Range, getSCSSLanguageService, getLESSLanguageService, newCSSDataProvider } from '../../cssLanguageService';
import { getDocumentContext } from '../testUtil/documentContext';
import { URI } from 'vscode-uri';
import { getFsProvider } from '../testUtil/fsProvider';
import { TextEdit } from 'vscode-languageserver-types';
export function assertCompletion(completions, expected, document) {
    var matches = completions.items.filter(function (completion) {
        return completion.label === expected.label;
    });
    if (expected.notAvailable) {
        assert.equal(matches.length, 0, expected.label + " should not be present");
    }
    else {
        assert.equal(matches.length, 1, expected.label + " should only existing once: Actual: " + completions.items.map(function (c) { return c.label; }).join(', '));
    }
    var match = matches[0];
    if (expected.detail) {
        assert.equal(match.detail, expected.detail);
    }
    if (expected.documentation) {
        assert.deepEqual(match.documentation, expected.documentation);
    }
    if (expected.documentationIncludes) {
        assert.ok(match.documentation !== undefined);
        if (typeof match.documentation === 'string') {
            assert.ok(match.documentation.indexOf(expected.documentationIncludes) !== -1);
        }
        else {
            assert.ok(match.documentation.value.indexOf(expected.documentationIncludes) !== -1);
        }
    }
    if (expected.kind) {
        assert.equal(match.kind, expected.kind);
    }
    if (expected.resultText && match.textEdit) {
        var edit = TextEdit.is(match.textEdit) ? match.textEdit : TextEdit.replace(match.textEdit.replace, match.textEdit.newText);
        assert.equal(TextDocument.applyEdits(document, [edit]), expected.resultText);
    }
    if (expected.insertTextFormat) {
        assert.equal(match.insertTextFormat, expected.insertTextFormat);
    }
    if (expected.command) {
        assert.deepEqual(match.command, expected.command);
    }
    if (expected.sortText) {
        assert.equal(match.sortText, expected.sortText);
    }
}
;
export function testCompletionFor(value, expected, settings, testUri, workspaceFolderUri, customData) {
    if (settings === void 0) { settings = {
        completion: {
            triggerPropertyValueCompletion: true,
            completePropertyWithSemicolon: false
        }
    }; }
    if (testUri === void 0) { testUri = 'test://test/test.css'; }
    if (workspaceFolderUri === void 0) { workspaceFolderUri = 'test://test'; }
    if (customData === void 0) { customData = []; }
    return __awaiter(this, void 0, void 0, function () {
        var offset, actualPropertyContexts, actualPropertyValueContexts, actualURILiteralValueContexts, actualImportPathContexts, actualMixinReferenceContexts, lang, lsOptions, ls, document, position, jsonDoc, context, list, _i, _a, item;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    offset = value.indexOf('|');
                    value = value.substr(0, offset) + value.substr(offset + 1);
                    actualPropertyContexts = [];
                    actualPropertyValueContexts = [];
                    actualURILiteralValueContexts = [];
                    actualImportPathContexts = [];
                    actualMixinReferenceContexts = [];
                    lang = path.extname(testUri).substr(1);
                    lsOptions = { fileSystemProvider: getFsProvider() };
                    if (lang === 'scss') {
                        ls = getSCSSLanguageService(lsOptions);
                    }
                    else if (lang === 'less') {
                        ls = getLESSLanguageService(lsOptions);
                    }
                    else {
                        ls = getCSSLanguageService(lsOptions);
                    }
                    ls.setDataProviders(true, customData);
                    ls.configure(settings);
                    if (expected.participant) {
                        ls.setCompletionParticipants([
                            {
                                onCssProperty: function (context) { return actualPropertyContexts.push(context); },
                                onCssPropertyValue: function (context) { return actualPropertyValueContexts.push(context); },
                                onCssURILiteralValue: function (context) { return actualURILiteralValueContexts.push(context); },
                                onCssImportPath: function (context) { return actualImportPathContexts.push(context); },
                                onCssMixinReference: function (context) { return actualMixinReferenceContexts.push(context); }
                            }
                        ]);
                    }
                    document = TextDocument.create(testUri, lang, 0, value);
                    position = Position.create(0, offset);
                    jsonDoc = ls.parseStylesheet(document);
                    context = getDocumentContext(workspaceFolderUri);
                    return [4 /*yield*/, ls.doComplete2(document, position, jsonDoc, context)];
                case 1:
                    list = _b.sent();
                    if (typeof expected.count === 'number') {
                        assert.equal(list.items.length, expected.count);
                    }
                    if (expected.items) {
                        for (_i = 0, _a = expected.items; _i < _a.length; _i++) {
                            item = _a[_i];
                            assertCompletion(list, item, document);
                        }
                    }
                    if (expected.participant) {
                        if (expected.participant.onProperty) {
                            assert.deepEqual(actualPropertyContexts, expected.participant.onProperty);
                        }
                        if (expected.participant.onPropertyValue) {
                            assert.deepEqual(actualPropertyValueContexts, expected.participant.onPropertyValue);
                        }
                        if (expected.participant.onURILiteralValue) {
                            assert.deepEqual(actualURILiteralValueContexts, expected.participant.onURILiteralValue);
                        }
                        if (expected.participant.onImportPath) {
                            assert.deepEqual(actualImportPathContexts, expected.participant.onImportPath);
                        }
                        if (expected.participant.onMixinReference) {
                            assert.deepEqual(actualMixinReferenceContexts, expected.participant.onMixinReference);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
;
suite('CSS - Completion', function () {
    test('stylesheet', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('| ', {
                            items: [
                                { label: '@import', resultText: '@import ' },
                                { label: '@keyframes', resultText: '@keyframes ' },
                                { label: 'div', resultText: 'div ' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('| body {', {
                                items: [
                                    { label: '@import', resultText: '@import body {' },
                                    { label: '@keyframes', resultText: '@keyframes body {' },
                                    { label: 'html', resultText: 'html body {' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('h| {', {
                                items: [
                                    { label: 'html', resultText: 'html {' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo |{ ', {
                                items: [
                                    { label: 'html', resultText: '.foo html{ ' },
                                    { notAvailable: true, label: 'display' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('selectors', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('a:h| ', {
                            items: [
                                { label: ':hover', resultText: 'a:hover ' },
                                { label: '::after', resultText: 'a::after ' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a::h| ', {
                                items: [
                                    { label: ':hover', resultText: 'a:hover ' },
                                    { label: '::after', resultText: 'a::after ' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a::| ', {
                                items: [
                                    { label: ':hover', resultText: 'a:hover ' },
                                    { label: '::after', resultText: 'a::after ' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a:| ', {
                                items: [
                                    { label: ':hover', resultText: 'a:hover ' },
                                    { label: '::after', resultText: 'a::after ' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a:|hover ', {
                                items: [
                                    { label: ':hover', resultText: 'a:hover ' },
                                    { label: '::after', resultText: 'a::after ' }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a#| ', {
                                items: [
                                    { label: ':hover', resultText: 'a:hover ' },
                                    { label: '::after', resultText: 'a::after ' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a.| ', {
                                items: [
                                    { label: ':hover', resultText: 'a:hover ' },
                                    { label: '::after', resultText: 'a::after ' }
                                ]
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.a:| ', {
                                items: [
                                    { label: ':hover', resultText: '.a:hover ' },
                                    { label: '::after', resultText: '.a::after ' }
                                ]
                            })];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('properties', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body {|', {
                            items: [
                                { label: 'display', resultText: 'body {display: ' },
                                { label: 'background', resultText: 'body {background: ' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { ver|', {
                                items: [
                                    { label: 'vertical-align', resultText: 'body { vertical-align: ' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-ali|gn', {
                                items: [
                                    { label: 'vertical-align', resultText: 'body { vertical-align: ' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align|', {
                                items: [
                                    { label: 'vertical-align', resultText: 'body { vertical-align: ' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align|: bottom;}', {
                                items: [
                                    { label: 'vertical-align', resultText: 'body { vertical-align: bottom;}' }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { trans| ', {
                                items: [
                                    { label: 'transition', resultText: 'body { transition:  ' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('MDN properties', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { m|', {
                            items: [
                                { label: 'mask', resultText: 'body { mask: ' },
                                { label: 'mask-border', resultText: 'body { mask-border: ' },
                                { label: '-webkit-mask', resultText: 'body { -webkit-mask: ' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('values', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { vertical-align:| bottom;}', {
                            items: [
                                { label: 'bottom', resultText: 'body { vertical-align:bottom bottom;}' },
                                { label: '0cm', resultText: 'body { vertical-align:0cm bottom;}' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: |bottom;}', {
                                items: [
                                    { label: 'bottom', resultText: 'body { vertical-align: bottom;}' },
                                    { label: '0cm', resultText: 'body { vertical-align: 0cm;}' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: bott|', {
                                items: [
                                    { label: 'bottom', resultText: 'body { vertical-align: bottom' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: bott|om }', {
                                items: [
                                    { label: 'bottom', resultText: 'body { vertical-align: bottom }' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: bottom| }', {
                                items: [
                                    { label: 'bottom', resultText: 'body { vertical-align: bottom }' }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align:bott|', {
                                items: [
                                    { label: 'bottom', resultText: 'body { vertical-align:bottom' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: bottom|; }', {
                                items: [
                                    { label: 'bottom', resultText: 'body { vertical-align: bottom; }' }
                                ]
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: bottom;| }', {
                                count: 0
                            })];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: bottom; |}', {
                                items: [
                                    { label: 'display', resultText: 'body { vertical-align: bottom; display: }' }
                                ]
                            })];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.head { background-image: |}', {
                                items: [
                                    { label: 'url()', resultText: '.head { background-image: url($1)}' }
                                ]
                            })];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('#id { justify-content: |', {
                                items: [
                                    { label: 'center', resultText: '#id { justify-content: center' },
                                    { label: 'start', resultText: '#id { justify-content: start' },
                                    { label: 'end', resultText: '#id { justify-content: end' },
                                    { label: 'left', resultText: '#id { justify-content: left' },
                                    { label: 'right', resultText: '#id { justify-content: right' },
                                    { label: 'space-evenly', resultText: '#id { justify-content: space-evenly' }
                                ]
                            })];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { te:n| }', {
                                items: [
                                    { label: 'n', notAvailable: true }
                                ]
                            })];
                    case 12:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('functions', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('@keyframes fadeIn { 0% { transform: s|', {
                            items: [
                                { label: 'scaleX()', resultText: '@keyframes fadeIn { 0% { transform: scaleX($1)', insertTextFormat: InsertTextFormat.Snippet }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('positions', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('html { background-position: t|', {
                            items: [
                                { label: 'top', resultText: 'html { background-position: top' },
                                { label: 'right', resultText: 'html { background-position: right' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('units', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { vertical-align: 9| }', {
                            items: [
                                { label: '9cm', resultText: 'body { vertical-align: 9cm }' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: 1.2| }', {
                                items: [
                                    { label: '1.2em', resultText: 'body { vertical-align: 1.2em }' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: 1|0 }', {
                                items: [
                                    { label: '1cm', resultText: 'body { vertical-align: 1cm }' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { vertical-align: 10c| }', {
                                items: [
                                    { label: '10cm', resultText: 'body { vertical-align: 10cm }' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { top: -2px| }', {
                                items: [
                                    { label: '-2px', resultText: 'body { top: -2px }' }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('unknown', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { notexisting: |;}', {
                            count: 0
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { unknown: foo; } .bar { unknown:| }', {
                                items: [
                                    { label: 'foo', kind: CompletionItemKind.Value, resultText: '.foo { unknown: foo; } .bar { unknown:foo }' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('colors', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { border-right: |', {
                            items: [
                                { label: 'cyan', resultText: 'body { border-right: cyan' },
                                { label: 'dotted', resultText: 'body { border-right: dotted' },
                                { label: '0em', resultText: 'body { border-right: 0em' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { border-right: cyan| dotted 2em ', {
                                items: [
                                    { label: 'cyan', resultText: 'body { border-right: cyan dotted 2em ' },
                                    { label: 'darkcyan', resultText: 'body { border-right: darkcyan dotted 2em ' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { border-right: dotted 2em |', {
                                items: [
                                    { label: 'cyan', resultText: 'body { border-right: dotted 2em cyan' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { background-color: #123456; } .bar { background-color:| }', {
                                items: [
                                    { label: '#123456', kind: CompletionItemKind.Color, resultText: '.foo { background-color: #123456; } .bar { background-color:#123456 }' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.bar { background-color: #123| }', {
                                items: [
                                    { label: '#123', notAvailable: true }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { background-color: r|', {
                                items: [
                                    { label: 'rgb', kind: CompletionItemKind.Function, resultText: '.foo { background-color: rgb(${1:red}, ${2:green}, ${3:blue})' },
                                    { label: 'rgba', kind: CompletionItemKind.Function, resultText: '.foo { background-color: rgba(${1:red}, ${2:green}, ${3:blue}, ${4:alpha})' },
                                    { label: 'red', kind: CompletionItemKind.Color, resultText: '.foo { background-color: red' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('variables', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor(':root { --myvar: red; } body { color: |', {
                            items: [
                                { label: '--myvar', documentation: 'red', resultText: ':root { --myvar: red; } body { color: var(--myvar)' },
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { --myvar: 0px; border-right: var| ', {
                                items: [
                                    { label: '--myvar', documentation: '0px', resultText: 'body { --myvar: 0px; border-right: var(--myvar) ' },
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { --myvar: 0px; border-right: var(| ', {
                                items: [
                                    { label: '--myvar', documentation: '0px', resultText: 'body { --myvar: 0px; border-right: var(--myvar ' },
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('a { color: | } :root { --bg-color: red; } ', {
                                items: [
                                    { label: '--bg-color', documentation: 'red', resultText: 'a { color: var(--bg-color) } :root { --bg-color: red; } ' },
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('support', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('@supports (display: flex) { |', {
                            items: [
                                { label: 'html', resultText: '@supports (display: flex) { html' },
                                { label: 'display', notAvailable: true }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@supports (| ) { }', {
                                items: [
                                    { label: 'display', resultText: '@supports (display:  ) { }' },
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@supports (di| ) { }', {
                                items: [
                                    { label: 'display', resultText: '@supports (display:  ) { }' },
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@supports (display: | ) { }', {
                                items: [
                                    { label: 'flex', resultText: '@supports (display: flex ) { }' },
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@supports (display: flex ) | { }', {
                                items: [
                                    { label: 'display', notAvailable: true },
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@supports |(display: flex ) { }', {
                                items: [
                                    { label: 'display', notAvailable: true },
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('suggestParticipants', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('html { bac|', {
                            participant: {
                                onProperty: [{ propertyName: 'bac', range: newRange(7, 10) }],
                                onPropertyValue: []
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('html { disp|lay: none', {
                                participant: {
                                    onProperty: [{ propertyName: 'disp', range: newRange(7, 11) }],
                                    onPropertyValue: []
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('html { background-position: t|', {
                                items: [
                                    { label: 'center' },
                                ],
                                participant: {
                                    onProperty: [],
                                    onPropertyValue: [{ propertyName: 'background-position', propertyValue: 't', range: newRange(28, 29) }]
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url(|)", {
                                count: 0,
                                participant: {
                                    onURILiteralValue: [{ uriValue: '', position: Position.create(0, 29), range: newRange(29, 29) }]
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('|')", {
                                count: 0,
                                participant: {
                                    onURILiteralValue: [{ uriValue: "''", position: Position.create(0, 30), range: newRange(29, 31) }]
                                }
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url(\"b|\")", {
                                count: 0,
                                participant: {
                                    onURILiteralValue: [{ uriValue: "\"b\"", position: Position.create(0, 31), range: newRange(29, 32) }]
                                }
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background: url(\"b|\"", {
                                count: 0,
                                participant: {
                                    onURILiteralValue: [{ uriValue: "\"b\"", position: Position.create(0, 25), range: newRange(23, 26) }]
                                }
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("@import './|'", {
                                count: 0,
                                participant: {
                                    onImportPath: [{ pathValue: "'./'", position: Position.create(0, 11), range: newRange(8, 12) }]
                                }
                            })];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("@import \"./|\";", {
                                count: 0,
                                participant: {
                                    onImportPath: [{ pathValue: "\"./\"", position: Position.create(0, 11), range: newRange(8, 12) }]
                                }
                            })];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("@import \"./|foo\";", {
                                count: 0,
                                participant: {
                                    onImportPath: [{ pathValue: "\"./foo\"", position: Position.create(0, 11), range: newRange(8, 15) }]
                                }
                            })];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('Property completeness', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testCompletionFor('html { text-decoration:|', {
                        items: [
                            { label: 'none' }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('body { disp| ', {
                            items: [
                                { label: 'display', resultText: 'body { display:  ', command: { title: 'Suggest', command: 'editor.action.triggerSuggest' } }
                            ]
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('body { disp| ', {
                            items: [
                                { label: 'display', resultText: 'body { display: $0; ', command: { title: 'Suggest', command: 'editor.action.triggerSuggest' } }
                            ]
                        }, {})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('body { disp| ', {
                            items: [
                                { label: 'display', resultText: 'body { display: $0; ', command: { title: 'Suggest', command: 'editor.action.triggerSuggest' } }
                            ]
                        }, { completion: undefined })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('body { disp| ', {
                            items: [
                                { label: 'display', resultText: 'body { display: $0; ', command: { title: 'Suggest', command: 'editor.action.triggerSuggest' } }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: true } })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('body { disp| ', {
                            items: [
                                { label: 'display', resultText: 'body { display: $0; ', command: undefined }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: false } })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('body { disp| ', {
                            items: [
                                { label: 'display', resultText: 'body { display:  ', command: undefined }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: false, completePropertyWithSemicolon: false } })];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Completion description should include status, browser compat and references', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testCompletionFor('.foo { | }', {
                        items: [
                            {
                                label: 'text-decoration-skip',
                                documentation: {
                                    kind: 'markdown',
                                    value: '⚠️ Property is experimental. Be cautious when using it.️\n\nThe text\\-decoration\\-skip CSS property specifies what parts of the element’s content any text decoration affecting the element must skip over\\. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors\\.\n\n(Safari 12, Chrome 57, Opera 44)\n\nSyntax: none | \\[ objects || \\[ spaces | \\[ leading\\-spaces || trailing\\-spaces \\] \\] || edges || box\\-decoration \\]\n\n[MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip)'
                                }
                            },
                            {
                                label: 'user-select',
                                documentation: {
                                    kind: 'markdown',
                                    value: '🚨️ Property is nonstandard. Avoid using it.\n\nControls the appearance of selection\\.\n\nSyntax: auto | text | none | contain | all\n\n[MDN Reference](https://developer.mozilla.org/docs/Web/CSS/user-select)'
                                }
                            }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("Color swatch for variables that's color", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testCompletionFor('.foo { --foo: #bbb; color: --| }', {
                        items: [
                            {
                                label: '--foo',
                                documentation: '#bbb',
                                kind: CompletionItemKind.Color
                            }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { --foo: #bbbbbb; color: --| }', {
                            items: [
                                {
                                    label: '--foo',
                                    documentation: '#bbbbbb',
                                    kind: CompletionItemKind.Color
                                }
                            ]
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { --foo: red; color: --| }', {
                            items: [
                                {
                                    label: '--foo',
                                    documentation: 'red',
                                    kind: CompletionItemKind.Color
                                }
                            ]
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { --foo: RED; color: --| }', {
                            items: [
                                {
                                    label: '--foo',
                                    documentation: 'RED',
                                    kind: CompletionItemKind.Color
                                }
                            ]
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { --foo: #bbb; color: var(|) }', {
                            items: [
                                {
                                    label: '--foo',
                                    documentation: '#bbb',
                                    kind: CompletionItemKind.Color
                                }
                            ]
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Seimicolon on property completion', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testCompletionFor('.foo { | }', {
                        items: [
                            {
                                label: 'position',
                                resultText: '.foo { position: $0; }'
                            }
                        ]
                    }, { completion: { triggerPropertyValueCompletion: true, completePropertyWithSemicolon: true } })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { p| }', {
                            items: [
                                {
                                    label: 'position',
                                    resultText: '.foo { position: $0; }'
                                }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: true, completePropertyWithSemicolon: true } })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { p|o }', {
                            items: [
                                {
                                    label: 'position',
                                    resultText: '.foo { position:  }'
                                }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: true, completePropertyWithSemicolon: true } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { p|os: relative; }', {
                            items: [
                                {
                                    label: 'position',
                                    resultText: '.foo { position: relative; }'
                                }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: true, completePropertyWithSemicolon: true } })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { p|: ; }', {
                            items: [
                                {
                                    label: 'position',
                                    resultText: '.foo { position: ; }'
                                }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: true, completePropertyWithSemicolon: true } })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, testCompletionFor('.foo { p|; }', {
                            items: [
                                {
                                    label: 'position',
                                    resultText: '.foo { position: ; }'
                                }
                            ]
                        }, { completion: { triggerPropertyValueCompletion: true, completePropertyWithSemicolon: true } })];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // https://github.com/Microsoft/vscode/issues/71791
    test('Items that start with `-` are sorted lower than normal attribute values', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testCompletionFor('.foo { display: | }', {
                        items: [
                            // Enum with no prefix come before everything
                            { label: 'grid', sortText: ' ' },
                            // Enum with prefix come next
                            { label: '-moz-grid', sortText: ' x' },
                            { label: '-ms-grid', sortText: ' x' },
                            // Others come last
                            { label: 'inherit', sortText: undefined }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Properties sorted by relevance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    customData = [newCSSDataProvider({
                            version: 1,
                            properties: [
                                { name: 'foo', relevance: 93 },
                                { name: 'bar', relevance: 1 },
                                { name: '-webkit-bar', relevance: 12 },
                                { name: 'xoo' },
                                { name: 'bar2', relevance: 0 },
                            ]
                        })];
                    return [4 /*yield*/, testCompletionFor('.foo { | }', {
                            items: [
                                { label: 'foo', sortText: 'd_a2' },
                                { label: 'bar', sortText: 'd_fe' },
                                { label: '-webkit-bar', sortText: 'x_f3' },
                                { label: 'xoo', sortText: 'd_cd' },
                                { label: 'bar2', sortText: 'd_ff' }
                            ]
                        }, undefined, undefined, undefined, customData)];
                case 1:
                    _a.sent();
                    assert.ok('d_a2' < 'd_fe');
                    return [2 /*return*/];
            }
        });
    }); });
    var testFixturesPath = path.join(__dirname, '../../../../test');
    test('CSS url() Path completion', function () {
        return __awaiter(this, void 0, void 0, function () {
            var testUri, workspaceFolderUri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUri = URI.file(path.resolve(testFixturesPath, 'pathCompletionFixtures/about/about.css')).toString();
                        workspaceFolderUri = URI.file(path.resolve(testFixturesPath)).toString();
                        return [4 /*yield*/, testCompletionFor('html { background-image: url("./|")', {
                                items: [
                                    { label: 'about.html', resultText: 'html { background-image: url("./about.html")' }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('../|')", {
                                items: [
                                    { label: 'about/', resultText: "html { background-image: url('../about/')" },
                                    { label: 'index.html', resultText: "html { background-image: url('../index.html')" },
                                    { label: 'src/', resultText: "html { background-image: url('../src/')" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('../src/a|')", {
                                items: [
                                    { label: 'feature.js', resultText: "html { background-image: url('../src/feature.js')" },
                                    { label: 'data/', resultText: "html { background-image: url('../src/data/')" },
                                    { label: 'test.js', resultText: "html { background-image: url('../src/test.js')" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('../src/data/f|.asar')", {
                                items: [
                                    { label: 'foo.asar', resultText: "html { background-image: url('../src/data/foo.asar')" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('|')", {
                                items: [
                                    { label: 'about.html', resultText: "html { background-image: url('about.html')" },
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('/|')", {
                                items: [
                                    { label: 'pathCompletionFixtures/', resultText: "html { background-image: url('/pathCompletionFixtures/')" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url('/pathCompletionFixtures/|')", {
                                items: [
                                    { label: 'about/', resultText: "html { background-image: url('/pathCompletionFixtures/about/')" },
                                    { label: 'index.html', resultText: "html { background-image: url('/pathCompletionFixtures/index.html')" },
                                    { label: 'src/', resultText: "html { background-image: url('/pathCompletionFixtures/src/')" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { background-image: url(\"/|\")", {
                                items: [
                                    { label: 'pathCompletionFixtures/', resultText: "html { background-image: url(\"/pathCompletionFixtures/\")" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('CSS url() Path Completion - Unquoted url', function () {
        return __awaiter(this, void 0, void 0, function () {
            var testUri, workspaceFolderUri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUri = URI.file(path.resolve(testFixturesPath, 'pathCompletionFixtures/about/about.css')).toString();
                        workspaceFolderUri = URI.file(path.resolve('testFixturesPath')).toString();
                        return [4 /*yield*/, testCompletionFor('html { background-image: url(./|)', {
                                items: [
                                    { label: 'about.html', resultText: 'html { background-image: url(./about.html)' }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('html { background-image: url(./a|)', {
                                items: [
                                    { label: 'about.html', resultText: 'html { background-image: url(./about.html)' }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('html { background-image: url(../|src/)', {
                                items: [
                                    { label: 'about/', resultText: 'html { background-image: url(../about/)' }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('html { background-image: url(../s|rc/)', {
                                items: [
                                    { label: 'about/', resultText: 'html { background-image: url(../about/)' }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('CSS @import Path completion', function () {
        return __awaiter(this, void 0, void 0, function () {
            var testUri, workspaceFolderUri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUri = URI.file(path.resolve(testFixturesPath, 'pathCompletionFixtures/about/about.css')).toString();
                        workspaceFolderUri = URI.file(path.resolve(testFixturesPath)).toString();
                        return [4 /*yield*/, testCompletionFor("@import './|'", {
                                items: [
                                    { label: 'about.html', resultText: "@import './about.html'" },
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("@import '../|'", {
                                items: [
                                    { label: 'about/', resultText: "@import '../about/'" },
                                    { label: 'scss/', resultText: "@import '../scss/'" },
                                    { label: 'index.html', resultText: "@import '../index.html'" },
                                    { label: 'src/', resultText: "@import '../src/'" }
                                ]
                            }, undefined, testUri, workspaceFolderUri)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('Completion should ignore files/folders starting with dot', function () {
        return __awaiter(this, void 0, void 0, function () {
            var testUri, workspaceFolderUri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUri = URI.file(path.resolve(testFixturesPath, 'pathCompletionFixtures/about/about.css')).toString();
                        workspaceFolderUri = URI.file(path.resolve(testFixturesPath)).toString();
                        return [4 /*yield*/, testCompletionFor('html { background-image: url("../|")', {
                                count: 4
                            }, undefined, testUri, workspaceFolderUri)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
function newRange(start, end) {
    return Range.create(Position.create(0, start), Position.create(0, end));
}
