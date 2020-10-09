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
        define(["require", "exports", "assert", "../../cssLanguageTypes", "../../cssLanguageService", "fs", "vscode-languageserver-types"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertCompletion = void 0;
    var assert = require("assert");
    var cssLanguageTypes_1 = require("../../cssLanguageTypes");
    var cssLanguageService_1 = require("../../cssLanguageService");
    var fs_1 = require("fs");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    function asPromise(result) {
        return Promise.resolve(result);
    }
    exports.assertCompletion = function (completions, expected, document) {
        var matches = completions.items.filter(function (completion) {
            return completion.label === expected.label;
        });
        if (expected.notAvailable) {
            assert.equal(matches.length, 0, expected.label + " should not be present");
        }
        else {
            assert.equal(matches.length, 1, expected.label + " should only existing once, Actual - " + completions.items.map(function (c) { return c.label; }).join(', '));
        }
        var match = matches[0];
        if (expected.detail) {
            assert.equal(match.detail, expected.detail, "Detail '" + match.detail + "' does match expected '" + expected.detail + "'");
        }
        if (expected.documentation) {
            assert.equal(match.documentation, expected.documentation, "Documentation '" + match.documentation + "' does match expected '" + expected.documentation + "'");
        }
        if (expected.kind) {
            assert.equal(match.kind, expected.kind, "Kind '" + match.kind + "' does match expected '" + expected.kind + "'");
        }
        if (expected.resultText && match.textEdit) {
            var edit = vscode_languageserver_types_1.TextEdit.is(match.textEdit) ? match.textEdit : vscode_languageserver_types_1.TextEdit.replace(match.textEdit.replace, match.textEdit.newText);
            var res = cssLanguageService_1.TextDocument.applyEdits(document, [edit]);
            assert.equal(res, expected.resultText, "Result text '" + res + "' does match expected '" + expected.resultText + "'");
        }
        if (expected.insertTextFormat) {
            assert.equal(match.insertTextFormat, expected.insertTextFormat, "Insert format text '" + match.insertTextFormat + "' does match expected '" + expected.insertTextFormat + "'");
        }
    };
    suite('ChoiceScript — Completion', function () {
        // TODO: Ensure these tests can handle errors thrown by ls.doComplete.
        var testCompletionFor = function (value, position, expected, resources) {
            return __awaiter(this, void 0, void 0, function () {
                var actualBadSpellingContexts, actualPropertyContexts, actualPropertyValueContexts, actualURILiteralValueContexts, actualImportPathContexts, ls, document, doc, list, _i, _a, item;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            actualBadSpellingContexts = [];
                            actualPropertyContexts = [];
                            actualPropertyValueContexts = [];
                            actualURILiteralValueContexts = [];
                            actualImportPathContexts = [];
                            ls = cssLanguageService_1.getChoiceScriptLanguageService();
                            ls.configure({ validate: true, spellcheck: { enabled: false, dictionaryPath: '../../services/typo/dictionaries', dictionary: cssLanguageTypes_1.SpellCheckDictionary.EN_US, userDictionary: null } });
                            if (expected.participant) {
                                ls.setCompletionParticipants([{
                                        onBadSpelling: function (context) { return actualBadSpellingContexts.push(context); },
                                        onCssProperty: function (context) { return actualPropertyContexts.push(context); },
                                        onCssPropertyValue: function (context) { return actualPropertyValueContexts.push(context); },
                                        onCssURILiteralValue: function (context) { return actualURILiteralValueContexts.push(context); },
                                        onCssImportPath: function (context) { return actualImportPathContexts.push(context); },
                                    }]);
                            }
                            document = cssLanguageService_1.TextDocument.create('test://test/local.txt', 'choicescript', 0, value);
                            doc = ls.parseScene(document);
                            ls.updateProject(document.uri, resources, true /* forceUpdate */);
                            return [4 /*yield*/, ls.doComplete(document, position, doc)];
                        case 1:
                            list = _b.sent();
                            ls.purgeProject(document.uri);
                            assert.equal(list.items.length, expected.items.length, "\nGot " + list.items.length + ":\n\t" + list.items.map(function (i) { return i.label; }).join("\n\t") + "\n\nExpected " + expected.items.length + ":\n\t" + expected.items.map(function (i) { return i.label; }).join("\n\t"));
                            for (_i = 0, _a = expected.items; _i < _a.length; _i++) {
                                item = _a[_i];
                                exports.assertCompletion(list, item, document);
                            }
                            return [2 /*return*/, list];
                    }
                });
            });
        };
        test('commands', function () {
            return __awaiter(this, void 0, void 0, function () {
                var value, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            value = "*c";
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(0, value.length), {
                                    items: [
                                        { label: 'check_achievements', resultText: '*check_achievements' },
                                        { label: 'check_purchase', resultText: '*check_purchase' },
                                        { label: 'check_registration', resultText: '*check_registration' },
                                        { label: 'choice', resultText: '*choice' },
                                        { label: 'create', resultText: '*create' },
                                        { label: 'config', resultText: '*config' },
                                        { label: 'comment', resultText: '*comment' },
                                    ],
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _a.sent();
                            assert.fail(e_1.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('commands - nothing', function () {
            return __awaiter(this, void 0, void 0, function () {
                var value, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            value = "*";
                            return [4 /*yield*/, testCompletionFor('*', cssLanguageService_1.Position.create(0, value.length), {
                                    items: [],
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_2 = _a.sent();
                            assert.fail(e_2.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('Replacement variables (${}, @{})', function () {
            return __awaiter(this, void 0, void 0, function () {
                var value, lines, line, charPos, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            value = fs_1.readFileSync("./src/test/choicescript/data/scenes/completion/replacement_vars.txt").toString();
                            lines = value.split("\n");
                            line = lines.filter(function (line) { return line.indexOf("${f}") >= 0; })[0];
                            charPos = line.indexOf("${f") + 3;
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(lines.indexOf(line), charPos), {
                                    items: [
                                        { label: 'first_name', resultText: value.replace("${f}", "${first_name}") },
                                        { label: 'full_name', resultText: value.replace("${f}", "${full_name}") }
                                    ],
                                })];
                        case 1:
                            _a.sent();
                            // @{}
                            line = lines.filter(function (line) { return line.indexOf("@{h") >= 0; })[0];
                            charPos = line.indexOf("@{h") + 3;
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(lines.indexOf(line), charPos), {
                                    items: [
                                        { label: 'hobby', resultText: value.replace("@{h", "@{hobby") },
                                        { label: 'home_address', resultText: value.replace("@{h", "@{home_address") },
                                    ],
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_3 = _a.sent();
                            assert.fail(e_3.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
        test('*set variables', function () {
            return __awaiter(this, void 0, void 0, function () {
                var value, lines, line, charPos, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            value = fs_1.readFileSync("./src/test/choicescript/data/scenes/completion/variables.txt").toString();
                            lines = value.split("\n");
                            line = lines[lines.length - 1];
                            charPos = line.indexOf("my") + 2;
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(lines.length - 1, charPos), {
                                    items: [
                                        { label: 'myname', resultText: value.replace("*set my", "*set myname") },
                                        { label: 'mynum', resultText: value.replace("*set my", "*set mynum") }
                                    ],
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_4 = _a.sent();
                            assert.fail(e_4.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('global variables', function () {
            return __awaiter(this, void 0, void 0, function () {
                var startupScene, value, lines, line, charPos, e_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            startupScene = cssLanguageService_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, fs_1.readFileSync("./src/test/choicescript/data/scenes/completion/variables_startup.txt").toString());
                            value = fs_1.readFileSync("./src/test/choicescript/data/scenes/completion/variables.txt").toString();
                            lines = value.split("\n");
                            line = lines[lines.length - 1];
                            charPos = line.indexOf("my") + 2;
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(lines.length - 1, charPos), {
                                    items: [
                                        { label: 'myname', resultText: value.replace("*set my", "*set myname") },
                                        { label: 'mynum', resultText: value.replace("*set my", "*set mynum") },
                                        { label: 'myglobalvar', resultText: value.replace("*set my", "*set myglobalvar") },
                                        { label: 'myglobalnum', resultText: value.replace("*set my", "*set myglobalnum") }
                                    ],
                                }, [startupScene])];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_5 = _a.sent();
                            assert.fail(e_5.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('labels goto', function () {
            return __awaiter(this, void 0, void 0, function () {
                var value, lines, line, charPos, e_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            value = fs_1.readFileSync("./src/test/choicescript/data/scenes/completion/labels_goto.txt").toString();
                            lines = value.split("\n");
                            line = lines.filter(function (line) { return line.indexOf("*goto s") >= 0; })[0];
                            charPos = line.indexOf("s") + 1;
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(lines.indexOf(line), charPos), {
                                    items: [
                                        { label: 'secondlabel', resultText: value.replace("*goto s", "*goto secondlabel") },
                                    ],
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_6 = _a.sent();
                            assert.fail(e_6.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('variables - nothing', function () {
            return __awaiter(this, void 0, void 0, function () {
                var value, e_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            value = fs_1.readFileSync("./src/test/choicescript/data/scenes/completion/variables_nothing.txt").toString();
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(value.split("\n").length, value.length), {
                                    items: [],
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_7 = _a.sent();
                            assert.fail(e_7.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('goto/gosub_scene scene suggestions', function () {
            return __awaiter(this, void 0, void 0, function () {
                var scenes, value, e_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            scenes = [
                                cssLanguageService_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, ""),
                                cssLanguageService_1.TextDocument.create('test://test/local.txt', 'choicescript', 0, ""),
                                cssLanguageService_1.TextDocument.create('test://test/little_town.txt', 'choicescript', 0, ""),
                                cssLanguageService_1.TextDocument.create('test://test/later.txt', 'choicescript', 0, ""),
                                cssLanguageService_1.TextDocument.create('test://testproject2/silicon.txt', 'choicescript', 0, ""),
                                cssLanguageService_1.TextDocument.create('test://testproject2/random.txt', 'choicescript', 0, "")
                            ];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            value = "*goto_scene l";
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(value.split("\n").length, value.length), {
                                    items: [
                                        { label: 'local', resultText: "*goto_scene local" },
                                        { label: 'later', resultText: "*goto_scene later" },
                                        { label: 'little_town', resultText: "*goto_scene little_town" },
                                    ],
                                }, scenes)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_8 = _a.sent();
                            assert.fail(e_8.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
        test('goto/gosub_scene label suggestions', function () {
            return __awaiter(this, void 0, void 0, function () {
                var scenes, value, e_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            scenes = [
                                cssLanguageService_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, ""),
                                cssLanguageService_1.TextDocument.create('test://test/second_chapter.txt', 'choicescript', 0, "*label mylabel\n*label secondlabel\n*label myladel\n*"),
                            ];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            value = "*label myinvalidlabel\n*goto_scene second_chapter m";
                            return [4 /*yield*/, testCompletionFor(value, cssLanguageService_1.Position.create(value.split("\n").length, value.length), {
                                    items: [
                                        { label: 'mylabel', resultText: value.replace("*goto_scene second_chapter m", "*goto_scene second_chapter mylabel") },
                                        { label: 'myladel', resultText: value.replace("*goto_scene second_chapter m", "*goto_scene second_chapter myladel") },
                                    ],
                                }, scenes)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_9 = _a.sent();
                            assert.fail(e_9.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
        test('fake test', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    /* tslint:disable */
                    this.skip();
                    return [2 /*return*/];
                });
            });
        });
        /*
        test('variables', function (): any {
            testCompletionFor(':root { --myvar: red; } body { color: |', {
                items: [
                    { label: '--myvar', documentation: 'red', resultText: ':root { --myvar: red; } body { color: var(--myvar)' },
                ]
            });
            testCompletionFor('body { --myvar: 0px; border-right: var| ', {
                items: [
                    { label: '--myvar', documentation: '0px', resultText: 'body { --myvar: 0px; border-right: var(--myvar) ' },
                ]
            });
            testCompletionFor('body { --myvar: 0px; border-right: var(| ', {
                items: [
                    { label: '--myvar', documentation: '0px', resultText: 'body { --myvar: 0px; border-right: var(--myvar ' },
                ]
            });
            testCompletionFor('a { color: | } :root { --bg-color: red; } ', {
                items: [
                    { label: '--bg-color', documentation: 'red', resultText: 'a { color: var(--bg-color) } :root { --bg-color: red; } ' },
                ]
            });
        });*/
    });
    function newRange(start, end) {
        return cssLanguageService_1.Range.create(cssLanguageService_1.Position.create(0, start), cssLanguageService_1.Position.create(0, end));
    }
});
