(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../parser/cssErrors", "../../parser/lessParser", "../css/parser.test"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var cssErrors_1 = require("../../parser/cssErrors");
    var lessParser_1 = require("../../parser/lessParser");
    var parser_test_1 = require("../css/parser.test");
    suite('LESS - Parser', function () {
        test('Variable', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('@color', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('$color', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('$$color', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@$color', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('$@color', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@co42lor', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@-co42lor', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@@foo', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@@@foo', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@12ooo', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[bar]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[@bar]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[$bar]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[@@bar]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[100]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[1prop]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNode('@foo[--prop]', parser, parser._parseVariable.bind(parser));
            parser_test_1.assertNoNode('@ @foo', parser, parser._parseFunction.bind(parser));
            parser_test_1.assertNoNode('@-@foo', parser, parser._parseFunction.bind(parser));
        });
        test('Media', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('@media @phone {}', parser, parser._parseMedia.bind(parser));
            parser_test_1.assertNode('@media(max-width: 767px) { .mixinRef() }', parser, parser._parseMedia.bind(parser));
            parser_test_1.assertNode('@media(max-width: 767px) { .mixinDec() {} }', parser, parser._parseMedia.bind(parser));
            parser_test_1.assertNode('.something { @media (max-width: 760px) { > div { display: block; } } }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@media (@var) {}', parser, parser._parseMedia.bind(parser));
            parser_test_1.assertNode('@media (@sizes[@large]) {}', parser, parser._parseMedia.bind(parser));
            parser_test_1.assertNode('@media screen and (@var) {}', parser, parser._parseMedia.bind(parser));
            parser_test_1.assertNode('@media (max-width: 760px) { + div { display: block; } }', parser, parser._parseStylesheet.bind(parser));
        });
        test('VariableDeclaration', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('@color: #F5F5F5', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@color: 0', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@color: 255', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@color: 25.5', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@color: 25px', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@color: 25.5px', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@primary-font: "wf_SegoeUI","Segoe UI","Segoe","Segoe WP"', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@greeting: `"hello".toUpperCase() + "!";`', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@greeting: { display: none; }', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@b: @a !important', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@rules: .mixin()', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@rules: .mixin()[]', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@rules: .mixin(@value)[@lookup][prop]', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@rules: .mixin[@lookup][prop]', parser, parser._parseVariableDeclaration.bind(parser));
            parser_test_1.assertNode('@expr: .mixin(@value)[] .mixin(@value2)[]', parser, parser._parseVariableDeclaration.bind(parser));
        });
        test('MixinDeclaration', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.color (@color: 25.5px) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.color(@color: 25.5px) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.color(@color) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.color(@color; @border) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.color() { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.color( ) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.mixin (@a) when (@a > 10), (@a < -10) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.mixin (@a) when (isnumber(@a)) and (@a > 0) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.mixin (@b) when not (@rules[@b] >= 0) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.mixin (@b) when not (@b > 0) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.mixin (@a, @rest...) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.mixin (@a) when (lightness(@a) >= 50%) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.class(@color-list, @i: 1) when (@i <= @list-length) and (@list-length > 1) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('#color() { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('#truth (@a) when (@a = true) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.color (@color; @padding: 2;) { }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertNode('.font-face(@source, @target) { @font-face { font-family: @source; src: local(\'@{target}\');} }', parser, parser._tryParseMixinDeclaration.bind(parser));
            parser_test_1.assertError('.color (@color; @padding: 2;;) { }', parser, parser._tryParseMixinDeclaration.bind(parser), cssErrors_1.ParseError.IdentifierExpected);
            parser_test_1.assertNode('.mixin-definition(@a: {}; @b: {default: works;};) { @a(); @b(); }', parser, parser._tryParseMixinDeclaration.bind(parser));
        });
        test('MixinReference', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.box-shadow(0 0 5px, 30%)', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('.box-shadow', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('.mixin(10) !important', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('.mixin(@a: 2, @b: 1)', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('#mixin(@a: 2, @b: 1)', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('#bundle > .button', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('#bundle.button', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('#bundle #inner #button(1)', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('.mixin(#008000;)', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertNode('.mixin ()', parser, parser._tryParseMixinReference.bind(parser));
            parser_test_1.assertError('.mixin(#008000;;)', parser, parser._tryParseMixinReference.bind(parser), cssErrors_1.ParseError.ExpressionExpected);
        });
        test('DetachedRuleSet', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.foo {  @greeting(); }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.media-switch(@styles) { @media(orientation:landscape){ @styles(); @foo: 9; } }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.media-switch({ flex-direction: row; });', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.keyframes(@name; @arguments) { @-moz-keyframes @name { @arguments(); } }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.keyframes(fade-in;{ 0%, 100% { opacity: 1; }});', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.foo({ .bar { color: red; }})', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.foo({ .bar { .baz { color: red; }}})', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.foo(10px; { .bar { .baz { color: red; }}})', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.foo(fade-in; { .bar { .baz { color: red; }}})', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.mixin1({a:b; .mixin2({c: d})})', parser, parser._parseStylesheet.bind(parser));
        });
        test('MixinParameter', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('@_', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('@let: value', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('@let', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('@rest...', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('...', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('value', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('"string"', parser, parser._parseMixinParameter.bind(parser));
            parser_test_1.assertNode('50%', parser, parser._parseMixinParameter.bind(parser));
        });
        test('Function', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('%()', parser, parser._parseFunction.bind(parser));
            parser_test_1.assertNoNode('% ()', parser, parser._parseFunction.bind(parser));
            parser_test_1.assertNode('func(a, b; bar)', parser, parser._parseRuleSetDeclaration.bind(parser));
            parser_test_1.assertNode('func({a: b();}, bar)', parser, parser._parseRuleSetDeclaration.bind(parser));
            parser_test_1.assertNode('func(.(@val) {})', parser, parser._parseRuleSetDeclaration.bind(parser));
            parser_test_1.assertNode('each(@list, .(@v) { prop: @v });', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('each(@list, #(@v) { prop: @v });', parser, parser._parseStylesheet.bind(parser));
        });
        test('Expr', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('(@let + 20)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(@let - 20)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(@let * 20)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(@let / 20)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 + @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 - @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 * @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 / @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 / 20 + @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 + 20 + @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 + 20 + 20 + @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 + 20 + 20 + 20 + @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 + 20 + @let + 20 + 20 + @let)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(20 + 20)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(@var1 + @var2)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('((@let + 5) * 2)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('((@let + (5 + 2)) * 2)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(@let + ((5 + 2) * 2))', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('@color', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('@color, @color', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('@color, 42%', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('@color, 42%, @color', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('@color - (@color + 10%)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(@base + @filler)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('(100% / 2 + @filler)', parser, parser._parseExpr.bind(parser));
            parser_test_1.assertNode('100% / 2 + @filler', parser, parser._parseExpr.bind(parser));
        });
        test('LessOperator', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('>=', parser, parser._parseOperator.bind(parser));
            parser_test_1.assertNode('>', parser, parser._parseOperator.bind(parser));
            parser_test_1.assertNode('<', parser, parser._parseOperator.bind(parser));
            parser_test_1.assertNode('=<', parser, parser._parseOperator.bind(parser));
        });
        test('Extend', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('nav { &:extend(.inline); }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('nav { &:extend(.test all); }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.big-bucket:extend(.bucket all) { }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.some-class:extend(tr .bucket) {}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.c:extend(.a, .b) {}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.d { &:extend(.a, .b); }', parser, parser._parseRuleset.bind(parser));
        });
        test('Declaration', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('border: thin solid 1px', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: @color', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: blue', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: (20 / @let)', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: (20 / 20 + @let)', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: func(@red)', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: desaturate(@red, 10%)', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('dummy: desaturate(16, 10%)', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('100: 100', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('1prop: 100', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('1@{var}prop: 100', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNoNode('--100: 100', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNoNode('--1prop: 100', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('color: @base-color + #111', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('color: 100% / 2 + @ref', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('border: (@width * 2) solid black', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('property: @class', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('prop-erty: fnc(@t, 10%)', parser, parser._parseDeclaration.bind(parser));
            parser_test_1.assertNode('background: url(//yourdomain/yourpath.png)', parser, parser._parseDeclaration.bind(parser));
        });
        test('Stylesheet', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.color (@radius: 5px){ -border-radius: #F5F5F5 }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.color (@radius: 5px){ -border-radius: @radius }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.color (@radius: 5px){ -border-radius: #F5F5F5 } .color (@radius: 5px) { -border-radius: #F5F5F5 }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.color (@radius: 5px) { -border-radius: #F5F5F5 } .color (@radius: 5px) { -border-radius: #F5F5F5 } .color (@radius: 5px) { -border-radius: #F5F5F5 }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.color (@radius: 5px) { -border-radius: #F5F5F5 } .color (@radius: 5px) { -border-radius: #F5F5F5 } .color (@radius: 5px) { -border-radius: #F5F5F5 }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.mixin (@a, @rest...) {}', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.mixin (@a) when (lightness(@a) >= 50%) {  background-color: black;}', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.some-mixin { font-weight:bold; } h1 { .some-mixin; font-size:40px; }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('#namespace when (@mode=huge) { .mixin() { } }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.generate-columns(1);', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@dr1: {f:b}\n@dr2: {f:b}', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@color: #F5F5F5;', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@color: #F5F5F5; @color: #F5F5F5;', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@color: #F5F5F5; @color: #F5F5F5; @color: #F5F5F5;', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@color: #F5F5F5; .color (@radius: 5px)  { -border-radius: #F5F5F5 } @color: #F5F5F5;', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@import-once "lib";', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@import-once (css) "hello";', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertError('@import-once () "hello";', parser, parser._parseStylesheet.bind(parser), cssErrors_1.ParseError.IdentifierExpected);
            parser_test_1.assertError('@import-once (less);', parser, parser._parseStylesheet.bind(parser), cssErrors_1.ParseError.URIOrStringExpected);
            parser_test_1.assertNode('@import (css) "lib";', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@import (optional, reference) "foo.less";', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@import (optional, reference,) "foo.less";', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertError('@import (optional, reference,,) "foo.less";', parser, parser._parseStylesheet.bind(parser), cssErrors_1.ParseError.RightParenthesisExpected);
        });
        test('Ruleset', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.selector { prop: erty @let 1px; }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { .mixin; }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { .mixin(1px); .mixin(blue, 1px, \'farboo\') }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { .mixin(blue; 1px;\'farboo\') }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector:active { property:value; nested:hover {}}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector {}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { property: declaration }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { @variable: declaration }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { nested {}}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { nested, a, b {}}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { property: value; property: value; }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector { property: value; @keyframes foo {} @-moz-keyframes foo {}}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('selector {  @import "bar"; }', parser, parser._parseRuleset.bind(parser));
        });
        test('term', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('%(\'repetitions: %S file: %S\', 1 + 2, "directory/file.less")', parser, parser._parseTerm.bind(parser));
            parser_test_1.assertNode('~"ms:alwaysHasItsOwnSyntax.For.Stuff()"', parser, parser._parseTerm.bind(parser)); // less syntax
            parser_test_1.assertNode('~`colorPalette("@{blue}", 1)`', parser, parser._parseTerm.bind(parser)); // less syntax
        });
        test('Nested Ruleset', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.class1 { @let: 1; .class { @let: 2; three: @let; let: 3; } one: @let; }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.class1 { @let: 1; > .class2 { display: none; } }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.foo { @supports(display: grid) { .bar { display: none; }}}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.foo { @supports(display: grid) { display: none; }}', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.parent { color:green; @document url-prefix() { .child { color:red; }}}', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('@supports (property: value) { .outOfMedia & { @media (max-size: 2px) { @supports (whatever: something) { property: value;}}}}', parser, parser._parseStylesheet.bind(parser));
        });
        test('Interpolation', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.@{name} { }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.${name} { }', parser, parser._parseRuleset.bind(parser));
            parser_test_1.assertNode('.my-element:not(.prefix-@{sub-element}) { }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.-@{color} { }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.--@{color} { }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNoNode('@', parser, parser._parseInterpolation.bind(parser));
            parser_test_1.assertNode('.px2rem(@name, @px) { @{name}: @px / @basesize; }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertError('@{', parser, parser._parseInterpolation.bind(parser), cssErrors_1.ParseError.IdentifierExpected);
            parser_test_1.assertError('@{dd', parser, parser._parseInterpolation.bind(parser), cssErrors_1.ParseError.RightCurlyExpected);
        });
        test('Selector Combinator', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('&:hover', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&.float', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&-foo', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&-1', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&1', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&-foo-1', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&-foo-1-2', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&--&', parser, parser._parseSimpleSelector.bind(parser));
            parser_test_1.assertNode('&-10-thing', parser, parser._parseSimpleSelector.bind(parser));
        });
        test('CSS Guards', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('button when (@my-option = true) { color: white; }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.something .other when (@my-option = true) { color: white; }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('& when (@my-option = true) { button { color: white; } }', parser, parser._parseStylesheet.bind(parser));
        });
        test('Merge', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('.mixin() { transform+_: scale(2); }', parser, parser._parseStylesheet.bind(parser));
            parser_test_1.assertNode('.myclass { box-shadow+: inset 0 0 10px #555; }', parser, parser._parseStylesheet.bind(parser));
        });
        test('url', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('url(//yourdomain/yourpath.png)', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url(\'http://msft.com\')', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url("http://msft.com")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url( "http://msft.com")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url(\t"http://msft.com")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url(\n"http://msft.com")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url("http://msft.com"\n)', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url("")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('uRL("")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('URL("")', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url(http://msft.com)', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url()', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertNode('url(\'http://msft.com\n)', parser, parser._parseURILiteral.bind(parser));
            parser_test_1.assertError('url("http://msft.com"', parser, parser._parseURILiteral.bind(parser), cssErrors_1.ParseError.RightParenthesisExpected);
            parser_test_1.assertError('url(http://msft.com\')', parser, parser._parseURILiteral.bind(parser), cssErrors_1.ParseError.RightParenthesisExpected);
        });
        test('@plugin', function () {
            var parser = new lessParser_1.LESSParser();
            parser_test_1.assertNode('@plugin "my-plugin";', parser, parser._parseStylesheet.bind(parser));
        });
    });
});
