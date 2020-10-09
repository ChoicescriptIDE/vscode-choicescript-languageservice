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
        define(["require", "exports", "assert", "../../cssLanguageService", "fs", "vscode-languageserver-types"], factory);
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
    var choicescriptLanguageService = require("../../cssLanguageService");
    var fs_1 = require("fs");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    function asPromise(result) {
        return Promise.resolve(result);
    }
    exports.assertCompletion = function (completions, expected, document, offset) {
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
            assert.equal(match.detail, expected.detail);
        }
        if (expected.documentation) {
            assert.equal(match.documentation, expected.documentation);
        }
        if (expected.kind) {
            assert.equal(match.kind, expected.kind);
        }
        if (expected.resultText && match.textEdit) {
            var edit = vscode_languageserver_types_1.TextEdit.is(match.textEdit) ? match.textEdit : vscode_languageserver_types_1.TextEdit.replace(match.textEdit.replace, match.textEdit.newText);
            assert.equal(vscode_languageserver_types_1.TextDocument.applyEdits(document, [edit]), expected.resultText);
        }
        if (expected.insertTextFormat) {
            assert.equal(match.insertTextFormat, expected.insertTextFormat);
        }
    };
    suite('ChoiceScript — Experimental', function () {
        var assertDefinition = function (target, exp, resources) {
            return __awaiter(this, void 0, void 0, function () {
                var ls, projectIndex, targetScene, startupScene, def, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            ls = choicescriptLanguageService.getChoiceScriptLanguageService();
                            return [4 /*yield*/, ls.configure({ validate: true, spellcheck: { enabled: false, dictionaryPath: null, dictionary: null, userDictionary: null } })];
                        case 1:
                            _a.sent();
                            projectIndex = ls.updateProject(target.uri, resources, true /* forceUpdate */);
                            targetScene = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneIndex(target.uri);
                            startupScene = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getStartupIndex();
                            if (!targetScene) {
                                assert.fail("Couldn't find target scene in project index. Was it passed as a resource?");
                            }
                            return [4 /*yield*/, ls.findDefinition(targetScene.textDocument, target.position, targetScene.node)];
                        case 2:
                            def = _a.sent();
                            if (def) {
                                assert(def.uri === exp.uri, "URI '" + def.uri + "' does not match expected: '" + exp.uri + "'");
                                assert(def.range.start.line === exp.range.start.line, "Start line '" + def.range.start.line + "' does not match expected: '" + exp.range.start.line + "'");
                                assert(def.range.start.character === exp.range.start.character, "Start character '" + def.range.start.character + "' does not match expected: '" + exp.range.start.character + "'");
                                assert(def.range.end.line === exp.range.end.line, "End line '" + def.range.end.line + "' does not match expected: '" + exp.range.end.line + "'");
                                assert(def.range.end.character === exp.range.end.character, "End character '" + def.range.end.character + "' does not match expected: '" + exp.range.end.character + "'");
                            }
                            else {
                                assert(false, "definition not found");
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            if (e_1 && e_1.message) {
                                assert.fail(e_1.message);
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        test('#1', function () {
            return __awaiter(this, void 0, void 0, function () {
                var startup, not_startup, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            startup = vscode_languageserver_types_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, '*create a "e"\n' +
                                '*create n 0\n' +
                                '*create t false\n' +
                                '*temp x "y"\n' +
                                '*temp y "z"');
                            not_startup = vscode_languageserver_types_1.TextDocument.create('test://test/not_startup.txt', 'choicescript', 0, '*label look\n' +
                                '*temp z 7\n' +
                                '*set a "b"\n' +
                                '*set n 0\n' +
                                '*set t false');
                            return [4 /*yield*/, assertDefinition({ uri: "test://test/not_startup.txt", position: vscode_languageserver_types_1.Position.create(4, 5) }, { uri: "test://test/startup.txt", range: vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(2, 0), vscode_languageserver_types_1.Position.create(2, 15)) }, [startup, not_startup])];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_2 = _a.sent();
                            if (e_2 && e_2.message) {
                                assert.fail(e_2.message);
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('#2 Prefer temp def over create def', function () {
            return __awaiter(this, void 0, void 0, function () {
                var startup, not_startup, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            startup = vscode_languageserver_types_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, fs_1.readFileSync("./src/test/choicescript/data/scenes/navigation/find_temp_over_create_def_startup.txt").toString());
                            not_startup = vscode_languageserver_types_1.TextDocument.create('test://test/not_startup.txt', 'choicescript', 0, fs_1.readFileSync("./src/test/choicescript/data/scenes/navigation/find_temp_over_create_def_local.txt").toString());
                            return [4 /*yield*/, assertDefinition({ uri: "test://test/not_startup.txt", position: vscode_languageserver_types_1.Position.create(3, 5) }, { uri: "test://test/not_startup.txt", range: vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(1, 0), vscode_languageserver_types_1.Position.create(1, 9)) }, [startup, not_startup])];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_3 = _a.sent();
                            if (e_3 && e_3.message) {
                                assert.fail(e_3.message);
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('#3 local label definitions', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    /* tslint:disable */
                    this.skip();
                    return [2 /*return*/];
                });
            });
        });
        test('#3 goto_scene scene reference', function () {
            return __awaiter(this, void 0, void 0, function () {
                var startup, not_startup, value, lines, line, charPos, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            startup = vscode_languageserver_types_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, fs_1.readFileSync("./src/test/choicescript/data/scenes/navigation/goto_scene_scene_def.txt").toString());
                            not_startup = vscode_languageserver_types_1.TextDocument.create('test://test/not_startup.txt', 'choicescript', 0, "");
                            value = startup.getText();
                            lines = value.split("\n");
                            line = lines.filter(function (line) { return line.indexOf("*goto_scene not_startup") >= 0; })[0];
                            charPos = line.indexOf("not") + 1;
                            return [4 /*yield*/, assertDefinition({ uri: "test://test/startup.txt", position: vscode_languageserver_types_1.Position.create(lines.indexOf(line), charPos) }, { uri: "test://test/not_startup.txt", range: vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(0, 0), vscode_languageserver_types_1.Position.create(0, 0)) }, [startup, not_startup])];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_4 = _a.sent();
                            if (e_4 && e_4.message) {
                                assert.fail(e_4.message);
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        test('#4 goto_scene scene and label reference', function () {
            return __awaiter(this, void 0, void 0, function () {
                var startup, not_startup, lines, line, charPos, dlines, dline, dlineNum, e_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            startup = vscode_languageserver_types_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, fs_1.readFileSync("./src/test/choicescript/data/scenes/navigation/goto_scene_scene_def.txt").toString());
                            not_startup = vscode_languageserver_types_1.TextDocument.create('test://test/not_startup.txt', 'choicescript', 0, "*label not_this_one\nHello\nWorld!\n*label mylabel\n*finish");
                            lines = startup.getText().split("\n");
                            line = lines.filter(function (line) { return line.indexOf("*goto_scene not_startup mylabel") >= 0; })[0];
                            charPos = line.indexOf("mylabel") + 1;
                            dlines = not_startup.getText().split("\n");
                            dline = dlines.filter(function (line) { return line.indexOf("*label mylabel") >= 0; })[0];
                            dlineNum = dlines.indexOf(dline);
                            return [4 /*yield*/, assertDefinition({ uri: "test://test/startup.txt", position: vscode_languageserver_types_1.Position.create(lines.indexOf(line), charPos) }, {
                                    uri: "test://test/not_startup.txt",
                                    range: vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(dlineNum, 0), vscode_languageserver_types_1.Position.create(dlineNum, dline.length))
                                }, [startup, not_startup])];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_5 = _a.sent();
                            if (e_5 && e_5.message) {
                                assert.fail(e_5.message);
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
    });
});
