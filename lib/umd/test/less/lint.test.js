(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../css/lint.test", "../../parser/scssParser", "../../cssLanguageTypes"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var lint_test_1 = require("../css/lint.test");
    var scssParser_1 = require("../../parser/scssParser");
    var cssLanguageTypes_1 = require("../../cssLanguageTypes");
    function assertRuleSet(input) {
        var rules = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rules[_i - 1] = arguments[_i];
        }
        var p = new scssParser_1.SCSSParser();
        var document = cssLanguageTypes_1.TextDocument.create('test://test/test.scss', 'scss', 0, input);
        var node = p.internalParse(input, p._parseRuleset);
        lint_test_1.assertEntries(node, document, rules);
    }
    suite('LESS - Lint', function () {
        test('unknown properties', function () {
            assertRuleSet('selector { box-shadow+: 0 0 20px black; }');
            assertRuleSet('selector { transform+_: rotate(15deg); }');
        });
    });
});
