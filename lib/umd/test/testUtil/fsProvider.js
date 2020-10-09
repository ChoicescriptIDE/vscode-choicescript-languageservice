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
        define(["require", "exports", "../../cssLanguageTypes", "vscode-uri", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFsProvider = void 0;
    var cssLanguageTypes_1 = require("../../cssLanguageTypes");
    var vscode_uri_1 = require("vscode-uri");
    var fs_1 = require("fs");
    function getFsProvider() {
        return {
            stat: function (documentUriString) {
                return new Promise(function (c, e) {
                    var documentUri = vscode_uri_1.URI.parse(documentUriString);
                    if (documentUri.scheme !== 'file') {
                        e(new Error('Protocol not supported: ' + documentUri.scheme));
                        return;
                    }
                    fs_1.stat(documentUri.fsPath, function (err, stats) {
                        if (err) {
                            if (err.code === 'ENOENT') {
                                return c({
                                    type: cssLanguageTypes_1.FileType.Unknown,
                                    ctime: -1,
                                    mtime: -1,
                                    size: -1
                                });
                            }
                            else {
                                return e(err);
                            }
                        }
                        var type = cssLanguageTypes_1.FileType.Unknown;
                        if (stats.isFile()) {
                            type = cssLanguageTypes_1.FileType.File;
                        }
                        else if (stats.isDirectory()) {
                            type = cssLanguageTypes_1.FileType.Directory;
                        }
                        else if (stats.isSymbolicLink()) {
                            type = cssLanguageTypes_1.FileType.SymbolicLink;
                        }
                        c({
                            type: type,
                            ctime: stats.ctime.getTime(),
                            mtime: stats.mtime.getTime(),
                            size: stats.size
                        });
                    });
                });
            },
            readDirectory: function (locationString) {
                return new Promise(function (c, e) {
                    var location = vscode_uri_1.URI.parse(locationString);
                    if (location.scheme !== 'file') {
                        e(new Error('Protocol not supported: ' + location.scheme));
                        return;
                    }
                    fs_1.readdir(location.fsPath, { withFileTypes: true }, function (err, children) {
                        if (err) {
                            return e(err);
                        }
                        c(children.map(function (stat) {
                            if (stat.isSymbolicLink()) {
                                return [stat.name, cssLanguageTypes_1.FileType.SymbolicLink];
                            }
                            else if (stat.isDirectory()) {
                                return [stat.name, cssLanguageTypes_1.FileType.Directory];
                            }
                            else if (stat.isFile()) {
                                return [stat.name, cssLanguageTypes_1.FileType.File];
                            }
                            else {
                                return [stat.name, cssLanguageTypes_1.FileType.Unknown];
                            }
                        }));
                    });
                });
            }
        };
    }
    exports.getFsProvider = getFsProvider;
});
