/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as assert from 'assert';
import { Level } from '../../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { LintVisitor } from '../../services/ChoiceScriptLint';
import { Rules, LintConfigurationSettings } from '../../services/ChoiceScriptLintRules';
import { TextDocument } from '../../cssLanguageTypes';
import { ChoiceScriptIndexer } from '../../parser/ChoiceScriptIndexer';
export function assertEntries(node, document, expectedRules, expectedMessages, settings) {
    if (expectedMessages === void 0) { expectedMessages = undefined; }
    if (settings === void 0) { settings = new LintConfigurationSettings(); }
    var entries = LintVisitor.entries(node, document, settings, Level.Error | Level.Warning | Level.Ignore);
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
var parsers = [new ChoiceScriptParser()];
function assertScene(input, uri) {
    var rules = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        rules[_i - 2] = arguments[_i];
    }
    for (var _a = 0, parsers_1 = parsers; _a < parsers_1.length; _a++) {
        var p = parsers_1[_a];
        var document = TextDocument.create(uri, 'choicescript', 0, input);
        ChoiceScriptIndexer.index.sync(uri, [document]);
        var node = p.parseScene(document);
        ChoiceScriptIndexer.index.purge(uri);
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
        var document = TextDocument.create('test://test/startup.txt', 'choicescript', 0, input);
        var node = p.internalParse(input, p._parseChoiceScriptCommand);
        assertEntries(node, document, rules, messages, settings);
    }
}
suite('ChoiceScript - Lint', function () {
    test('Deprecated commands', function () {
        assertChoiceScriptCommand('*setref', Rules.DeprecatedCommand);
        assertChoiceScriptCommand('*gotoref', Rules.DeprecatedCommand);
        assertChoiceScriptCommand('*print', Rules.DeprecatedCommand);
    });
    test('Deprecated operators', function () {
        assertChoiceScriptCommand('*set mynum mynum % 2', Rules.DeprecatedOperatorPercent);
        assertChoiceScriptCommand('*set mynum -% 2');
        assertChoiceScriptCommand('*script doSomeJavaScript();', Rules.ScriptCommandUnsupported);
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
        assertScene('*temp n 0\n*create n 0', 'test://test/startup.txt', Rules.InvalidInitialCommand);
        assertScene('*create n 0', 'test://test/not_startup.txt', Rules.InvalidInitialCommand);
        assertScene('*create n 0\n' +
            '*create str "Hello World!"\n' +
            '*comment it\'s all happening here\n' +
            '*title my brilliant game\n' +
            '*set str "Goodbye World!"\n', 'test://test/not_startup.txt', Rules.InvalidInitialCommand, Rules.InvalidInitialCommand, Rules.InvalidInitialCommand);
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
        assertScene('*goto_scene myscene', 'test://test/choicescript_stats.txt', Rules.UnusualStatsCommand);
        assertScene('*finish', 'test://test/choicescript_stats.txt', Rules.UnusualStatsCommand);
        assertScene('*ending', 'test://test/choicescript_stats.txt', Rules.UnusualStatsCommand);
    });
    test('Duplicate unique commands', function () {
        assertScene('*author me\n*author me', 'test://test/startup.txt', Rules.DuplicateUniqueCommand);
        assertScene('*title It\'s a Start!\n*author seconded!\n*title Not Again!', 'test://test/startup.txt', Rules.DuplicateUniqueCommand);
    });
    test('Reserved variable prefix', function () {
        assertScene('*create choice_', 'test://test/startup.txt', Rules.ReservedVariablePrefix);
        assertScene('*create choice_var "string"', 'test://test/startup.txt', Rules.ReservedVariablePrefix);
        assertScene('*temp choice_myvar', 'test://test/startup.txt', Rules.ReservedVariablePrefix);
        assertScene('*temp and "value"', 'test://test/startup.txt', Rules.ReservedWord);
        assertScene('*create scene "my_scene"', 'test://test/startup.txt', Rules.ReservedWord);
        assertScene('*temp true', 'test://test/startup.txt', Rules.ReservedWord);
    });
});
