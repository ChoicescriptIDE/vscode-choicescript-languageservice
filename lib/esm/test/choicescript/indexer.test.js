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
import * as choicescriptLanguageService from '../../cssLanguageService';
import { TextEdit, TextDocument } from 'vscode-languageserver-types';
import { ChoiceScriptIndexer } from '../../parser/ChoiceScriptIndexer';
function asPromise(result) {
    return Promise.resolve(result);
}
export var assertCompletion = function (completions, expected, document, offset) {
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
        var edit = TextEdit.is(match.textEdit) ? match.textEdit : TextEdit.replace(match.textEdit.replace, match.textEdit.newText);
        assert.equal(TextDocument.applyEdits(document, [edit]), expected.resultText);
    }
    if (expected.insertTextFormat) {
        assert.equal(match.insertTextFormat, expected.insertTextFormat);
    }
};
suite('ChoiceScript — Project Indexer', function () {
    var assertIndexContents = function (sceneUri, resources, expected) {
        return __awaiter(this, void 0, void 0, function () {
            var ls, projectIndex, _i, expected_1, exp, scene, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        ls = choicescriptLanguageService.getChoiceScriptLanguageService();
                        return [4 /*yield*/, ls.configure({ validate: true, spellcheck: { enabled: false, dictionaryPath: null, dictionary: null, userDictionary: null } })];
                    case 1:
                        _a.sent();
                        projectIndex = ls.updateProject(sceneUri, resources, true /* forceUpdate */);
                        if (projectIndex) {
                            for (_i = 0, expected_1 = expected; _i < expected_1.length; _i++) {
                                exp = expected_1[_i];
                                scene = projectIndex.getSceneNode(exp.uri);
                                assert(scene);
                                assert(scene.getText() === exp.contents);
                            }
                        }
                        else {
                            assert(false);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        if (e_1 && e_1.message) {
                            assert.fail(e_1.message);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    test('#1 Adding scenes', function () {
        return __awaiter(this, void 0, void 0, function () {
            var startup, secondScene, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, "*title mygame\n*create myvar\n*gosub_scene second_scene\n*finish");
                        secondScene = TextDocument.create('test://test/second_scene.txt', 'choicescript', 0, "Hello!\nGoodbye...\n*return");
                        return [4 /*yield*/, assertIndexContents(startup.uri, [startup, secondScene], [
                                { uri: startup.uri, contents: startup.getText() },
                                { uri: secondScene.uri, contents: secondScene.getText() }
                            ])];
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
    test('#2 Purging projects', function () {
        return __awaiter(this, void 0, void 0, function () {
            var startup, secondScene, index, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, "*title mygame\n*create myvar\n*gosub_scene second_scene\n*finish");
                        secondScene = TextDocument.create('test://test/second_scene.txt', 'choicescript', 0, "Hello!\nGoodbye...\n*return");
                        return [4 /*yield*/, assertIndexContents(startup.uri, [startup, secondScene], [
                                { uri: startup.uri, contents: startup.getText() },
                                { uri: secondScene.uri, contents: secondScene.getText() }
                            ])];
                    case 1:
                        _a.sent();
                        ChoiceScriptIndexer.index.purge(startup.uri);
                        index = ChoiceScriptIndexer.index.sync(startup.uri);
                        if (index) {
                            assert.fail("Project index exists unexpectedly, containing:\n\t" + index.getSceneList().join("\n\t"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        assert.fail(e_3.message);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    test('#2 Removing specific scenes', function () {
        return __awaiter(this, void 0, void 0, function () {
            var startup, secondScene, thirdChapter, index, purgedIndex;
            return __generator(this, function (_a) {
                try {
                    startup = TextDocument.create('test://test/startup.txt', 'choicescript', 0, "*title mygame\n*create myvar\n*gosub_scene second_scene\n*finish");
                    secondScene = TextDocument.create('test://test/second_scene.txt', 'choicescript', 0, "Hello!\nGoodbye...\n*return");
                    thirdChapter = TextDocument.create('test://test/third_chapter.txt', 'choicescript', 0, "");
                    ChoiceScriptIndexer.index.sync(startup.uri, [startup, secondScene, thirdChapter]);
                    index = ChoiceScriptIndexer.index.getProjectIndexForScene(startup.uri);
                    if (!index) {
                        assert.fail("Couldn't find project index.");
                    }
                    assert(index.getSceneList().length === 3, "Index not populating correctly");
                    purgedIndex = ChoiceScriptIndexer.index.purge(startup.uri, [startup.uri, secondScene.uri]);
                    if (!purgedIndex) {
                        assert.fail("Couldn't find project index. Was purge too aggressive?");
                    }
                    assert(purgedIndex.getSceneList().length === 1, "Purged scene list was expected to be length '1', but got: '" + purgedIndex.getSceneList().length + "'");
                    assert(purgedIndex.getSceneList()[0] === "third_chapter", "Last scene in purged scene was expected to be 'third_chapter' but was '" + purgedIndex.getSceneList()[0] + "'");
                }
                catch (e) {
                    assert.fail(e.message);
                }
                return [2 /*return*/];
            });
        });
    });
});
