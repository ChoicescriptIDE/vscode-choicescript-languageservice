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
        define(["require", "exports", "assert", "../../cssLanguageService"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = require("assert");
    var cssLanguageService_1 = require("../../cssLanguageService");
    function assertRanges(lines, expected, languageId, rangeLimit) {
        if (languageId === void 0) { languageId = 'css'; }
        if (rangeLimit === void 0) { rangeLimit = null; }
        var document = cssLanguageService_1.TextDocument.create("test://foo/bar." + languageId, languageId, 1, lines.join('\n'));
        var context = rangeLimit ? { rangeLimit: rangeLimit } : {};
        var actualRanges = cssLanguageService_1.getCSSLanguageService().getFoldingRanges(document, context);
        actualRanges = actualRanges.sort(function (r1, r2) { return r1.startLine - r2.startLine; });
        assert.deepEqual(actualRanges, expected);
    }
    function assertRangesForLanguages(lines, expected, languageIds) {
        languageIds.forEach(function (id) {
            assertRanges(lines, expected, id);
        });
    }
    function r(startLine, endLine, kind) {
        return { startLine: startLine, endLine: endLine, kind: kind };
    }
    suite('CSS Folding - Basic', function () {
        test('Fold single rule', function () {
            var input = [
                /*0*/ '.foo {',
                /*1*/ '  color: red;',
                /*2*/ '}'
            ];
            assertRanges(input, [r(0, 1)]);
        });
        test('No fold for single line', function () {
            var input = [
                '.foo { color: red; }'
            ];
            assertRanges(input, []);
        });
        test('Fold multiple rules', function () {
            var input = [
                /*0*/ '.foo {',
                /*1*/ '  color: red;',
                /*2*/ '  opacity: 1;',
                /*3*/ '}'
            ];
            assertRanges(input, [r(0, 2)]);
        });
        test('Fold with no indentation', function () {
            var input = [
                /*0*/ '.foo{',
                /*1*/ 'color: red;',
                /*2*/ '}'
            ];
            assertRanges(input, [r(0, 1)]);
        });
        test('Fold with opening curly brace on new line', function () {
            var input = [
                /*0*/ '.foo',
                /*1*/ '{',
                /*2*/ 'color: red;',
                /*3*/ '}'
            ];
            assertRanges(input, [r(1, 2)]);
        });
        test('Fold with closing curly brace on same line', function () {
            var input = [
                /*0*/ '.foo',
                /*1*/ '{',
                /*2*/ 'color: red; }'
            ];
            assertRanges(input, [r(1, 2)]);
        });
    });
    suite('CSS Folding - Partial', function () {
        test('Without closing curly brace', function () {
            var input = [
                /*0*/ '.foo {',
                /*1*/ 'color: red;'
            ];
            assertRanges(input, []);
        });
        test('Without closing curly brace creates correct folding ranges', function () {
            var input = [
                /*0*/ '.foo {',
                /*1*/ 'color: red;',
                /*2*/ '.bar {',
                /*3*/ 'color: blue;',
                /*4*/ '}',
            ];
            assertRanges(input, [r(2, 3)]);
        });
        /**
         * The correct folding ranges should be (0, 5), (2, 4). However the current naive stack approach cannot handle it
         */
        test('Without closing curly brace in nested rules creates correct folding ranges', function () {
            var input = [
                /*0*/ '.foo {',
                /*1*/ '  .bar {',
                /*2*/ '  .baz {',
                /*3*/ '    color: blue;',
                /*4*/ '  }',
                /*5*/ '}'
            ];
            assertRanges(input, [r(1, 4), r(2, 3)]);
        });
        test('Without opening curly brace should not throw error', function () {
            var input = [
                /*0*/ '.foo',
                /*1*/ '  color: blue;',
                /*2*/ '}}'
            ];
            assertRanges(input, []);
        });
        // test('Without opening #region should not throw error', () => {
        // 	const input = [
        // 		/*0*/'.foo',
        // 		/*1*/'  color: blue;',
        // 		/*2*/'}',
        // 		/*3*/'/* #endregion */'
        // 	];
        // 	assertRanges(input, []);
        // });
    });
    suite('CSS Folding - Comments', function () {
        test('Comment - single star', function () {
            var input = [
                /*0*/ '/*',
                /*1*/ '.foo {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '*/'
            ];
            assertRanges(input, [r(0, 4, 'comment')]);
        });
        test('Comment - double star', function () {
            var input = [
                /*0*/ '/**',
                /*1*/ '.foo {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '*/'
            ];
            assertRanges(input, [r(0, 4, 'comment')]);
        });
        test('Comment - wrong indentation and no newline', function () {
            var input = [
                /*0*/ '/**',
                /*1*/ '.foo{',
                /*2*/ 'color: red;',
                /*3*/ '} */'
            ];
            assertRanges(input, [r(0, 3, 'comment')]);
        });
        test('Comment - Single line ', function () {
            var input = [
                './* .foo { color: red; } */'
            ];
            assertRanges(input, []);
        });
    });
    suite('CSS Folding - Nested', function () {
        test('Postcss nested', function () {
            var input = [
                /*0*/ '.foo {',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '}'
            ];
            assertRanges(input, [r(0, 3), r(1, 2)]);
        });
        test('Media query', function () {
            var input = [
                /*0*/ '@media screen {',
                /*1*/ '.foo {',
                /*2*/ 'color: red;',
                /*3*/ '}',
                /*4*/ '}'
            ];
            assertRanges(input, [r(0, 3), r(1, 2)]);
        });
    });
    suite('CSS Folding - Regions', function () {
        test('Simple region with comment', function () {
            var input = [
                /*0*/ '/* #region */',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/* #endregion */'
            ];
            assertRanges(input, [r(0, 4, 'region'), r(1, 2)]);
        });
        test('Simple region with padded comment', function () {
            var input = [
                /*0*/ '/*  #region   */',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/*   #endregion   */'
            ];
            assertRanges(input, [r(0, 4, 'region'), r(1, 2)]);
        });
        test('Simple region without spaces', function () {
            var input = [
                /*0*/ '/*#region*/',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/*#endregion*/'
            ];
            assertRanges(input, [r(0, 4, 'region'), r(1, 2)]);
        });
        test('Simple region with description', function () {
            var input = [
                /*0*/ '/* #region Header page */',
                /*1*/ '.bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/* #endregion */'
            ];
            assertRanges(input, [r(0, 4, 'region'), r(1, 2)]);
        });
    });
    suite('CSS Folding - maxRanges', function () {
        test('Max ranges', function () {
            var input = [
                /*0*/ '/* #region Header page */',
                /*1*/ '.bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/* #endregion */'
            ];
            assertRanges(input, [r(0, 4, 'region')], 'css', 1);
        });
    });
    suite('CSS Folding - No intersections and always choose first region', function () {
        test('region intersecting with declaration', function () {
            var input = [
                /*0*/ '/* #region */',
                /*1*/ '.bar {',
                /*2*/ '  color: red;',
                /*3*/ '/* #endregion */',
                /*4*/ '  display: block;',
                /*5*/ '}',
            ];
            assertRanges(input, [r(0, 3, 'region')]);
        });
        test('declaration intersecting with region', function () {
            var input = [
                /*0*/ '.bar {',
                /*1*/ '/* #region */',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/* #endregion */',
            ];
            assertRanges(input, [r(0, 2)]);
        });
    });
    suite('CSS Folding - Incomplete region markers', function () {
        test('declaration intersecting with region', function () {
            var input = [
                /*0*/ '/* #endregion */',
            ];
            assertRanges(input, []);
        });
    });
    suite('SCSS Folding', function () {
        test('SCSS Mixin', function () {
            var input = [
                /*0*/ '@mixin clearfix($width) {',
                /*1*/ '  @if !$width {',
                /*2*/ '    // if width is not passed, or empty do this',
                /*3*/ '  } @else {',
                /*4*/ '    display: inline-block;',
                /*5*/ '    width: $width;',
                /*6*/ '  }',
                /*7*/ '}'
            ];
            assertRanges(input, [r(0, 6), r(1, 2), r(3, 5)], 'scss');
        });
        test('SCSS Interolation', function () {
            var input = [
                /*0*/ '.orbit-#{$d}-prev {',
                /*1*/ '  foo-#{$d}-bar: 1;',
                /*2*/ '  #{$d}-bar-#{$d}: 2;',
                /*3*/ '}'
            ];
            assertRanges(input, [r(0, 2)], 'scss');
        });
        test('SCSS While', function () {
            var input = [
                /*0*/ '@while $i > 0 {',
                /*1*/ '  .item-#{$i} { width: 2em * $i; }',
                /*2*/ '  $i: $i - 2;',
                /*3*/ '}'
            ];
            assertRanges(input, [r(0, 2)], 'scss');
        });
        test('SCSS Nested media query', function () {
            var input = [
                /*0*/ '@mixin desktop {',
                /*1*/ '  $desktop-width: 1024px;',
                /*2*/ '  @media(min-width: #{$desktop-width}) {',
                /*3*/ '    width: 500px;',
                /*4*/ '  }',
                /*5*/ '}'
            ];
            assertRanges(input, [r(0, 4), r(2, 3)], 'scss');
        });
    });
    suite('SCSS/LESS Folding - Regions', function () {
        test('Simple region with comment', function () {
            var input = [
                /*0*/ '/* #region */',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/* #endregion */'
            ];
            assertRangesForLanguages(input, [r(0, 4, 'region'), r(1, 2)], ['scss', 'less']);
        });
        test('Simple region with padded comment', function () {
            var input = [
                /*0*/ '/*  #region  */',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '/*   #endregion   */'
            ];
            assertRangesForLanguages(input, [r(0, 4, 'region'), r(1, 2)], ['scss', 'less']);
        });
        test('Region with SCSS single line comment', function () {
            var input = [
                /*0*/ '// #region',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '// #endregion'
            ];
            assertRangesForLanguages(input, [r(0, 4, 'region'), r(1, 2)], ['scss', 'less']);
        });
        test('Region with SCSS single line padded comment', function () {
            var input = [
                /*0*/ '//   #region  ',
                /*1*/ '& .bar {',
                /*2*/ '  color: red;',
                /*3*/ '}',
                /*4*/ '//   #endregion'
            ];
            assertRangesForLanguages(input, [r(0, 4, 'region'), r(1, 2)], ['scss', 'less']);
        });
        test('Region with both simple comments and region comments', function () {
            var input = [
                /*0*/ '// #region',
                /*1*/ '/*',
                /*2*/ 'comments',
                /*3*/ '*/',
                /*4*/ '& .bar {',
                /*5*/ '  color: red;',
                /*6*/ '}',
                /*7*/ '// #endregion'
            ];
            assertRangesForLanguages(input, [r(0, 7, 'region'), r(1, 3, 'comment'), r(4, 5)], ['scss', 'less']);
        });
    });
});
