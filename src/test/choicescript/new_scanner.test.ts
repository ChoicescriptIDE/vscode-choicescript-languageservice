/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Scanner, TokenType, ChoiceScriptScanner, ITokenCS } from '../../parser/ChoiceScriptScanner';
import { readFile, readFileSync } from 'fs';
import * as assert from 'assert';

type TokenMatchInfo = {
	len: number,
	offset: number,
	text: string,
	type: TokenType,
	skip?: boolean
};

function assertSingleToken(scan: ChoiceScriptScanner, source: string, len: number, offset: number, text: string, ...tokenTypes: TokenType[]): void {
	scan.setSource(source);
	let token = scan.scan();
	assert.equal(token.len, len, `Expected len '${len}' but got '${token.len}'\n\tE: '${text}', G: '${token.text}'`);
	assert.equal(token.offset, offset, `Expected offset '${offset}' but got '${token.offset}'\n\tE: '${text}', G: '${token.text}'`);
	assert.equal(token.text, text, `Expected text '${text}' but got '${token.text}'\n\tE: '${text}', G: '${token.text}'`);
	for (let i = 1; i < tokenTypes.length; i++) {
		let type = scan.scan().type;
		assert.equal(type, tokenTypes[i], `Expected type '${tokenTypes[i]}' but got '${type}'\n\tE: '${text}', G: '${token.text}'`);
	}
	assert.equal(scan.scan().type, TokenType.EOF, source);
}

function assertMultipleTokens(scan: ChoiceScriptScanner, source: string, ...tokens: TokenMatchInfo[]) {
	scan.setSource(source);
	let token;
	let matchIndex = 0;
	while((token = scan.scan()) && (token.type !== TokenType.EOF)) {
		let matchToken = tokens[matchIndex++];
		if ((typeof matchToken.skip === undefined) || !matchToken.skip) { // null entries allow skipping tokens
			assert.equal(token.len, matchToken.len, `Expected len '${matchToken.len}' but got '${token.len}'\n\tE: '${matchToken.text}', G: '${token.text}'`);
			assert.equal(token.offset, matchToken.offset,`Expected offset '${matchToken.offset}' but got '${token.offset}'\n\tE: '${matchToken.text}', G: '${token.text}'`);
			assert.equal(token.text, matchToken.text, `Expected text '${matchToken.text}' but got '${token.text}'\n\tE: '${matchToken.text}', G: '${token.text}'`);
			assert.equal(token.type, matchToken.type, `Expected type '${matchToken.type}' but got '${token.type}'\n\tE: '${matchToken.text}', G: '${token.text}'`);
		}
	}
}

suite('ChoiceScript - New Scanner', () => {

	test('Test', function() {
		let scanner = new ChoiceScriptScanner();
		scanner.setSource(readFileSync("./src/test/choicescript/data/scenes/scanner/offset.txt").toString());
		let token: ITokenCS;
		while((token = scanner.scan()).type !== TokenType.EOF) {
		}
	});

	test('Indentation', function() {
		let scanner = new ChoiceScriptScanner();
		assertSingleToken(scanner, '\t\t\t\t', 4, 0, '\t\t\t\t', TokenType.Indentation);
		assertSingleToken(scanner, '  ', 2, 0, '  ', TokenType.Indentation);
		assertMultipleTokens(scanner, '\t\t*choice\n' +
										'\t\t\t#Option 1\n' +
										'\t\t\t\tText 1\n' +
										'\t\t\t#Option 2\n' +
										'\t\t\t\tText 2\n',
			// *choice
			{len: 2, offset: 0, text: '\t\t', type: TokenType.Indentation},
			{len: 1, offset: 2, text: '*', type: TokenType.Asterisk},
			{len: 6, offset: 3, text: 'choice', type: TokenType.Ident},
			{len: 1, offset: 9, text: '\n', type: TokenType.EOL},

			// #Option 1
			{len: 3, offset: 10, text: '\t\t\t', type: TokenType.Indentation},
			{len: 1, offset: 13, text: '#', type: TokenType.Hash},
			{len: 6, offset: 14, text: 'Option', type: TokenType.Word},
			{len: 1, offset: 20, text: ' ', type: TokenType.Whitespace},
			{len: 1, offset: 21, text: '1', type: TokenType.Num},
			{len: 1, offset: 22, text: '\n', type: TokenType.EOL},

			// Text 1
			{len: 4, offset: 23, text: '\t\t\t\t', type: TokenType.Indentation},
			{len: 4, offset: 27, text: 'Text', type: TokenType.Word},
			{len: 1, offset: 31, text: ' ', type: TokenType.Whitespace},
			{len: 1, offset: 32, text: '1', type: TokenType.Num},
			{len: 1, offset: 33, text: '\n', type: TokenType.EOL},

			// #Option 2
			{len: 3, offset: 34, text: '\t\t\t', type: TokenType.Indentation},
			{len: 1, offset: 37, text: '#', type: TokenType.Hash},
			{len: 6, offset: 38, text: 'Option', type: TokenType.Word},
			{len: 1, offset: 44, text: ' ', type: TokenType.Whitespace},
			{len: 1, offset: 45, text: '2', type: TokenType.Num},
			{len: 1, offset: 46, text: '\n', type: TokenType.EOL},

			// Text 2
			{len: 4, offset: 47, text: '\t\t\t\t', type: TokenType.Indentation},
			{len: 4, offset: 51, text: 'Text', type: TokenType.Word},
			{len: 1, offset: 55, text: ' ', type: TokenType.Whitespace},
			{len: 1, offset: 56, text: '2', type: TokenType.Num},
			{len: 1, offset: 57, text: '\n', type: TokenType.EOL},
		);
	});

	test('Token Word', function() {
		let scanner = new ChoiceScriptScanner();
		assertSingleToken(scanner, 'Word', 4, 0, 'Word', TokenType.Ident);
		assertSingleToken(scanner, 'won\'t', 5, 0, 'won\'t', TokenType.Word);
		assertSingleToken(scanner, 'mêlée', 5, 0, 'mêlée', TokenType.Word);
		assertMultipleTokens(scanner, 'forty-two', 
			{len: 5, offset: 0, text: 'forty', type: TokenType.Word}, 
			{skip: false, len: 1, offset: 5, text: '-', type: TokenType.Char }, // If we didn't care about the hyphen, "skip: true" means don't bother trying to match it.
			{len: 3, offset: 6, text: 'two', type: TokenType.Word}
		);
	});

	test('Token Number', function () {
		let scanner = new ChoiceScriptScanner();
		assertSingleToken(scanner, '1234', 4, 0, '1234', TokenType.Num);
		assertSingleToken(scanner, '1.34', 4, 0, '1.34', TokenType.Num);
		assertSingleToken(scanner, '.234', 4, 0, '.234', TokenType.Num);
		assertSingleToken(scanner, '.234.', 4, 0, '.234', TokenType.Num, TokenType.Char);
		assertSingleToken(scanner, '..234', 1, 0, '.', TokenType.Char, TokenType.Num);
	});

	test('Commands', function () {
		let scanner = new ChoiceScriptScanner();
		assertMultipleTokens(scanner, '*set myvar "mystring"',
			{len: 1, offset: 0, text: '*', type: TokenType.Asterisk},
			{len: 3, offset: 1, text: 'set', type: TokenType.Ident},
			{len: 1, offset: 4, text: ' ', type: TokenType.Whitespace},
			{len: 5, offset: 5, text: 'myvar', type: TokenType.Ident},
			{len: 1, offset: 10, text: ' ', type: TokenType.Whitespace},
			{len: 10, offset: 11, text: '"mystring"', type: TokenType.String}
		);
		assertMultipleTokens(scanner, '*rand    mynum    min    max',
			{len: 1, offset: 0, text: '*', type: TokenType.Asterisk},
			{len: 4, offset: 1, text: 'rand', type: TokenType.Ident},
			{len: 4, offset: 5, text: '    ', type: TokenType.Whitespace},
			{len: 5, offset: 9, text: 'mynum', type: TokenType.Ident},
			{len: 4, offset: 14, text: '    ', type: TokenType.Whitespace},
			{len: 3, offset: 18, text: 'min', type: TokenType.Ident},
			{len: 4, offset: 21, text: '    ', type: TokenType.Whitespace},
			{len: 3, offset: 25, text: 'max', type: TokenType.Ident},
		);
	});

	test('EOL', function () {
		let scanner = new ChoiceScriptScanner();
		assertSingleToken(scanner, '\n', 1, 0, '\n', TokenType.EOL);
		// assertSingleToken(scanner, '\r\n', 2, 0, '\r\n', TokenType.EOL); redundant on pseudo linebreak parser
		assertSingleToken(scanner, '*choice\n', 1, 0, '*', TokenType.Asterisk, TokenType.Ident, TokenType.EOL);
		assertSingleToken(scanner, '*choice\r\n', 1, 0, '*', TokenType.Asterisk, TokenType.Ident, TokenType.EOL);
	});

	test('Token singletokens ;:{}[]()', function () {
		let scanner = new ChoiceScriptScanner();
		assertSingleToken(scanner, ':  ', 1, 0, ':', TokenType.Colon, TokenType.Whitespace);
		assertSingleToken(scanner, ';  ', 1, 0, ';', TokenType.SemiColon, TokenType.Whitespace);
		assertSingleToken(scanner, '{  ', 1, 0, '{', TokenType.CurlyL, TokenType.Whitespace);
		assertSingleToken(scanner, '}  ', 1, 0, '}', TokenType.CurlyR, TokenType.Whitespace);
		assertSingleToken(scanner, '[  ', 1, 0, '[', TokenType.BracketL, TokenType.Whitespace);
		assertSingleToken(scanner, ']  ', 1, 0, ']', TokenType.BracketR, TokenType.Whitespace);
		assertSingleToken(scanner, '(  ', 1, 0, '(', TokenType.ParenthesisL, TokenType.Whitespace);
		assertSingleToken(scanner, ')  ', 1, 0, ')', TokenType.ParenthesisR, TokenType.Whitespace);
	});

	test('Delimiters/Operators', function () {
		let scanner = new ChoiceScriptScanner();
		assertSingleToken(scanner, '+', 1, 0, '+', TokenType.Char);
		assertSingleToken(scanner, '-', 1, 0, '-', TokenType.Char);
		assertSingleToken(scanner, '/', 1, 0, '/', TokenType.Char);
		assertSingleToken(scanner, '*', 1, 0, '*', TokenType.Asterisk);
		assertSingleToken(scanner, '&', 1, 0, '&', TokenType.Char);
		assertSingleToken(scanner, '%', 1, 0, '%', TokenType.Char);
		assertSingleToken(scanner, '^', 1, 0, '^', TokenType.Char);
		assertSingleToken(scanner, '#', 1, 0, '#', TokenType.Hash);
		assertSingleToken(scanner, '!', 1, 0, '!', TokenType.Char);
		assertSingleToken(scanner, '$', 1, 0, '$', TokenType.Dollar);
		assertSingleToken(scanner, '@', 1, 0, '@', TokenType.Char);
	});

	test('Comments', function () {
		let scanner = new ChoiceScriptScanner();
		assertMultipleTokens(scanner, '	*comment this is a comment',
			{len: 1, offset: 0, text: '	', type: TokenType.Indentation},
			{len: 26, offset: 1, text: '*comment this is a comment', type: TokenType.SingleLineComment}
		);
		assertMultipleTokens(scanner, '  *comment this is a comment',
			{len: 2, offset: 0, text: '  ', type: TokenType.Indentation},
			{len: 26, offset: 2, text: '*comment this is a comment', type: TokenType.SingleLineComment}
		);
		assertSingleToken(scanner, '*comment this is a comment', 26, 0, '*comment this is a comment', TokenType.SingleLineComment);
		assertSingleToken(scanner, '*comment t', 10, 0, '*comment t', TokenType.SingleLineComment);
	});

	test('Fairmath Operators', function () {
		let scanner = new ChoiceScriptScanner();
		assertMultipleTokens(scanner, '*set myvar %- myvar',
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Asterisk},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{len: 2, offset: 11, text: '%-', type: TokenType.FairMathSub},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
		);
	});

	test('Strings', function () {
		let scanner = new ChoiceScriptScanner();
		assertMultipleTokens(scanner, '*set myvar "mystring"',
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Asterisk},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{len: 10, offset: 11, text: '"mystring"', type: TokenType.String}
		);
		assertMultipleTokens(scanner, '*set myvar "*comment"',
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Asterisk},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{len: 10, offset: 11, text: '"*comment"', type: TokenType.String}
		);
		assertMultipleTokens(scanner, '*setref myvar "@{test test|test} ${test} [n/]"',
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Asterisk},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{len: 32, offset: 14, text: '"@{test test|test} ${test} [n/]"', type: TokenType.String}
		);
		assertMultipleTokens(scanner, '*goto "broken_string',
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Asterisk},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{len: 14, offset: 6, text: '"broken_string', type: TokenType.String}
		);
		assertMultipleTokens(scanner, '*set var "escaped \\"strings\\" are valid too"',
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Asterisk},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Ident},
			{skip: true, len: 0, offset: 0, text: '', type: TokenType.Whitespace},
			{len: 35, offset: 9, text: '"escaped \"strings\" are valid too"', type: TokenType.String}
		);
	});

});
