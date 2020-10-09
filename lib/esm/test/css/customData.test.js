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
import { testCompletionFor } from './completion.test';
import { getCSSLanguageService, TextDocument, newCSSDataProvider } from '../../cssLanguageService';
suite('CSS - Custom Data', function () { return __awaiter(void 0, void 0, void 0, function () {
    var customData, settings;
    return __generator(this, function (_a) {
        customData = [newCSSDataProvider({
                version: 1,
                properties: [
                    {
                        name: 'foo',
                        description: {
                            kind: 'markdown',
                            value: 'Foo property. See link on [MDN](https://developer.mozilla.org/en-US/).',
                        },
                        references: [
                            {
                                name: 'MDN Reference',
                                url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/foo'
                            }
                        ]
                    }
                ],
                atDirectives: [
                    {
                        name: '@foo',
                        description: 'Foo at directive'
                    }
                ],
                pseudoClasses: [
                    {
                        name: ':foo',
                        description: 'Foo pseudo class'
                    }
                ],
                pseudoElements: [
                    {
                        name: '::foo',
                        description: 'Foo pseudo element'
                    }
                ]
            })];
        settings = {
            completion: {
                triggerPropertyValueCompletion: true,
                completePropertyWithSemicolon: true
            }
        };
        test('Completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { | }', {
                            items: [
                                {
                                    label: 'foo',
                                    resultText: 'body { foo: $0; }',
                                    documentation: {
                                        kind: 'markdown',
                                        value: 'Foo property\\. See link on \\[MDN\\]\\(https://developer\\.mozilla\\.org/en\\-US/\\)\\.\n\n[MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/foo)'
                                    }
                                }
                            ]
                        }, settings, undefined, undefined, customData)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('|', {
                                items: [{ label: '@foo', resultText: '@foo' }]
                            }, settings, undefined, undefined, customData)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor(':|', {
                                items: [{ label: ':foo', resultText: ':foo' }]
                            }, settings, undefined, undefined, customData)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('::foo', {
                                items: [{ label: '::foo', resultText: '::foo' }]
                            }, settings, undefined, undefined, customData)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
suite('CSS - Custom Data Diagnostics', function () {
    var customDataProviders = [newCSSDataProvider({
            version: 1,
            properties: [
                {
                    name: 'foo'
                },
                {
                    name: '_foo'
                }
            ],
            atDirectives: [
                {
                    name: '@foo'
                }
            ]
        })];
    var cssLS = getCSSLanguageService({ customDataProviders: customDataProviders });
    var testValidationFor = function (value, expected) {
        var document = TextDocument.create('test://test/test.css', 'css', 0, value);
        var cssDoc = cssLS.parseStylesheet(document);
        var codeList = cssLS.doValidation(document, cssDoc).map(function (d) { return d.code; });
        var message = "Return diagnostics: " + JSON.stringify(codeList) + " do not match expected diagnostics: " + JSON.stringify(expected);
        assert.deepEqual(codeList, expected, message);
    };
    test('No unknown properties', function () {
        testValidationFor('.foo { foo: 1; _foo: 1 }', []);
        testValidationFor('.foo { FOO: 1; }', []);
    });
    test('No unknown at-directives', function () {
        testValidationFor("@foo 'bar';", []);
    });
});
