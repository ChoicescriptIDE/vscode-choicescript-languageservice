var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver-types", "vscode-languageserver-textdocument", "vscode-languageserver-types"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileType = exports.ClientCapabilities = exports.SpellCheckDictionary = exports.TextDocument = void 0;
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    var vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
    Object.defineProperty(exports, "TextDocument", { enumerable: true, get: function () { return vscode_languageserver_textdocument_1.TextDocument; } });
    __exportStar(require("vscode-languageserver-types"), exports);
    //let x: UserDictionary = { "session": { "hola": true, "no": false } };
    var SpellCheckDictionary;
    (function (SpellCheckDictionary) {
        SpellCheckDictionary["EN_US"] = "en_US";
        SpellCheckDictionary["EN_GB"] = "en_GB";
    })(SpellCheckDictionary = exports.SpellCheckDictionary || (exports.SpellCheckDictionary = {}));
    var ClientCapabilities;
    (function (ClientCapabilities) {
        ClientCapabilities.LATEST = {
            textDocument: {
                completion: {
                    completionItem: {
                        documentationFormat: [vscode_languageserver_types_1.MarkupKind.Markdown, vscode_languageserver_types_1.MarkupKind.PlainText]
                    }
                },
                hover: {
                    contentFormat: [vscode_languageserver_types_1.MarkupKind.Markdown, vscode_languageserver_types_1.MarkupKind.PlainText]
                }
            }
        };
    })(ClientCapabilities = exports.ClientCapabilities || (exports.ClientCapabilities = {}));
    var FileType;
    (function (FileType) {
        /**
         * The file type is unknown.
         */
        FileType[FileType["Unknown"] = 0] = "Unknown";
        /**
         * A regular file.
         */
        FileType[FileType["File"] = 1] = "File";
        /**
         * A directory.
         */
        FileType[FileType["Directory"] = 2] = "Directory";
        /**
         * A symbolic link to a file.
         */
        FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
    })(FileType = exports.FileType || (exports.FileType = {}));
});