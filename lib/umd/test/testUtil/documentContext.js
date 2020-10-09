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
        define(["require", "exports", "url", "../../utils/strings", "../../utils/resources"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDocumentContext = void 0;
    var url = require("url");
    var strings_1 = require("../../utils/strings");
    var resources_1 = require("../../utils/resources");
    function getDocumentContext(workspaceFolder) {
        return {
            resolveReference: function (ref, base) {
                if (strings_1.startsWith(ref, '/') && workspaceFolder) {
                    return resources_1.joinPath(workspaceFolder, ref);
                }
                try {
                    return url.resolve(base, ref);
                }
                catch (e) {
                    return undefined;
                }
            }
        };
    }
    exports.getDocumentContext = getDocumentContext;
});
