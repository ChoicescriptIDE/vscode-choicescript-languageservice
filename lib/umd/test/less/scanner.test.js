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
        define(["require", "exports", "assert", "../../parser/cssScanner", "../../parser/lessScanner"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = require("assert");
    var cssScanner_1 = require("../../parser/cssScanner");
    var lessScanner_1 = require("../../parser/lessScanner");
    function assertSingleToken(source, len, offset, text, type) {
        var scan = new lessScanner_1.LESSScanner();
        scan.setSource(source);
        var token = scan.scan();
        assert.equal(token.len, len);
        assert.equal(token.offset, offset);
        assert.equal(token.text, text);
        assert.equal(token.type, type);
    }
    suite('LESS - Scanner', function () {
        test('Test Escaped JavaScript', function () {
            assertSingleToken('`', 1, 0, '`', cssScanner_1.TokenType.BadEscapedJavaScript);
            assertSingleToken('`a', 2, 0, '`a', cssScanner_1.TokenType.BadEscapedJavaScript);
            assertSingleToken('`let a = "ssss"`', 16, 0, '`let a = "ssss"`', cssScanner_1.TokenType.EscapedJavaScript);
            assertSingleToken('`let a = "ss\ns"`', 16, 0, '`let a = "ss\ns"`', cssScanner_1.TokenType.EscapedJavaScript);
        });
        // less deactivated comments
        test('Test Token SingleLineComment', function () {
            assertSingleToken('//', 0, 2, '', cssScanner_1.TokenType.EOF);
            assertSingleToken('//this is a comment test', 0, 24, '', cssScanner_1.TokenType.EOF);
            assertSingleToken('// this is a comment test', 0, 25, '', cssScanner_1.TokenType.EOF);
            assertSingleToken('// this is a\na', 1, 13, 'a', cssScanner_1.TokenType.Ident);
            assertSingleToken('// this is a\n// more\n   \n/* comment */a', 1, 38, 'a', cssScanner_1.TokenType.Ident);
        });
    });
});
