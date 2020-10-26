/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../parser/scssParser", "../css/selectorPrinting.test"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var scssParser_1 = require("../../parser/scssParser");
    var selectorPrinting_test_1 = require("../css/selectorPrinting.test");
    suite('SCSS - Selector Printing', function () {
        test('simple selector', function () {
            var p = new scssParser_1.SCSSParser();
            selectorPrinting_test_1.assertSelector(p, 'o1 { }', 'o1', '{o1}');
            selectorPrinting_test_1.assertSelector(p, '.div { } ', '.div', '{[class=div]}');
            selectorPrinting_test_1.assertSelector(p, '#div { } ', '#div', '{[id=div]}');
            selectorPrinting_test_1.assertSelector(p, 'o1.div { } ', 'o1', '{o1[class=div]}');
            selectorPrinting_test_1.assertSelector(p, 'o1#div { }', 'o1', '{o1[id=div]}');
            selectorPrinting_test_1.assertSelector(p, '#div.o1 { }', 'o1', '{[id=div|class=o1]}');
            selectorPrinting_test_1.assertSelector(p, '.o1#div { }', 'o1', '{[class=o1|id=div]}');
        });
        test('nested selector', function () {
            var p = new scssParser_1.SCSSParser();
            selectorPrinting_test_1.assertSelector(p, 'o1 { e1 { } }', 'e1', '{o1{…{e1}}}');
            selectorPrinting_test_1.assertSelector(p, 'o1 { e1.div { } }', 'e1', '{o1{…{e1[class=div]}}}');
            selectorPrinting_test_1.assertSelector(p, 'o1 o2 { e1 { } }', 'e1', '{o1{…{o2{…{e1}}}}}');
            selectorPrinting_test_1.assertSelector(p, 'o1, o2 { e1 { } }', 'e1', '{o1{…{e1}}}');
            selectorPrinting_test_1.assertSelector(p, 'o1 { @if $a { e1 { } } }', 'e1', '{o1{…{e1}}}');
            selectorPrinting_test_1.assertSelector(p, 'o1 { @mixin a { e1 { } } }', 'e1', '{e1}');
            selectorPrinting_test_1.assertSelector(p, 'o1 { @mixin a { e1 { } } }', 'e1', '{e1}');
        });
        test('referencing selector', function () {
            var p = new scssParser_1.SCSSParser();
            selectorPrinting_test_1.assertSelector(p, 'o1 { &:hover { }}', '&', '{o1[:hover=]}');
            selectorPrinting_test_1.assertSelector(p, 'o1 { &:hover & { }}', '&', '{o1[:hover=]{…{o1}}}');
            selectorPrinting_test_1.assertSelector(p, 'o1 { &__bar {}}', '&', '{o1__bar}');
            selectorPrinting_test_1.assertSelector(p, '.c1 { &__bar {}}', '&', '{[class=c1__bar]}');
            selectorPrinting_test_1.assertSelector(p, 'o.c1 { &__bar {}}', '&', '{o[class=c1__bar]}');
        });
        test('placeholders', function () {
            var p = new scssParser_1.SCSSParser();
            selectorPrinting_test_1.assertSelector(p, '%o1 { e1 { } }', 'e1', '{%o1{…{e1}}}');
        });
    });
});
