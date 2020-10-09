(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/ChoiceScriptScanner", "os"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = require("assert");
    var ChoiceScriptScanner_1 = require("../../parser/ChoiceScriptScanner");
    var os_1 = require("os");
    suite('ChoiceScript - Scanner', function () {
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
            assert.equal(token.type, tokenTypes[0], "Expected type '" + os_1.type + "' but got '" + token.type + "'\n\tE: '" + text + "', G: '" + token.text + "'");
            for (var i = 1; i < tokenTypes.length; i++) {
                assert.equal(scan.scan().type, tokenTypes[i], source);
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
        // test('Whitespace', function () {
        // 	let scanner = new Scanner();
        // 	assertSingleToken(scanner, ' @', 1, 1, '@', TokenType.Delim);
        // 	assertSingleToken(scanner, ' /* comment*/ \n/*comment*/@', 1, 26, '@', TokenType.Delim);
        // 	scanner = new Scanner();
        // 	scanner.ignoreWhitespace = false;
        // 	assertSingleToken(scanner, ' @', 1, 0, ' ', TokenType.Whitespace, TokenType.Delim);
        // 	assertSingleToken(scanner, '/*comment*/ @', 1, 11, ' ', TokenType.Whitespace, TokenType.Delim);
        // 	scanner = new Scanner();
        // 	scanner.ignoreComment = false;
        // 	assertSingleToken(scanner, ' /*comment*/@', 11, 1, '/*comment*/', TokenType.Comment, TokenType.Delim);
        // 	assertSingleToken(scanner, '/*comment*/ @', 11, 0, '/*comment*/', TokenType.Comment, TokenType.Delim);
        // });
        /*test('Token Ident', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '\u060frf', 3, 0, '\u060frf', TokenType.Ident);
            assertSingleToken(scanner, 'über', 4, 0, 'über', TokenType.Ident);
            assertSingleToken(scanner, '-bo', 3, 0, '-bo', TokenType.Ident);
            assertSingleToken(scanner, '_bo', 3, 0, '_bo', TokenType.Ident);
            assertSingleToken(scanner, 'boo', 3, 0, 'boo', TokenType.Ident);
            assertSingleToken(scanner, 'Boo', 3, 0, 'Boo', TokenType.Ident);
            assertSingleToken(scanner, 'red--', 5, 0, 'red--', TokenType.Ident);
            assertSingleToken(scanner, 'red-->', 5, 0, 'red--', TokenType.Ident, TokenType.Delim);
            assertSingleToken(scanner, '--red', 5, 0, '--red', TokenType.Ident);
            assertSingleToken(scanner, '---red', 1, 0, '-', TokenType.Delim, TokenType.Ident);
            assertSingleToken(scanner, '---', 1, 0, '-', TokenType.Delim, TokenType.Delim, TokenType.Delim);
            assertSingleToken(scanner, 'a\\.b', 4, 0, 'a\.b', TokenType.Ident);
            assertSingleToken(scanner, '\\E9motion', 9, 0, 'émotion', TokenType.Ident);
            assertSingleToken(scanner, '\\E9 dition', 10, 0, 'édition', TokenType.Ident);
            assertSingleToken(scanner, '\\0000E9dition', 13, 0, 'édition', TokenType.Ident);
            assertSingleToken(scanner, 'S\\0000e9f', 9, 0, 'Séf', TokenType.Ident);
        });*/
        /*test('Token Url', function () {
            let scanner = new Scanner();
            function assertURLArgument(source: string, text: string, tokenType: TokenType): void {
                scanner.setSource(source);
                let token = scanner.scanUnquotedString();
                assert(token);
                assert.equal(token!.len, text.length);
                assert.equal(token!.offset, 0);
                assert.equal(token!.text, text);
                assert.equal(token!.type, tokenType);
            }
    
            assertURLArgument('http://msft.com', 'http://msft.com', TokenType.UnquotedString);
            assertURLArgument('http://msft.com\'', 'http://msft.com', TokenType.UnquotedString);
        });*/
        /*test('Token AtKeyword', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '@import', 7, 0, '@import', TokenType.AtKeyword);
            assertSingleToken(scanner, '@importttt', 10, 0, '@importttt', TokenType.AtKeyword);
            assertSingleToken(scanner, '@imp', 4, 0, '@imp', TokenType.AtKeyword);
            assertSingleToken(scanner, '@5', 2, 0, '@5', TokenType.AtKeyword);
            assertSingleToken(scanner, '@media', 6, 0, '@media', TokenType.AtKeyword);
            assertSingleToken(scanner, '@page', 5, 0, '@page', TokenType.AtKeyword);
            assertSingleToken(scanner, '@charset', 8, 0, '@charset', TokenType.Charset);
            assertSingleToken(scanner, '@-mport', 7, 0, '@-mport', TokenType.AtKeyword);
            assertSingleToken(scanner, '@\u00f0mport', 7, 0, '@\u00f0mport', TokenType.AtKeyword);
            assertSingleToken(scanner, '@apply', 6, 0, '@apply', TokenType.AtKeyword);
            assertSingleToken(scanner, '@', 1, 0, '@', TokenType.Delim);
        });*/
        test('Indentation', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
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
            { len: 3, offset: 10, text: '\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 1, offset: 13, text: '#', type: ChoiceScriptScanner_1.TokenType.Hash }, { len: 6, offset: 14, text: 'Option', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 21, text: '1', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 22, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // Text 1
            { len: 4, offset: 23, text: '\t\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 4, offset: 27, text: 'Text', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 32, text: '1', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 33, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // #Option 2
            { len: 3, offset: 34, text: '\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 1, offset: 37, text: '#', type: ChoiceScriptScanner_1.TokenType.Hash }, { len: 6, offset: 38, text: 'Option', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 45, text: '2', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 46, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL }, 
            // Text 2
            { len: 4, offset: 47, text: '\t\t\t\t', type: ChoiceScriptScanner_1.TokenType.Indentation }, { len: 4, offset: 51, text: 'Text', type: ChoiceScriptScanner_1.TokenType.Ident }, { len: 1, offset: 56, text: '2', type: ChoiceScriptScanner_1.TokenType.Num }, { len: 1, offset: 57, text: '\n', type: ChoiceScriptScanner_1.TokenType.EOL });
        });
        test('Token Word', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, 'Word', 4, 0, 'Word', ChoiceScriptScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'won\'t', 5, 0, 'won\'t', ChoiceScriptScanner_1.TokenType.Word);
            assertSingleToken(scanner, 'mêlée', 5, 0, 'mêlée', ChoiceScriptScanner_1.TokenType.Word);
            assertMultipleTokens(scanner, 'forty-two', { len: 5, offset: 0, text: 'forty', type: ChoiceScriptScanner_1.TokenType.Ident }, { skip: false, len: 1, offset: 5, text: '-', type: ChoiceScriptScanner_1.TokenType.Delim }, // If we didn't care about the hyphen, "skip: true" means don't bother trying to match it.
            { len: 3, offset: 6, text: 'two', type: ChoiceScriptScanner_1.TokenType.Ident });
        });
        test('Token Number', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, '1234', 4, 0, '1234', ChoiceScriptScanner_1.TokenType.Num);
            assertSingleToken(scanner, '1.34', 4, 0, '1.34', ChoiceScriptScanner_1.TokenType.Num);
            assertSingleToken(scanner, '.234', 4, 0, '.234', ChoiceScriptScanner_1.TokenType.Num);
            assertSingleToken(scanner, '.234.', 4, 0, '.234', ChoiceScriptScanner_1.TokenType.Num, ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '..234', 1, 0, '.', ChoiceScriptScanner_1.TokenType.Delim, ChoiceScriptScanner_1.TokenType.Num);
        });
        test('EOL', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, '\n', 1, 0, '\n', ChoiceScriptScanner_1.TokenType.EOL);
            assertSingleToken(scanner, '\r\n', 2, 0, '\r\n', ChoiceScriptScanner_1.TokenType.EOL);
            assertSingleToken(scanner, '*choice\n', 1, 0, '*', ChoiceScriptScanner_1.TokenType.Asterisk, ChoiceScriptScanner_1.TokenType.Ident, ChoiceScriptScanner_1.TokenType.EOL);
            assertSingleToken(scanner, '*choice\r\n', 1, 0, '*', ChoiceScriptScanner_1.TokenType.Asterisk, ChoiceScriptScanner_1.TokenType.Ident, ChoiceScriptScanner_1.TokenType.EOL);
        });
        test('Identifiers', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, 'ident', 5, 0, 'ident', ChoiceScriptScanner_1.TokenType.Ident);
            assertSingleToken(scanner, 'other_mod+1', 9, 0, 'other_mod', ChoiceScriptScanner_1.TokenType.Ident, ChoiceScriptScanner_1.TokenType.Delim, ChoiceScriptScanner_1.TokenType.Num);
        });
        /*test('Token String', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, "my simple string", "my simple string".length, 0, "my simple string", TokenType.String);
            assertSingleToken(scanner, "*set myvar \"my set \"escaped\" string\"", "\"my set \"escaped\" string\"".length, 0, "\"my set \"escaped\" string\"", TokenType.String);
            assertSingleToken(scanner, "\"*comment is\"", "\"*comment is\"".length, 0, "\"*comment is\"", TokenType.String);
        });*/
        /*test('Token Delim', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '@', 1, 0, '@', TokenType.Delim);
            assertSingleToken(scanner, '+', 1, 0, '+', TokenType.Delim);
            assertSingleToken(scanner, '>', 1, 0, '>', TokenType.Delim);
            assertSingleToken(scanner, '#', 1, 0, '#', TokenType.Delim);
            assertSingleToken(scanner, '\'', 1, 0, '\'', TokenType.BadString);
            assertSingleToken(scanner, '"', 1, 0, '"', TokenType.BadString);
        });*/
        /*test('Token Hash', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '#import', 7, 0, '#import', TokenType.Hash);
            assertSingleToken(scanner, '#-mport', 7, 0, '#-mport', TokenType.Hash);
            assertSingleToken(scanner, '#123', 4, 0, '#123', TokenType.Hash);
        });*/
        /*test('Token Dimension/Percentage', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '3em', 3, 0, '3em', TokenType.EMS);
            assertSingleToken(scanner, '4.423ex', 7, 0, '4.423ex', TokenType.EXS);
            assertSingleToken(scanner, '3423px', 6, 0, '3423px', TokenType.Length);
            assertSingleToken(scanner, '4.423cm', 7, 0, '4.423cm', TokenType.Length);
            assertSingleToken(scanner, '4.423mm', 7, 0, '4.423mm', TokenType.Length);
            assertSingleToken(scanner, '4.423in', 7, 0, '4.423in', TokenType.Length);
            assertSingleToken(scanner, '4.423pt', 7, 0, '4.423pt', TokenType.Length);
            assertSingleToken(scanner, '4.423pc', 7, 0, '4.423pc', TokenType.Length);
            assertSingleToken(scanner, '4.423deg', 8, 0, '4.423deg', TokenType.Angle);
            assertSingleToken(scanner, '4.423rad', 8, 0, '4.423rad', TokenType.Angle);
            assertSingleToken(scanner, '4.423grad', 9, 0, '4.423grad', TokenType.Angle);
            assertSingleToken(scanner, '4.423ms', 7, 0, '4.423ms', TokenType.Time);
            assertSingleToken(scanner, '4.423s', 6, 0, '4.423s', TokenType.Time);
            assertSingleToken(scanner, '4.423hz', 7, 0, '4.423hz', TokenType.Freq);
            assertSingleToken(scanner, '.423khz', 7, 0, '.423khz', TokenType.Freq);
            assertSingleToken(scanner, '3.423%', 6, 0, '3.423%', TokenType.Percentage);
            assertSingleToken(scanner, '.423%', 5, 0, '.423%', TokenType.Percentage);
            assertSingleToken(scanner, '.423ft', 6, 0, '.423ft', TokenType.Dimension);
            assertSingleToken(scanner, '200dpi', 6, 0, '200dpi', TokenType.Resolution);
            assertSingleToken(scanner, '123dpcm', 7, 0, '123dpcm', TokenType.Resolution);
        });*/
        /*test('Token String', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '\'farboo\'', 8, 0, '\'farboo\'', TokenType.String);
            assertSingleToken(scanner, '"farboo"', 8, 0, '"farboo"', TokenType.String);
            assertSingleToken(scanner, '"farbo\u00f0"', 8, 0, '"farbo\u00f0"', TokenType.String);
            assertSingleToken(scanner, '"far\\\"oo"', 9, 0, '"far\"oo"', TokenType.String);
            assertSingleToken(scanner, '"fa\\\noo"', 8, 0, '"fa\noo"', TokenType.String);
            assertSingleToken(scanner, '"fa\\\roo"', 8, 0, '"fa\roo"', TokenType.String);
            assertSingleToken(scanner, '"fa\\\foo"', 8, 0, '"fa\foo"', TokenType.String);
            assertSingleToken(scanner, '\'farboo"', 8, 0, '\'farboo"', TokenType.BadString);
            assertSingleToken(scanner, '\'farboo', 7, 0, '\'farboo', TokenType.BadString);
            assertSingleToken(scanner, '\'', 1, 0, '\'', TokenType.BadString);
            assertSingleToken(scanner, '"', 1, 0, '"', TokenType.BadString);
        });*/
        /*test('Token CDO', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '<!--', 4, 0, '<!--', TokenType.CDO);
            assertSingleToken(scanner, '<!-\n-', 1, 0, '<', TokenType.Delim, TokenType.Exclamation, TokenType.Delim, TokenType.Delim);
        });*/
        /*test('Token CDC', function () {
            let scanner = new Scanner();
            assertSingleToken(scanner, '-->', 3, 0, '-->', TokenType.CDC);
            assertSingleToken(scanner, '--y>', 3, 0, '--y', TokenType.Ident, TokenType.Delim);
            assertSingleToken(scanner, '--<', 1, 0, '-', TokenType.Delim, TokenType.Delim, TokenType.Delim);
        });*/
        test('Token singletokens ;:{}[]()', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, ':  ', 1, 0, ':', ChoiceScriptScanner_1.TokenType.Colon);
            assertSingleToken(scanner, ';  ', 1, 0, ';', ChoiceScriptScanner_1.TokenType.SemiColon);
            assertSingleToken(scanner, '{  ', 1, 0, '{', ChoiceScriptScanner_1.TokenType.CurlyL);
            assertSingleToken(scanner, '}  ', 1, 0, '}', ChoiceScriptScanner_1.TokenType.CurlyR);
            assertSingleToken(scanner, '[  ', 1, 0, '[', ChoiceScriptScanner_1.TokenType.BracketL);
            assertSingleToken(scanner, ']  ', 1, 0, ']', ChoiceScriptScanner_1.TokenType.BracketR);
            assertSingleToken(scanner, '(  ', 1, 0, '(', ChoiceScriptScanner_1.TokenType.ParenthesisL);
            assertSingleToken(scanner, ')  ', 1, 0, ')', ChoiceScriptScanner_1.TokenType.ParenthesisR);
        });
        test('Delimiters/Operators', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, '+', 1, 0, '+', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '-', 1, 0, '-', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '/', 1, 0, '/', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '*', 1, 0, '*', ChoiceScriptScanner_1.TokenType.Asterisk);
            assertSingleToken(scanner, '&', 1, 0, '&', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '%', 1, 0, '%', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '^', 1, 0, '^', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '#', 1, 0, '#', ChoiceScriptScanner_1.TokenType.Hash);
            assertSingleToken(scanner, '!', 1, 0, '!', ChoiceScriptScanner_1.TokenType.Delim);
            assertSingleToken(scanner, '$', 1, 0, '$', ChoiceScriptScanner_1.TokenType.Dollar);
            assertSingleToken(scanner, '@', 1, 0, '@', ChoiceScriptScanner_1.TokenType.Delim);
        });
        test('Comments', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, '*comment', 8, 0, '*comment', ChoiceScriptScanner_1.TokenType.SingleLineComment);
            //assertSingleToken(scanner, '*comment this is a comment', 26, 0, '*comment this is a comment', TokenType.SingleLineComment);
            //assertSingleToken(scanner, '	*comment this is a comment', 26, 1, '*comment this is a comment', TokenType.SingleLineComment);
            //assertSingleToken(scanner, '  *comment this is a comment', 26, 2, '*comment this is a comment', TokenType.SingleLineComment);
            //assertSingleToken(scanner, '*comment t', 10, 0, '*comment t', TokenType.SingleLineComment);
        });
        test('Whitespaces', function () {
            /* tslint:disable */
            this.skip();
            /* tslint:enable */
            /*
            let scanner = new Scanner();
            assertSingleToken(scanner, ' ', 1, 1, '', TokenType.EOF);
            assertSingleToken(scanner, '      ', 0, 6, '', TokenType.EOF);*/
        });
        test('Fairmath Operators', function () {
            var scanner = new ChoiceScriptScanner_1.Scanner();
            assertSingleToken(scanner, '%-', 2, 0, '%-', ChoiceScriptScanner_1.TokenType.FairMathSub);
            assertSingleToken(scanner, '%+', 2, 0, '%+', ChoiceScriptScanner_1.TokenType.FairMathAdd);
        });
    });
});
// suite('CSS - Token Sequences', () => {
// 	function assertTokenSequence(scan: Scanner, source: string, ...tokens: TokenType[]): void {
// 		scan.setSource(source);
// 		let token = scan.scan();
// 		let i = 0;
// 		while (tokens.length > i) {
// 			assert.equal(token.type, tokens[i]);
// 			token = scan.scan();
// 			i++;
// 		}
// 	}
// 	// tests with skipping comments
// 	test('Token Sequence', function () {
// 		let scanner = new Scanner();
// 		assertTokenSequence(scanner, '5 5 5 5', TokenType.Num, TokenType.Num, TokenType.Num, TokenType.Num);
// 		assertTokenSequence(scanner, '/* 5 4 */-->', TokenType.CDC);
// 		assertTokenSequence(scanner, '/* 5 4 */ -->', TokenType.CDC);
// 		assertTokenSequence(scanner, '/* "adaasd" */ -->', TokenType.CDC);
// 		assertTokenSequence(scanner, '/* <!-- */ -->', TokenType.CDC);
// 		assertTokenSequence(scanner, 'red-->', TokenType.Ident, TokenType.Delim);
// 		assertTokenSequence(scanner, '@ import', TokenType.Delim, TokenType.Ident);
// 	});
// });
