/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { assertEntries } from '../css/lint.test';
import { SCSSParser } from '../../parser/scssParser';
import { TextDocument } from '../../cssLanguageTypes';
function assertRuleSet(input) {
    var rules = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rules[_i - 1] = arguments[_i];
    }
    var p = new SCSSParser();
    var document = TextDocument.create('test://test/test.scss', 'scss', 0, input);
    var node = p.internalParse(input, p._parseRuleset);
    assertEntries(node, document, rules);
}
suite('LESS - Lint', function () {
    test('unknown properties', function () {
        assertRuleSet('selector { box-shadow+: 0 0 20px black; }');
        assertRuleSet('selector { transform+_: rotate(15deg); }');
    });
});
