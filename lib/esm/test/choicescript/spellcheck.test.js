/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as assert from 'assert';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { SpellCheckVisitor } from '../../services/spellcheck';
import { Rules } from '../../services/textRules';
import { TextDocument } from 'vscode-languageserver-types';
import { Typo } from '../../services/typo/typo';
import { readFileSync } from 'fs';
export function assertEntries(node, document, typo, userDics, rules) {
    var entries = SpellCheckVisitor.entries(node, document, typo, userDics);
    assert.equal(entries.length, rules.length, entries.map(function (e) { return e.getRule().id; }).join(', '));
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        assert.ok(rules.indexOf(entry.getRule()) !== -1, entry.getRule().id + " found but not expected (" + rules.map(function (r) { return r.id; }).join(', ') + ")");
    }
}
var parsers = [new ChoiceScriptParser()];
var typo = new Typo("", "", "", {
    platform: 'any'
});
function assertScene(input, typo, userDics) {
    var rules = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        rules[_i - 3] = arguments[_i];
    }
    for (var _a = 0, parsers_1 = parsers; _a < parsers_1.length; _a++) {
        var p = parsers_1[_a];
        var document = TextDocument.create('test://test/startup.txt', 'choicescript', 0, input);
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
        var document = TextDocument.create('test://test/spelling.txt', 'choicescript', 0, input);
        var node = p.internalParse(input, p._parseLine);
        assertEntries(node, document, typo, userDics, rules);
    }
}
suite('Typo SpellCheck', function () {
    var userDics = { "session": {}, "persistent": {} };
    var typoGB = new Typo("en_GB", readFileSync("./test/typo/dictionaries/en_GB/en_GB.aff").toString(), readFileSync("./test/typo/dictionaries/en_GB/en_GB.dic").toString(), {
        platform: 'any'
    });
    test('General', function () {
        assertRuleSet('heello', typoGB, userDics, Rules.BadSpelling);
        assertRuleSet('thaz', typoGB, userDics, Rules.BadSpelling);
        assertRuleSet('anp', typoGB, userDics, Rules.BadSpelling);
        assertRuleSet('arna', typoGB, userDics, Rules.BadSpelling);
        assertRuleSet('hpoliday', typoGB, userDics, Rules.BadSpelling);
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
        assertRuleSet('I am from the @{direction north|east|soeuth|west}', typoGB, userDics, Rules.BadSpelling);
        assertRuleSet('I @{weapon_id take aim with my riefle|draw mey sword|raise my spear}', typoGB, userDics, Rules.BadSpelling, Rules.BadSpelling);
    });
    test('(Command Line) Strings', function () {
        assertRuleSet('*set paladin_description "A stoic warrior who uhelds justice and embodies the light"', typoGB, userDics, Rules.BadSpelling);
        assertScene('*set hold_task "deax nigOhts awe"', typoGB, userDics, Rules.BadSpelling, Rules.BadSpelling);
        assertRuleSet('*temp my_desc "I wear a ${mainaccessory}, amd 5\' foot smol, and have short, black hair."', typoGB, userDics, Rules.BadSpelling, Rules.BadSpelling);
        assertRuleSet('*if profession = "preest"', typoGB, userDics, Rules.BadSpelling);
        assertRuleSet('*if ("my bad speeeling" = string)', typoGB, userDics, Rules.BadSpelling);
    });
    test('Dictionary: EN_US', function () {
        var typoUS = new Typo("en_US", readFileSync("./test/typo/dictionaries/en_US/en_US.aff").toString(), readFileSync("./test/typo/dictionaries/en_US/en_US.dic").toString(), {
            platform: 'any'
        });
        assertRuleSet('colour', typoUS, userDics, Rules.BadSpelling);
    });
    test('Dictionary: EN_GB', function () {
        assertRuleSet('color', typoGB, userDics, Rules.BadSpelling);
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
