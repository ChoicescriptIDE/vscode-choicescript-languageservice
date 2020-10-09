(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../parser/scssParser", "../css/languageFacts.test", "../../languageFacts/facts"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var scssParser_1 = require("../../parser/scssParser");
    var languageFacts_test_1 = require("../css/languageFacts.test");
    var facts_1 = require("../../languageFacts/facts");
    suite('SCSS - Language facts', function () {
        test('is color', function () {
            var parser = new scssParser_1.SCSSParser();
            languageFacts_test_1.assertColor(parser, '#main { color: foo(red) }', 'red', facts_1.colorFrom256RGB(0xff, 0, 0));
            languageFacts_test_1.assertColor(parser, '#main { color: red() }', 'red', null);
            languageFacts_test_1.assertColor(parser, '#main { red { nested: 1px } }', 'red', null);
            languageFacts_test_1.assertColor(parser, '#main { @include red; }', 'red', null);
            languageFacts_test_1.assertColor(parser, '#main { @include foo($f: red); }', 'red', facts_1.colorFrom256RGB(0xff, 0, 0));
            languageFacts_test_1.assertColor(parser, '@function red($p) { @return 1px; }', 'red', null);
            languageFacts_test_1.assertColor(parser, '@function foo($p) { @return red; }', 'red', facts_1.colorFrom256RGB(0xff, 0, 0));
            languageFacts_test_1.assertColor(parser, '@function foo($r: red) { @return $r; }', 'red', facts_1.colorFrom256RGB(0xff, 0, 0));
            languageFacts_test_1.assertColor(parser, '#main { color: rgba($input-border, 0.7) }', 'rgba', null, true);
            languageFacts_test_1.assertColor(parser, '#main { color: rgba($input-border, 1, 1, 0.7) }', 'rgba', null, true);
        });
    });
});
