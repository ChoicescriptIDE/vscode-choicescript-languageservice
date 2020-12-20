/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-uri"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.joinPath = exports.dirname = void 0;
    var vscode_uri_1 = require("vscode-uri");
    function dirname(uriString) {
        return vscode_uri_1.Utils.dirname(vscode_uri_1.URI.parse(uriString)).toString();
    }
    exports.dirname = dirname;
    function joinPath(uriString) {
        var paths = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            paths[_i - 1] = arguments[_i];
        }
        return vscode_uri_1.Utils.joinPath.apply(vscode_uri_1.Utils, __spreadArrays([vscode_uri_1.URI.parse(uriString)], paths)).toString();
    }
    exports.joinPath = joinPath;
});
