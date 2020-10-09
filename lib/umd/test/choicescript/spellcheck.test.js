(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/ChoiceScriptParser", "../../services/spellcheck", "../../services/textRules", "vscode-languageserver-types", "../../services/typo/typo", "fs"], factory);
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
    var ChoiceScriptParser_1 = require("../../parser/ChoiceScriptParser");
    var spellcheck_1 = require("../../services/spellcheck");
    var textRules_1 = require("../../services/textRules");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    var typo_1 = require("../../services/typo/typo");
    var fs_1 = require("fs");
    function assertEntries(node, document, typo, userDics, rules) {
        var entries = spellcheck_1.SpellCheckVisitor.entries(node, document, typo, userDics);
        assert.equal(entries.length, rules.length, entries.map(function (e) { return e.getRule().id; }).join(', '));
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            assert.ok(rules.indexOf(entry.getRule()) !== -1, entry.getRule().id + " found but not expected (" + rules.map(function (r) { return r.id; }).join(', ') + ")");
        }
    }
    exports.assertEntries = assertEntries;
    var parsers = [new ChoiceScriptParser_1.ChoiceScriptParser()];
    var typo = new typo_1.Typo("", "", "", {
        platform: 'any'
    });
    function assertScene(input, typo, userDics) {
        var rules = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            rules[_i - 3] = arguments[_i];
        }
        for (var _a = 0, parsers_1 = parsers; _a < parsers_1.length; _a++) {
            var p = parsers_1[_a];
            var document = vscode_languageserver_types_1.TextDocument.create('test://test/startup.txt', 'choicescript', 0, input);
            var node = p.parseScene(document);
            assertEntries(node, document, typo, userDics, rules);
        }
    }
    function assertRuleSet(input, typo, userDics) {
        var rules = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            rules[_i - 3] = arguments[_i];
        }
        for (var _a = 0, parsers_2 = parsers; _a < parsers_2.length; _a++) {
            var p = parsers_2[_a];
            var document = vscode_languageserver_types_1.TextDocument.create('test://test/spelling.txt', 'choicescript', 0, input);
            var node = p.internalParse(input, p._parseLine);
            assertEntries(node, document, typo, userDics, rules);
        }
    }
    suite('Typo SpellCheck', function () {
        var userDics = { "session": {}, "persistent": {} };
        var typoGB = new typo_1.Typo("en_GB", fs_1.readFileSync("./test/typo/dictionaries/en_GB/en_GB.aff").toString(), fs_1.readFileSync("./test/typo/dictionaries/en_GB/en_GB.dic").toString(), {
            platform: 'any'
        });
        test('General', function () {
            assertRuleSet('heello', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertRuleSet('thaz', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertRuleSet('anp', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertRuleSet('arna', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertRuleSet('hpoliday', typoGB, userDics, textRules_1.Rules.BadSpelling);
        });
        test('Correct', function () {
            assertRuleSet('elephant', typoGB, userDics);
            assertRuleSet('antelope', typoGB, userDics);
            assertRuleSet('dog', typoGB, userDics);
            assertRuleSet('zebra', typoGB, userDics);
            assertRuleSet('armadillo', typoGB, userDics);
        });
        test('Compounds and Constructs', function () {
            assertRuleSet('mother-in-law', typoGB, userDics);
            assertRuleSet('up-to-date', typoGB, userDics);
            assertRuleSet('on-campus', typoGB, userDics);
            assertRuleSet('border-top', typoGB, userDics);
        });
        test('Variable Replacements', function () {
            // Spellcheck should only kick in for MultiReplaceOption text, not expressions.
            assertRuleSet('My name is ${first_name&second_name}, but you can call me ${first_name}.', typoGB, userDics);
            assertRuleSet('I am from the @{direction north|east|soeuth|west}', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertRuleSet('I @{weapon_id take aim with my riefle|draw mey sword|raise my spear}', typoGB, userDics, textRules_1.Rules.BadSpelling, textRules_1.Rules.BadSpelling);
        });
        test('(Command Line) Strings', function () {
            assertRuleSet('*set paladin_description "A stoic warrior who uhelds justice and embodies the light"', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertScene('*set hold_task "deax nigOhts awe"', typoGB, userDics, textRules_1.Rules.BadSpelling, textRules_1.Rules.BadSpelling);
            assertRuleSet('*temp my_desc "I wear a ${mainaccessory}, amd 5\' foot smol, and have short, black hair."', typoGB, userDics, textRules_1.Rules.BadSpelling, textRules_1.Rules.BadSpelling);
            assertRuleSet('*if profession = "preest"', typoGB, userDics, textRules_1.Rules.BadSpelling);
            assertRuleSet('*if ("my bad speeeling" = string)', typoGB, userDics, textRules_1.Rules.BadSpelling);
        });
        test('Dictionary: EN_US', function () {
            var typoUS = new typo_1.Typo("en_US", fs_1.readFileSync("./test/typo/dictionaries/en_US/en_US.aff").toString(), fs_1.readFileSync("./test/typo/dictionaries/en_US/en_US.dic").toString(), {
                platform: 'any'
            });
            assertRuleSet('colour', typoUS, userDics, textRules_1.Rules.BadSpelling);
        });
        test('Dictionary: EN_GB', function () {
            assertRuleSet('color', typoGB, userDics, textRules_1.Rules.BadSpelling);
        });
        test('User Dictionary', function () {
            userDics["session"]["gargoogle"] = true;
            userDics["persistent"]["cthulhu"] = true;
            assertRuleSet('cthulhu', typoGB, userDics);
            assertRuleSet('gargoogle', typoGB, userDics);
            // confirm case-insensitivity
            userDics["persistent"]["lol"] = true;
            assertRuleSet('LOL', typoGB, userDics);
        });
    });
});
