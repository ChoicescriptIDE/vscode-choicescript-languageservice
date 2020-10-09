(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "assert", "../../cssLanguageService"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    require("mocha");
    var assert = require("assert");
    var cssLanguageService_1 = require("../../cssLanguageService");
    function assertRanges(content, expected) {
        var message = content + " gives selection range:\n";
        var offset = content.indexOf('|');
        content = content.substr(0, offset) + content.substr(offset + 1);
        var ls = cssLanguageService_1.getCSSLanguageService();
        var document = cssLanguageService_1.TextDocument.create('test://foo/bar.css', 'css', 1, content);
        var actualRanges = ls.getSelectionRanges(document, [document.positionAt(offset)], ls.parseStylesheet(document));
        assert.equal(actualRanges.length, 1);
        var offsetPairs = [];
        var curr = actualRanges[0];
        while (curr) {
            offsetPairs.push([document.offsetAt(curr.range.start), document.getText(curr.range)]);
            curr = curr.parent;
        }
        message += JSON.stringify(offsetPairs) + "\n but should give:\n" + JSON.stringify(expected) + "\n";
        assert.deepEqual(offsetPairs, expected, message);
    }
    /**
     * We don't do much testing since as long as the parser generates a valid AST,
     * correct selection ranges will be generated.
     */
    suite('CSS SelectionRange', function () {
        test('Basic', function () {
            assertRanges('.foo { |color: blue; }', [
                [7, 'color'],
                [7, 'color: blue'],
                [6, ' color: blue; '],
                [5, '{ color: blue; }'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.foo { c|olor: blue; }', [
                [7, 'color'],
                [7, 'color: blue'],
                [6, ' color: blue; '],
                [5, '{ color: blue; }'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.foo { color|: blue; }', [
                [7, 'color'],
                [7, 'color: blue'],
                [6, ' color: blue; '],
                [5, '{ color: blue; }'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.foo { color: |blue; }', [
                [14, 'blue'],
                [7, 'color: blue'],
                [6, ' color: blue; '],
                [5, '{ color: blue; }'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.foo { color: b|lue; }', [
                [14, 'blue'],
                [7, 'color: blue'],
                [6, ' color: blue; '],
                [5, '{ color: blue; }'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.foo { color: blue|; }', [
                [14, 'blue'],
                [7, 'color: blue'],
                [6, ' color: blue; '],
                [5, '{ color: blue; }'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.|foo { color: blue; }', [
                [1, 'foo'],
                [0, '.foo'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.fo|o { color: blue; }', [
                [1, 'foo'],
                [0, '.foo'],
                [0, '.foo { color: blue; }']
            ]);
            assertRanges('.foo| { color: blue; }', [
                [1, 'foo'],
                [0, '.foo'],
                [0, '.foo { color: blue; }']
            ]);
        });
        test('Multiple values', function () {
            assertRanges(".foo { font-family: '|Courier New', Courier, monospace; }", [
                [20, "'Courier New'"],
                [20, "'Courier New', Courier, monospace"],
                [7, "font-family: 'Courier New', Courier, monospace"],
                [6, " font-family: 'Courier New', Courier, monospace; "],
                [5, "{ font-family: 'Courier New', Courier, monospace; }"],
                [0, ".foo { font-family: 'Courier New', Courier, monospace; }"]
            ]);
        });
        // https://github.com/microsoft/vscode/issues/83570
        test('Edge behavior for Declaration', function () {
            assertRanges(".foo |{ }", [
                [5, '{ }'],
                [0, '.foo { }']
            ]);
            assertRanges(".foo { }|", [
                [5, '{ }'],
                [0, '.foo { }']
            ]);
            assertRanges(".foo {| }", [
                [6, ' '],
                [5, '{ }'],
                [0, '.foo { }']
            ]);
            assertRanges(".foo { | }", [
                [6, '  '],
                [5, '{  }'],
                [0, '.foo {  }']
            ]);
            assertRanges(".foo { |}", [
                [6, ' '],
                [5, '{ }'],
                [0, '.foo { }']
            ]);
        });
    });
});
