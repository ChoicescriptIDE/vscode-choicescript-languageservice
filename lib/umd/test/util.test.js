(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../utils/strings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    var assert = require("assert");
    var strings_1 = require("../utils/strings");
    suite('Util', function () {
        test('trim', function () {
            assert.equal(strings_1.trim("test+-", /[ ]+$/), "test+-");
            assert.equal(strings_1.trim("t est+-", /[ ]+$/), "t est+-");
            assert.equal(strings_1.trim("test+- ", /[ ]+$/), "test+-");
            assert.equal(strings_1.trim("test+- ", /[ \+]+$/), "test+-");
            assert.equal(strings_1.trim("test+- ", /[ \+\-]+$/), "test");
            assert.equal(strings_1.trim("test++- ", /[ \+\-]+$/), "test");
        });
    });
});
