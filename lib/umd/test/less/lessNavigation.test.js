(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../parser/cssNodes", "../css/navigation.test", "../../cssLanguageService", "../../languageFacts/facts"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../../parser/cssNodes");
    var navigation_test_1 = require("../css/navigation.test");
    var cssLanguageService_1 = require("../../cssLanguageService");
    var facts_1 = require("../../languageFacts/facts");
    suite('LESS - Symbols', function () {
        test('scope building', function () {
            var ls = cssLanguageService_1.getLESSLanguageService();
            navigation_test_1.assertScopeBuilding(ls, '@let: blue');
            navigation_test_1.assertScopeBuilding(ls, '.class { .nested {} }', { offset: 7, length: 14 }, { offset: 17, length: 2 });
        });
        test('symbols in scopes', function () {
            var ls = cssLanguageService_1.getLESSLanguageService();
            navigation_test_1.assertSymbolsInScope(ls, '@let: iable;', 0, { name: '@let', type: nodes.ReferenceType.Variable });
            navigation_test_1.assertSymbolsInScope(ls, '@let: iable;', 11, { name: '@let', type: nodes.ReferenceType.Variable });
            navigation_test_1.assertSymbolsInScope(ls, '@let: iable; .class { @color: blue; }', 11, { name: '@let', type: nodes.ReferenceType.Variable }, { name: '.class', type: nodes.ReferenceType.Rule });
            navigation_test_1.assertSymbolsInScope(ls, '@let: iable; .class { @color: blue; }', 21, { name: '@color', type: nodes.ReferenceType.Variable });
            navigation_test_1.assertSymbolsInScope(ls, '@let: iable; .class { @color: blue; }', 36, { name: '@color', type: nodes.ReferenceType.Variable });
            navigation_test_1.assertSymbolsInScope(ls, '@namespace "x"; .mixin() {}', 0, { name: '.mixin', type: nodes.ReferenceType.Mixin });
            navigation_test_1.assertSymbolsInScope(ls, '.mixin() { .nested() {} }', 10, { name: '.nested', type: nodes.ReferenceType.Mixin });
            navigation_test_1.assertSymbolsInScope(ls, '.mixin() { .nested() {} }', 11);
            navigation_test_1.assertSymbolsInScope(ls, '@keyframes animation {};', 0, { name: 'animation', type: nodes.ReferenceType.Keyframe });
            navigation_test_1.assertSymbolsInScope(ls, '.a(@gutter: @gutter-width) { &:extend(.b); }', 1);
        });
        test('scopes and symbols', function () {
            var ls = cssLanguageService_1.getLESSLanguageService();
            navigation_test_1.assertScopesAndSymbols(ls, '@var1: 1; @var2: 2; .foo { @var3: 3; }', '@var1,@var2,.foo,[@var3]');
            navigation_test_1.assertScopesAndSymbols(ls, '.mixin1 { @var0: 1} .mixin2(@var1) { @var3: 3 }', '.mixin1,.mixin2,[@var0],[@var1,@var3]');
            navigation_test_1.assertScopesAndSymbols(ls, 'a b { @var0: 1; c { d { } } }', '[@var0,c,[d,[]]]');
        });
        test('mark highlights', function () {
            var ls = cssLanguageService_1.getLESSLanguageService();
            navigation_test_1.assertHighlights(ls, '@var1: 1; @var2: /**/@var1;', '/**/', 2, 1, '@var1');
            navigation_test_1.assertHighlights(ls, '@var1: 1; ls { @var2: /**/@var1; }', '/**/', 2, 1, '@var1');
            navigation_test_1.assertHighlights(ls, 'r1 { @var1: 1; p1: @var1;} r2,r3 { @var1: 1; p1: /**/@var1 + @var1;}', '/**/', 3, 1, '@var1');
            navigation_test_1.assertHighlights(ls, '.r1 { r1: 1em; } r2 { r1: 2em; /**/.r1;}', '/**/', 2, 1, '.r1');
            navigation_test_1.assertHighlights(ls, '.r1(@p1) { r1: @p1; } r2 { r1: 2em; /**/.r1(2px); }', '/**/', 2, 1, '.r1');
            navigation_test_1.assertHighlights(ls, '/**/.r1(@p1) { r1: @p1; } r2 { r1: 2em; .r1(2px); }', '/**/', 2, 1, '.r1');
            navigation_test_1.assertHighlights(ls, '@p1 : 1; .r1(@p1) { r1: /**/@p1; }', '/**/', 2, 1, '@p1');
            navigation_test_1.assertHighlights(ls, '/**/@p1 : 1; .r1(@p1) { r1: @p1; }', '/**/', 1, 1, '@p1');
            navigation_test_1.assertHighlights(ls, '@p1 : 1; .r1(/**/@p1) { r1: @p1; }', '/**/', 2, 1, '@p1');
        });
        test('basic symbols', function () {
            var ls = cssLanguageService_1.getLESSLanguageService();
            navigation_test_1.assertSymbols(ls, '.a(@gutter: @gutter-width) { &:extend(.b); }', [
                { name: '.a', kind: cssLanguageService_1.SymbolKind.Method, location: cssLanguageService_1.Location.create('test://test/test.css', navigation_test_1.newRange(0, 44)) },
                { name: '.b', kind: cssLanguageService_1.SymbolKind.Class, location: cssLanguageService_1.Location.create('test://test/test.css', navigation_test_1.newRange(29, 41)) }
            ]);
        });
    });
    suite('Color', function () {
        test('color symbols', function () {
            var ls = cssLanguageService_1.getLESSLanguageService();
            navigation_test_1.assertColorSymbols(ls, '@foo: #ff9977;', { color: facts_1.colorFrom256RGB(0xff, 0x99, 0x77), range: navigation_test_1.newRange(6, 13) });
            navigation_test_1.assertColorSymbols(ls, 'body { @foo: hsl(0, 0%, 100%); }', { color: facts_1.colorFrom256RGB(255, 255, 255), range: navigation_test_1.newRange(13, 29) });
            navigation_test_1.assertColorSymbols(ls, 'body { @foo: hsl(0, 1%, 100%); }', { color: facts_1.colorFrom256RGB(255, 255, 255), range: navigation_test_1.newRange(13, 29) });
        });
    });
});
