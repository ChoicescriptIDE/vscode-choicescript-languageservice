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
        define(["require", "exports", "assert", "../../cssLanguageService"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = require("assert");
    var cssLanguageService_1 = require("../../cssLanguageService");
    suite('CSS - Code Actions', function () {
        var testCodeActions = function (value, tokenBefore, expected) {
            var ls = cssLanguageService_1.getCSSLanguageService();
            var document = cssLanguageService_1.TextDocument.create('test://test/test.css', 'css', 0, value);
            var styleSheet = ls.parseStylesheet(document);
            var offset = value.indexOf(tokenBefore);
            var startPosition = document.positionAt(offset);
            var endPosition = document.positionAt(offset + tokenBefore.length);
            var range = cssLanguageService_1.Range.create(startPosition, endPosition);
            ls.configure({ validate: true });
            var diagnostics = ls.doValidation(document, styleSheet);
            var commands = ls.doCodeActions(document, range, { diagnostics: diagnostics }, styleSheet);
            assertCodeAction(commands, document, expected);
            var codeActions = ls.doCodeActions2(document, range, { diagnostics: diagnostics }, styleSheet);
            assertCodeAction2(codeActions, document, expected);
        };
        var assertCodeAction = function (commands, document, expected) {
            var labels = commands.map(function (command) { return command.title; });
            for (var _i = 0, expected_1 = expected; _i < expected_1.length; _i++) {
                var exp = expected_1[_i];
                var index = labels.indexOf(exp.title);
                assert.ok(index !== -1, 'Quick fix not found: ' + exp.title + ' , found:' + labels.join(','));
                var command = commands[index];
                assert.equal(cssLanguageService_1.TextDocument.applyEdits(document, command.arguments[2]), exp.content);
                assert.equal(command.arguments[0], document.uri);
                assert.equal(command.arguments[1], document.version);
            }
        };
        var assertCodeAction2 = function (codeActions, document, expected) {
            var labels = codeActions.map(function (command) { return command.title; });
            for (var _i = 0, expected_2 = expected; _i < expected_2.length; _i++) {
                var exp = expected_2[_i];
                var index = labels.indexOf(exp.title);
                assert.ok(index !== -1, 'Quick fix not found: ' + exp.title + ' , found:' + labels.join(','));
                var codeAction = codeActions[index];
                for (var _a = 0, _b = codeAction.edit.documentChanges; _a < _b.length; _a++) {
                    var change = _b[_a];
                    if (cssLanguageService_1.TextDocumentEdit.is(change)) {
                        assert.equal(document.uri, change.textDocument.uri);
                        assert.equal(cssLanguageService_1.TextDocument.applyEdits(document, change.edits), exp.content);
                    }
                    else {
                        assert.ok(false, 'not a TextDocumentEdit');
                    }
                }
            }
        };
        test('Unknown Properties', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    testCodeActions('body { /*here*/displai: inline }', '/*here*/', [
                        { title: 'Rename to \'display\'', content: 'body { /*here*/display: inline }' }
                    ]);
                    testCodeActions('body { /*here*/background-colar: red }', '/*here*/', [
                        { title: 'Rename to \'background-color\'', content: 'body { /*here*/background-color: red }' },
                        { title: 'Rename to \'background-clip\'', content: 'body { /*here*/background-clip: red }' },
                        { title: 'Rename to \'background-image\'', content: 'body { /*here*/background-image: red }' }
                    ]);
                    return [2 /*return*/];
                });
            });
        });
    });
});
