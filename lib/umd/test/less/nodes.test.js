(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../css/nodes.test", "../../parser/lessParser"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes_test_1 = require("../css/nodes.test");
    var lessParser_1 = require("../../parser/lessParser");
    suite('LESS - Nodes', function () {
        function ruleset(input) {
            var parser = new lessParser_1.LESSParser();
            var node = parser.internalParse(input, parser._parseRuleset);
            return node;
        }
        test('RuleSet', function () {
            nodes_test_1.assertNodes(ruleset, 'selector { prop: value }', 'ruleset,...,selector,...,declaration,...,property,...,expression');
            nodes_test_1.assertNodes(ruleset, 'selector { prop; }', 'ruleset,...,selector,...,selector');
            nodes_test_1.assertNodes(ruleset, 'selector { prop {} }', 'ruleset,...,ruleset');
        });
    });
});
