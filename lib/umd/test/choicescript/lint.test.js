(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/ChoiceScriptNodes", "../../parser/ChoiceScriptParser", "../../services/ChoiceScriptLint", "../../services/ChoiceScriptLintRules", "../../cssLanguageTypes", "../../parser/ChoiceScriptIndexer"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertEntries = void 0;
    var assert = require("assert");
    var ChoiceScriptNodes_1 = require("../../parser/ChoiceScriptNodes");
    var ChoiceScriptParser_1 = require("../../parser/ChoiceScriptParser");
    var ChoiceScriptLint_1 = require("../../services/ChoiceScriptLint");
    var ChoiceScriptLintRules_1 = require("../../services/ChoiceScriptLintRules");
    var cssLanguageTypes_1 = require("../../cssLanguageTypes");
    var ChoiceScriptIndexer_1 = require("../../parser/ChoiceScriptIndexer");
    function assertEntries(node, document, expectedRules, expectedMessages, settings) {
        if (expectedMessages === void 0) { expectedMessages = undefined; }
        if (settings === void 0) { settings = new ChoiceScriptLintRules_1.LintConfigurationSettings(); }
        var entries = ChoiceScriptLint_1.LintVisitor.entries(node, document, settings, ChoiceScriptNodes_1.Level.Error | ChoiceScriptNodes_1.Level.Warning | ChoiceScriptNodes_1.Level.Ignore);
        var message = "Linting errors:\n\tfound: \t[" + entries.map(function (e) { return e.getMessage(); }).join(', ') + "]\n\texpected: [" + expectedRules.map(function (e) { return e.id; }).join(', ') + "]";
        assert.equal(entries.length, expectedRules.length, message);
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var index = expectedRules.indexOf(entry.getRule());
            assert.ok(index !== -1, entry.getRule().id + " found but not expected (" + expectedRules.map(function (r) { return r.id; }).join(', ') + ")");
            if (expectedMessages) {
                assert.equal(entry.getMessage(), expectedMessages[index]);
            }
        }
    }
    exports.assertEntries = assertEntries;
    var parsers = [new ChoiceScriptParser_1.ChoiceScriptParser()];
    function assertScene(input, uri) {
        var rules = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            rules[_i - 2] = arguments[_i];
        }
        for (var _a = 0, parsers_1 = parsers; _a < parsers_1.length; _a++) {
            var p = parsers_1[_a];
            var document = cssLanguageTypes_1.TextDocument.create(uri, 'choicescript', 0, input);
            ChoiceScriptIndexer_1.ChoiceScriptIndexer.index.sync(uri, [document]);
            var node = p.parseScene(document);
            ChoiceScriptIndexer_1.ChoiceScriptIndexer.index.purge(uri);
            assertEntries(node, document, rules);
        }
    }
    function assertChoiceScriptCommand(input) {
        var rules = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rules[_i - 1] = arguments[_i];
        }
        assertChoiceScriptCommand2(input, rules);
    }
    function assertChoiceScriptCommand2(input, rules, messages, settings) {
        for (var _i = 0, parsers_2 = parsers; _i < parsers_2.length; _i++) {
            var p = parsers_2[_i];
            var document = cssLanguageTypes_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, input);
            var node = p.internalParse(input, p._parseChoiceScriptCommand);
            assertEntries(node, document, rules, messages, settings);
        }
    }
    suite('ChoiceScript - Lint', function () {
        test('Deprecated commands', function () {
            assertChoiceScriptCommand('*setref', ChoiceScriptLintRules_1.Rules.DeprecatedCommand);
            assertChoiceScriptCommand('*gotoref', ChoiceScriptLintRules_1.Rules.DeprecatedCommand);
            assertChoiceScriptCommand('*print', ChoiceScriptLintRules_1.Rules.DeprecatedCommand);
        });
        test('Deprecated operators', function () {
            assertChoiceScriptCommand('*set mynum mynum % 2', ChoiceScriptLintRules_1.Rules.DeprecatedOperatorPercent);
            assertChoiceScriptCommand('*set mynum -% 2');
            assertChoiceScriptCommand('*script doSomeJavaScript();', ChoiceScriptLintRules_1.Rules.ScriptCommandUnsupported);
        });
        /*test('Type Conflict — Variables', function () {
            //assertScene('*create n 0+1\n*set n 1 < 2', 'test://test/startup.txt', Rules.TypeError);
            //assertScene('*create str "str"\n*set str 5+5', 'test://test/startup.txt', Rules.TypeError);
            //assertScene('*create n 0\n*set n 5+5', 'test://test/startup.txt');
            //assertScene('*create str "str"\n*set "Jane "&"Doe"', 'test://test/startup.txt');
        });*/
        /*test('Constants — Reassignment', function () {
            //assertScene('*create const_myvar 4\n*set const_myvar 1', 'test://test/startup.txt', Rules.ConstError);
            assertScene('*create myvar 4\n*set myvar 1', 'test://test/startup.txt');
        });*/
        test('Initial commands', function () {
            assertScene('*temp n 0\n*create n 0', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.InvalidInitialCommand);
            assertScene('*create n 0', 'test://test/not_startup.txt', ChoiceScriptLintRules_1.Rules.InvalidInitialCommand);
            assertScene('*create n 0\n' +
                '*create str "Hello World!"\n' +
                '*comment it\'s all happening here\n' +
                '*title my brilliant game\n' +
                '*set str "Goodbye World!"\n', 'test://test/not_startup.txt', ChoiceScriptLintRules_1.Rules.InvalidInitialCommand, ChoiceScriptLintRules_1.Rules.InvalidInitialCommand, ChoiceScriptLintRules_1.Rules.InvalidInitialCommand);
            assertScene('*create n 0\n' +
                '*create str "Hello World!"\n' +
                '*comment it\'s all happening here\n' +
                '*title my brilliant game\n' +
                '*set str "Goodbye World!"\n', 'test://test/startup.txt');
            assertScene('*create n 0\n' +
                '*create str "Hello World!"\n' +
                '*comment it\'s all happening here\n' +
                '*title my brilliant game\n' +
                '*set str "Goodbye World!"\n', 'test://test/startup.txt');
        });
        test('Unusual ChoiceScript Stats Commands', function () {
            // It's rarely (if ever?) appropriate to navigate
            // away from the stats screen by traditional means
            // like *goto_scene and *finish. Exception for *gosub_scene,
            // as obviously you'll be returning, and *redirect_scene is specifically
            // designed for exiting the stats screen.
            assertScene('*goto_scene myscene', 'test://test/choicescript_stats.txt', ChoiceScriptLintRules_1.Rules.UnusualStatsCommand);
            assertScene('*finish', 'test://test/choicescript_stats.txt', ChoiceScriptLintRules_1.Rules.UnusualStatsCommand);
            assertScene('*ending', 'test://test/choicescript_stats.txt', ChoiceScriptLintRules_1.Rules.UnusualStatsCommand);
        });
        test('Duplicate unique commands', function () {
            assertScene('*author me\n*author me', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.DuplicateUniqueCommand);
            assertScene('*title It\'s a Start!\n*author seconded!\n*title Not Again!', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.DuplicateUniqueCommand);
        });
        test('Reserved variable prefix', function () {
            assertScene('*create choice_', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.ReservedVariablePrefix);
            assertScene('*create choice_var "string"', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.ReservedVariablePrefix);
            assertScene('*temp choice_myvar', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.ReservedVariablePrefix);
            assertScene('*temp and "value"', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.ReservedWord);
            assertScene('*create scene "my_scene"', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.ReservedWord);
            assertScene('*temp true', 'test://test/startup.txt', ChoiceScriptLintRules_1.Rules.ReservedWord);
        });
    });
});
