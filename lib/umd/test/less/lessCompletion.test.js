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
        define(["require", "exports", "../css/completion.test", "../css/navigation.test"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var completion_test_1 = require("../css/completion.test");
    var navigation_test_1 = require("../css/navigation.test");
    function testCompletionFor(value, expected, settings, testUri, workspaceFolderUri) {
        if (settings === void 0) { settings = undefined; }
        if (testUri === void 0) { testUri = 'test://test/test.less'; }
        if (workspaceFolderUri === void 0) { workspaceFolderUri = 'test://test'; }
        return completion_test_1.testCompletionFor(value, expected, settings, testUri, workspaceFolderUri);
    }
    ;
    suite('LESS - Completions', function () {
        test('stylesheet', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor('body { |', {
                            items: [
                                { label: 'display' },
                                { label: 'background' }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { ver|', {
                                items: [
                                    { label: 'vertical-align' }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { word-break: |', {
                                items: [
                                    { label: 'keep-all' }
                                ]
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('body { inner { vertical-align: |}', {
                                items: [
                                    { label: 'bottom' }
                                ]
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@var1: 3; body { inner { vertical-align: |}', {
                                items: [
                                    { label: '@var1', documentation: '3' }
                                ]
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('@var1: { content: 1; }; body { inner { vertical-align: |}', {
                                items: [
                                    { label: '@var1', documentation: '{ content: 1; }' }
                                ]
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.mixin(@a: 1, @b) { content: @|}', {
                                items: [
                                    { label: '@a', documentation: '1', detail: 'argument from \'.mixin\'' },
                                    { label: '@b', documentation: null, detail: 'argument from \'.mixin\'' }
                                ]
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { background-color: d|', {
                                items: [
                                    { label: 'darken' },
                                    { label: 'desaturate' }
                                ]
                            })];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.btn-group { .btn:| }', {
                                items: [
                                    { label: '::after', resultText: '.btn-group { .btn::after }' }
                                ]
                            })];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { &:|', {
                                items: [
                                    { label: ':last-of-type', resultText: '.foo { &:last-of-type' }
                                ]
                            })];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { &:l|', {
                                items: [
                                    { label: ':last-of-type', resultText: '.foo { &:last-of-type' }
                                ]
                            })];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { appearance:| }', {
                                items: [
                                    {
                                        label: 'inherit', resultText: '.foo { appearance:inherit }'
                                    }
                                ]
                            })];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor('.foo { mask: no|', {
                                items: [
                                    { label: 'round' }
                                ]
                            })];
                    case 13:
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
                                { label: 'grid', sortText: ' ' },
                                { label: '-moz-grid', sortText: ' x' },
                                { label: '-ms-grid', sortText: ' x' },
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('suggestParticipants', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testCompletionFor("html { .m| }", {
                            participant: {
                                onMixinReference: [{ mixinName: '.m', range: navigation_test_1.newRange(7, 9) }]
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, testCompletionFor("html { .mixin(|) }", {
                                participant: {
                                    onMixinReference: [{ mixinName: '', range: navigation_test_1.newRange(14, 14) }]
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
