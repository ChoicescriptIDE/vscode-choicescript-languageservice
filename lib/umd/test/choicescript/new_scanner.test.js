(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../parser/ChoiceScriptScanner", "fs", "assert"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChoiceScriptScanner_1 = require("../../parser/ChoiceScriptScanner");
    var fs_1 = require("fs");
    var assert = require("assert");
    function assertSingleToken(scan, source, len, offset, text) {
        var tokenTypes = [];
        for (var _i = 5; _i < arguments.length; _i++) {
            tokenTypes[_i - 5] = arguments[_i];
        }
        scan.setSource(source);
        var token = scan.scan();
        assert.equal(token.len, len, "Expected len '" + len + "' but got '" + token.len + "'\n\tE: '" + text + "', G: '" + token.text + "'");
        assert.equal(token.offset, offset, "Expected offset '" + offset + "' but got '" + token.offset + "'\n\tE: '" + text + "', G: '" + token.text + "'");
        assert.equal(token.text, text, "Expected text '" + text + "' but got '" + token.text + "'\n\tE: '" + text + "', G: '" + token.text + "'");
        for (var i = 1; i < tokenTypes.length; i++) {
            var type = scan.scan().type;
            assert.equal(type, tokenTypes[i], "Expected type '" + tokenTypes[i] + "' but got '" + type + "'\n\tE: '" + text + "', G: '" + token.text + "'");
        }
        assert.equal(scan.scan().type, ChoiceScriptScanner_1.TokenType.EOF, source);
    }
    function assertMultipleTokens(scan, source) {
        var tokens = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            tokens[_i - 2] = arguments[_i];
        }
        scan.setSource(source);
        var token;
        var matchIndex = 0;
        while ((token = scan.scan()) && (token.type !== ChoiceScriptScanner_1.TokenType.EOF)) {
            var matchToken = tokens[matchIndex++];
            if ((typeof matchToken.skip === undefined) || !matchToken.skip) { // null entries allow skipping tokens
                assert.equal(token.len, matchToken.len, "Expected len '" + matchToken.len + "' but got '" + token.len + "'\n\tE: '" + matchToken.text + "', G: '" + token.text + "'");
                assert.equal(token.offset, matchToken.offset, "Expected offset '" + matchToken.offset + "' but got '" + token.offset + "'\n\tE: '" + matchToken.text + "', G: '" + token.text + "'");
                assert.equal(token.text, matchToken.text, "Expected text '" + matchToken.text + "' but got '" + token.text + "'\n\tE: '" + matchToken.text + "', G: '" + token.text + "'");
                assert.equal(token.type, matchToken.type, "Expected type '" + matchToken.type + "' but got '" + token.type + "'\n\tE: '" + matchToken.text + "', G: '" + token.text + "'");
            }
        }
    }
    suite('ChoiceScript - New Scanner', function () {
        test('Test', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            scanner.setSource(fs_1.readFileSync("./src/test/choicescript/data/scenes/scanner/offset.txt").toString());
            var token;
            while ((token = scanner.scan()).type !== ChoiceScriptScanner_1.TokenType.EOF) {
            }
        });
        test('Indentation', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertSingleToken(scanner, '\t\t\t\t', 4, 0, '\t\t\t\t', ChoiceScriptScanner_1.TokenType.Indentation);
            assertSingleToken(scanner, '  ', 2, 0, '  ', ChoiceScriptScanner_1.TokenType.Indentation);
            assertMultipleTokens(scanner, '\t\t*choice\n' +
                '\t\t\t#Option 1\n' +
                '\t\t\t\tText 1\n' +
                '\t\t\t#Option 2\n' +
                '\t\t\t\tText 2\n', 
            // *choice
            { len: 2, offset: 0, text: '\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 1, offset: 2, text: '*', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { len: 6, offset: 3, text: 'choice', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 9, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // #Option 1
            { len: 3, offset: 10, text: '\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 1, offset: 13, text: '#', type: ChoiceScriptScanner_1.TokenType.Hash }, { len: 6, offset: 14, text: 'Option', type: ChoiceScriptScanner_1.TokenType.Word }, { len: 1, offset: 20, text: ' ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 1, offset: 21, text: '1', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 22, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // Text 1
            { len: 4, offset: 23, text: '\t\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 4, offset: 27, text: 'Text', type: ChoiceScriptScanner_1.TokenType.Word }, { len: 1, offset: 31, text: ' ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 1, offset: 32, text: '1', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 33, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // #Option 2
            { len: 3, offset: 34, text: '\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 1, offset: 37, text: '#', type: ChoiceScriptScanner_1.TokenType.Hash }, { len: 6, offset: 38, text: 'Option', type: ChoiceScriptScanner_1.TokenType.Word }, { len: 1, offset: 44, text: ' ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 1, offset: 45, text: '2', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 46, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // Text 2
            { len: 4, offset: 47, text: '\t\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 4, offset: 51, text: 'Text', type: ChoiceScriptScanner_1.TokenType.Word }, { len: 1, offset: 55, text: ' ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 1, offset: 56, text: '2', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 57, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL });
        });
        test('Token Word', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertSingleToken(scanner, 'Word', 4, 0, 'Word', ChoiceScriptScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'won\'t', 5, 0, 'won\'t', ChoiceScriptScanner_1.TokenType.Word);
            assertSingleToken(scanner, 'mêlée', 5, 0, 'mêlée', ChoiceScriptScanner_1.TokenType.Word);
            assertMultipleTokens(scanner, 'forty-two', { len: 5, offset: 0, text: 'forty', type: ChoiceScriptScanner_1.TokenType.Word }, { skip: false, len: 1, offset: 5, text: '-', type: ChoiceScriptScanner_1.TokenType.Char }, // If we didn't care about the hyphen, "skip: true" means don't bother trying to match it.
            { len: 3, offset: 6, text: 'two', type: ChoiceScriptScanner_1.TokenType.Word });
        });
        test('Token Number', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertSingleToken(scanner, '1234', 4, 0, '1234', ChoiceScriptScanner_1.TokenType.Num);
            assertSingleToken(scanner, '1.34', 4, 0, '1.34', ChoiceScriptScanner_1.TokenType.Num);
            assertSingleToken(scanner, '.234', 4, 0, '.234', ChoiceScriptScanner_1.TokenType.Num);
            assertSingleToken(scanner, '.234.', 4, 0, '.234', ChoiceScriptScanner_1.TokenType.Num, ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '..234', 1, 0, '.', ChoiceScriptScanner_1.TokenType.Char, ChoiceScriptScanner_1.TokenType.Num);
        });
        test('Commands', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertMultipleTokens(scanner, '*set myvar "mystring"', { len: 1, offset: 0, text: '*', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { len: 3, offset: 1, text: 'set', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 4, text: ' ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 5, offset: 5, text: 'myvar', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 10, text: ' ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 10, offset: 11, text: '"mystring"', type: ChoiceScriptScanner_1.TokenType.String });
            assertMultipleTokens(scanner, '*rand    mynum    min    max', { len: 1, offset: 0, text: '*', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { len: 4, offset: 1, text: 'rand', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 4, offset: 5, text: '    ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 5, offset: 9, text: 'mynum', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 4, offset: 14, text: '    ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 3, offset: 18, text: 'min', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 4, offset: 21, text: '    ', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 3, offset: 25, text: 'max', type: ChoiceScriptScanner_1.TokenType.Ident });
        });
        test('EOL', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertSingleToken(scanner, '\n', 1, 0, '\n', ChoiceScriptScanner_1.TokenType.EOL);
            // assertSingleToken(scanner, '\r\n', 2, 0, '\r\n', TokenType.EOL); redundant on pseudo linebreak parser
            assertSingleToken(scanner, '*choice\n', 1, 0, '*', ChoiceScriptScanner_1.TokenType.Asterisk, ChoiceScriptScanner_1.TokenType.Ident, ChoiceScriptScanner_1.TokenType.EOL);
            assertSingleToken(scanner, '*choice\r\n', 1, 0, '*', ChoiceScriptScanner_1.TokenType.Asterisk, ChoiceScriptScanner_1.TokenType.Ident, ChoiceScriptScanner_1.TokenType.EOL);
        });
        test('Token singletokens ;:{}[]()', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertSingleToken(scanner, ':  ', 1, 0, ':', ChoiceScriptScanner_1.TokenType.Colon, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, ';  ', 1, 0, ';', ChoiceScriptScanner_1.TokenType.SemiColon, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, '{  ', 1, 0, '{', ChoiceScriptScanner_1.TokenType.CurlyL, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, '}  ', 1, 0, '}', ChoiceScriptScanner_1.TokenType.CurlyR, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, '[  ', 1, 0, '[', ChoiceScriptScanner_1.TokenType.BracketL, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, ']  ', 1, 0, ']', ChoiceScriptScanner_1.TokenType.BracketR, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, '(  ', 1, 0, '(', ChoiceScriptScanner_1.TokenType.ParenthesisL, ChoiceScriptScanner_1.TokenType.Whitespace);
            assertSingleToken(scanner, ')  ', 1, 0, ')', ChoiceScriptScanner_1.TokenType.ParenthesisR, ChoiceScriptScanner_1.TokenType.Whitespace);
        });
        test('Delimiters/Operators', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertSingleToken(scanner, '+', 1, 0, '+', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '-', 1, 0, '-', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '/', 1, 0, '/', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '*', 1, 0, '*', ChoiceScriptScanner_1.TokenType.Asterisk);
            assertSingleToken(scanner, '&', 1, 0, '&', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '%', 1, 0, '%', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '^', 1, 0, '^', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '#', 1, 0, '#', ChoiceScriptScanner_1.TokenType.Hash);
            assertSingleToken(scanner, '!', 1, 0, '!', ChoiceScriptScanner_1.TokenType.Char);
            assertSingleToken(scanner, '$', 1, 0, '$', ChoiceScriptScanner_1.TokenType.Dollar);
            assertSingleToken(scanner, '@', 1, 0, '@', ChoiceScriptScanner_1.TokenType.Char);
        });
        test('Comments', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertMultipleTokens(scanner, '	*comment this is a comment', { len: 1, offset: 0, text: '	', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 26, offset: 1, text: '*comment this is a comment', type: ChoiceScriptScanner_1.TokenType.SingleLineComment });
            assertMultipleTokens(scanner, '  *comment this is a comment', { len: 2, offset: 0, text: '  ', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 26, offset: 2, text: '*comment this is a comment', type: ChoiceScriptScanner_1.TokenType.SingleLineComment });
            assertSingleToken(scanner, '*comment this is a comment', 26, 0, '*comment this is a comment', ChoiceScriptScanner_1.TokenType.SingleLineComment);
            assertSingleToken(scanner, '*comment t', 10, 0, '*comment t', ChoiceScriptScanner_1.TokenType.SingleLineComment);
        });
        test('Fairmath Operators', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertMultipleTokens(scanner, '*set myvar %- myvar', { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 2, offset: 11, text: '%-', type: ChoiceScriptScanner_1.TokenType.FairMathSub }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident });
        });
        test('Strings', function () {
            var scanner = new ChoiceScriptScanner_1.ChoiceScriptScanner();
            assertMultipleTokens(scanner, '*set myvar "mystring"', { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 10, offset: 11, text: '"mystring"', type: ChoiceScriptScanner_1.TokenType.String });
            assertMultipleTokens(scanner, '*set myvar "*comment"', { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 10, offset: 11, text: '"*comment"', type: ChoiceScriptScanner_1.TokenType.String });
            assertMultipleTokens(scanner, '*setref myvar "@{test test|test} ${test} [n/]"', { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 32, offset: 14, text: '"@{test test|test} ${test} [n/]"', type: ChoiceScriptScanner_1.TokenType.String });
            assertMultipleTokens(scanner, '*goto "broken_string', { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 14, offset: 6, text: '"broken_string', type: ChoiceScriptScanner_1.TokenType.String });
            assertMultipleTokens(scanner, '*set var "escaped \\"strings\\" are valid too"', { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Asterisk }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: true, len: 0, offset: 0, text: '', type: ChoiceScriptScanner_1.TokenType.Whitespace }, { len: 35, offset: 9, text: '"escaped \"strings\" are valid too"', type: ChoiceScriptScanner_1.TokenType.String });
        });
    });
});
