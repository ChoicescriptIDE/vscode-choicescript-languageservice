(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/cssScanner"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = require("assert");
    var cssScanner_1 = require("../../parser/cssScanner");
    suite('CSS - Scanner', function () {
        function assertSingleToken(scan, source, len, offset, text) {
            var tokenTypes = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                tokenTypes[_i - 5] = arguments[_i];
            }
            scan.setSource(source);
            var token = scan.scan();
            assert.equal(token.len, len);
            assert.equal(token.offset, offset);
            assert.equal(token.text, text);
            assert.equal(token.type, tokenTypes[0]);
            for (var i = 1; i < tokenTypes.length; i++) {
                assert.equal(scan.scan().type, tokenTypes[i], source);
            }
            assert.equal(scan.scan().type, cssScanner_1.TokenType.EOF, source);
        }
        test('Whitespace', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, ' @', 1, 1, '@', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, ' /* comment*/ \n/*comment*/@', 1, 26, '@', cssScanner_1.TokenType.Delim);
            scanner = new cssScanner_1.Scanner();
            scanner.ignoreWhitespace = false;
            assertSingleToken(scanner, ' @', 1, 0, ' ', cssScanner_1.TokenType.Whitespace, cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '/*comment*/ @', 1, 11, ' ', cssScanner_1.TokenType.Whitespace, cssScanner_1.TokenType.Delim);
            scanner = new cssScanner_1.Scanner();
            scanner.ignoreComment = false;
            assertSingleToken(scanner, ' /*comment*/@', 11, 1, '/*comment*/', cssScanner_1.TokenType.Comment, cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '/*comment*/ @', 11, 0, '/*comment*/', cssScanner_1.TokenType.Comment, cssScanner_1.TokenType.Delim);
        });
        test('Token Ident', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '\u060frf', 3, 0, '\u060frf', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'über', 4, 0, 'über', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '-bo', 3, 0, '-bo', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '_bo', 3, 0, '_bo', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'boo', 3, 0, 'boo', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'Boo', 3, 0, 'Boo', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'red--', 5, 0, 'red--', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'red-->', 5, 0, 'red--', cssScanner_1.TokenType.Ident, cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '--red', 5, 0, '--red', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '---red', 1, 0, '-', cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '---', 1, 0, '-', cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, 'a\\.b', 4, 0, 'a\.b', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '\\E9motion', 9, 0, 'émotion', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '\\E9 dition', 10, 0, 'édition', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, '\\0000E9dition', 13, 0, 'édition', cssScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'S\\0000e9f', 9, 0, 'Séf', cssScanner_1.TokenType.Ident);
        });
        test('Token Url', function () {
            var scanner = new cssScanner_1.Scanner();
            function assertURLArgument(source, text, tokenType) {
                scanner.setSource(source);
                var token = scanner.scanUnquotedString();
                assert(token);
                assert.equal(token.len, text.length);
                assert.equal(token.offset, 0);
                assert.equal(token.text, text);
                assert.equal(token.type, tokenType);
            }
            assertURLArgument('http://msft.com', 'http://msft.com', cssScanner_1.TokenType.UnquotedString);
            assertURLArgument('http://msft.com\'', 'http://msft.com', cssScanner_1.TokenType.UnquotedString);
        });
        test('Token AtKeyword', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '@import', 7, 0, '@import', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@importttt', 10, 0, '@importttt', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@imp', 4, 0, '@imp', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@5', 2, 0, '@5', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@media', 6, 0, '@media', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@page', 5, 0, '@page', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@charset', 8, 0, '@charset', cssScanner_1.TokenType.Charset);
            assertSingleToken(scanner, '@-mport', 7, 0, '@-mport', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@\u00f0mport', 7, 0, '@\u00f0mport', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@apply', 6, 0, '@apply', cssScanner_1.TokenType.AtKeyword);
            assertSingleToken(scanner, '@', 1, 0, '@', cssScanner_1.TokenType.Delim);
        });
        test('Token Number', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '1234', 4, 0, '1234', cssScanner_1.TokenType.Num);
            assertSingleToken(scanner, '1.34', 4, 0, '1.34', cssScanner_1.TokenType.Num);
            assertSingleToken(scanner, '.234', 4, 0, '.234', cssScanner_1.TokenType.Num);
            assertSingleToken(scanner, '.234.', 4, 0, '.234', cssScanner_1.TokenType.Num, cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '..234', 1, 0, '.', cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Num);
        });
        test('Token Delim', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '@', 1, 0, '@', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '+', 1, 0, '+', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '>', 1, 0, '>', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '#', 1, 0, '#', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '\'', 1, 0, '\'', cssScanner_1.TokenType.BadString);
            assertSingleToken(scanner, '"', 1, 0, '"', cssScanner_1.TokenType.BadString);
        });
        test('Token Hash', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '#import', 7, 0, '#import', cssScanner_1.TokenType.Hash);
            assertSingleToken(scanner, '#-mport', 7, 0, '#-mport', cssScanner_1.TokenType.Hash);
            assertSingleToken(scanner, '#123', 4, 0, '#123', cssScanner_1.TokenType.Hash);
        });
        test('Token Dimension/Percentage', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '3em', 3, 0, '3em', cssScanner_1.TokenType.EMS);
            assertSingleToken(scanner, '4.423ex', 7, 0, '4.423ex', cssScanner_1.TokenType.EXS);
            assertSingleToken(scanner, '3423px', 6, 0, '3423px', cssScanner_1.TokenType.Length);
            assertSingleToken(scanner, '4.423cm', 7, 0, '4.423cm', cssScanner_1.TokenType.Length);
            assertSingleToken(scanner, '4.423mm', 7, 0, '4.423mm', cssScanner_1.TokenType.Length);
            assertSingleToken(scanner, '4.423in', 7, 0, '4.423in', cssScanner_1.TokenType.Length);
            assertSingleToken(scanner, '4.423pt', 7, 0, '4.423pt', cssScanner_1.TokenType.Length);
            assertSingleToken(scanner, '4.423pc', 7, 0, '4.423pc', cssScanner_1.TokenType.Length);
            assertSingleToken(scanner, '4.423deg', 8, 0, '4.423deg', cssScanner_1.TokenType.Angle);
            assertSingleToken(scanner, '4.423rad', 8, 0, '4.423rad', cssScanner_1.TokenType.Angle);
            assertSingleToken(scanner, '4.423grad', 9, 0, '4.423grad', cssScanner_1.TokenType.Angle);
            assertSingleToken(scanner, '4.423ms', 7, 0, '4.423ms', cssScanner_1.TokenType.Time);
            assertSingleToken(scanner, '4.423s', 6, 0, '4.423s', cssScanner_1.TokenType.Time);
            assertSingleToken(scanner, '4.423hz', 7, 0, '4.423hz', cssScanner_1.TokenType.Freq);
            assertSingleToken(scanner, '.423khz', 7, 0, '.423khz', cssScanner_1.TokenType.Freq);
            assertSingleToken(scanner, '3.423%', 6, 0, '3.423%', cssScanner_1.TokenType.Percentage);
            assertSingleToken(scanner, '.423%', 5, 0, '.423%', cssScanner_1.TokenType.Percentage);
            assertSingleToken(scanner, '.423ft', 6, 0, '.423ft', cssScanner_1.TokenType.Dimension);
            assertSingleToken(scanner, '200dpi', 6, 0, '200dpi', cssScanner_1.TokenType.Resolution);
            assertSingleToken(scanner, '123dpcm', 7, 0, '123dpcm', cssScanner_1.TokenType.Resolution);
        });
        test('Token String', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '\'farboo\'', 8, 0, '\'farboo\'', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '"farboo"', 8, 0, '"farboo"', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '"farbo\u00f0"', 8, 0, '"farbo\u00f0"', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '"far\\\"oo"', 9, 0, '"far\"oo"', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '"fa\\\noo"', 8, 0, '"fa\noo"', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '"fa\\\roo"', 8, 0, '"fa\roo"', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '"fa\\\foo"', 8, 0, '"fa\foo"', cssScanner_1.TokenType.String);
            assertSingleToken(scanner, '\'farboo"', 8, 0, '\'farboo"', cssScanner_1.TokenType.BadString);
            assertSingleToken(scanner, '\'farboo', 7, 0, '\'farboo', cssScanner_1.TokenType.BadString);
            assertSingleToken(scanner, '\'', 1, 0, '\'', cssScanner_1.TokenType.BadString);
            assertSingleToken(scanner, '"', 1, 0, '"', cssScanner_1.TokenType.BadString);
        });
        test('Token CDO', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '<!--', 4, 0, '<!--', cssScanner_1.TokenType.CDO);
            assertSingleToken(scanner, '<!-\n-', 1, 0, '<', cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Exclamation, cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Delim);
        });
        test('Token CDC', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '-->', 3, 0, '-->', cssScanner_1.TokenType.CDC);
            assertSingleToken(scanner, '--y>', 3, 0, '--y', cssScanner_1.TokenType.Ident, cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '--<', 1, 0, '-', cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Delim);
        });
        test('Token singletokens ;:{}[]()', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, ':  ', 1, 0, ':', cssScanner_1.TokenType.Colon);
            assertSingleToken(scanner, ';  ', 1, 0, ';', cssScanner_1.TokenType.SemiColon);
            assertSingleToken(scanner, '{  ', 1, 0, '{', cssScanner_1.TokenType.CurlyL);
            assertSingleToken(scanner, '}  ', 1, 0, '}', cssScanner_1.TokenType.CurlyR);
            assertSingleToken(scanner, '[  ', 1, 0, '[', cssScanner_1.TokenType.BracketL);
            assertSingleToken(scanner, ']  ', 1, 0, ']', cssScanner_1.TokenType.BracketR);
            assertSingleToken(scanner, '(  ', 1, 0, '(', cssScanner_1.TokenType.ParenthesisL);
            assertSingleToken(scanner, ')  ', 1, 0, ')', cssScanner_1.TokenType.ParenthesisR);
        });
        test('Token dashmatch & includes', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '~=', 2, 0, '~=', cssScanner_1.TokenType.Includes);
            assertSingleToken(scanner, '~', 1, 0, '~', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '|=', 2, 0, '|=', cssScanner_1.TokenType.Dashmatch);
            assertSingleToken(scanner, '|', 1, 0, '|', cssScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '^=', 2, 0, '^=', cssScanner_1.TokenType.PrefixOperator);
            assertSingleToken(scanner, '$=', 2, 0, '$=', cssScanner_1.TokenType.SuffixOperator);
            assertSingleToken(scanner, '*=', 2, 0, '*=', cssScanner_1.TokenType.SubstringOperator);
        });
        test('Comments', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, '/*      */', 0, 10, '', cssScanner_1.TokenType.EOF);
            assertSingleToken(scanner, '/*      abcd*/', 0, 14, '', cssScanner_1.TokenType.EOF);
            assertSingleToken(scanner, '/*abcd  */', 0, 10, '', cssScanner_1.TokenType.EOF);
            assertSingleToken(scanner, '/* ab- .-cd  */', 0, 15, '', cssScanner_1.TokenType.EOF);
        });
        test('Whitespaces', function () {
            var scanner = new cssScanner_1.Scanner();
            assertSingleToken(scanner, ' ', 0, 1, '', cssScanner_1.TokenType.EOF);
            assertSingleToken(scanner, '      ', 0, 6, '', cssScanner_1.TokenType.EOF);
        });
    });
    suite('CSS - Token Sequences', function () {
        function assertTokenSequence(scan, source) {
            var tokens = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                tokens[_i - 2] = arguments[_i];
            }
            scan.setSource(source);
            var token = scan.scan();
            var i = 0;
            while (tokens.length > i) {
                assert.equal(token.type, tokens[i]);
                token = scan.scan();
                i++;
            }
        }
        // tests with skipping comments
        test('Token Sequence', function () {
            var scanner = new cssScanner_1.Scanner();
            assertTokenSequence(scanner, '5 5 5 5', cssScanner_1.TokenType.Num, cssScanner_1.TokenType.Num, cssScanner_1.TokenType.Num, cssScanner_1.TokenType.Num);
            assertTokenSequence(scanner, '/* 5 4 */-->', cssScanner_1.TokenType.CDC);
            assertTokenSequence(scanner, '/* 5 4 */ -->', cssScanner_1.TokenType.CDC);
            assertTokenSequence(scanner, '/* "adaasd" */ -->', cssScanner_1.TokenType.CDC);
            assertTokenSequence(scanner, '/* <!-- */ -->', cssScanner_1.TokenType.CDC);
            assertTokenSequence(scanner, 'red-->', cssScanner_1.TokenType.Ident, cssScanner_1.TokenType.Delim);
            assertTokenSequence(scanner, '@ import', cssScanner_1.TokenType.Delim, cssScanner_1.TokenType.Ident);
        });
    });
});
