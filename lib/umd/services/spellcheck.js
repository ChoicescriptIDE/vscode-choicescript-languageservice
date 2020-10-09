(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./textRules", "../parser/ChoiceScriptNodes", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpellCheckVisitor = void 0;
    var textRules_1 = require("./textRules");
    var nodes = require("../parser/ChoiceScriptNodes");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var NodesByRootMap = /** @class */ (function () {
        function NodesByRootMap() {
            this.data = {};
        }
        NodesByRootMap.prototype.add = function (root, name, node) {
            var entry = this.data[root];
            if (!entry) {
                entry = { nodes: [], names: [] };
                this.data[root] = entry;
            }
            entry.names.push(name);
            if (node) {
                entry.nodes.push(node);
            }
        };
        return NodesByRootMap;
    }());
    var SpellCheckVisitor = /** @class */ (function () {
        function SpellCheckVisitor(document, typo, userDics) {
            this.misspellings = [];
            this.userDics = { "persistent": {}, "session": {} };
            this.documentText = document.getText();
            this.typo = typo;
            this.userDics = userDics || this.userDics;
        }
        SpellCheckVisitor.entries = function (node, document, typo, userDics) {
            var visitor = new SpellCheckVisitor(document, typo, userDics);
            node.acceptVisitor(visitor);
            return visitor.getEntries();
        };
        SpellCheckVisitor.prototype.findValueInExpression = function (expression, v) {
            var found = false;
            expression.accept(function (node) {
                if (node.type === nodes.NodeType.Identifier && node.getText() === v) {
                    found = true;
                }
                return !found;
            });
            return found;
        };
        SpellCheckVisitor.prototype.getEntries = function () {
            return this.misspellings;
        };
        SpellCheckVisitor.prototype.addEntry = function (node, rule, details) {
            var entry = new nodes.Marker(node, rule, nodes.Level.Information, details, node.offset, node.length);
            this.misspellings.push(entry);
        };
        SpellCheckVisitor.prototype.getMissingNames = function (expected, actual) {
            expected = expected.slice(0); // clone
            for (var i = 0; i < actual.length; i++) {
                var k = expected.indexOf(actual[i]);
                if (k !== -1) {
                    expected[k] = null;
                }
            }
            var result = null;
            for (var i = 0; i < expected.length; i++) {
                var curr = expected[i];
                if (curr) {
                    if (result === null) {
                        result = localize('namelist.single', "'{0}'", curr);
                    }
                    else {
                        result = localize('namelist.concatenated', "{0}, '{1}'", result, curr);
                    }
                }
            }
            return result;
        };
        SpellCheckVisitor.prototype.wordInUserDics = function (word) {
            word = word.toLowerCase(); // spellings are case insensitive
            for (var dic in this.userDics) {
                if (this.userDics[dic][word]) {
                    return true;
                }
            }
            return false;
        };
        SpellCheckVisitor.prototype.visitNode = function (node) {
            switch (node.type) {
                case nodes.NodeType.Scene:
                    return this.visitScene(node);
                case nodes.NodeType.TextLine:
                    return true;
                case nodes.NodeType.RealWord:
                    return this.visitWord(node);
                case nodes.NodeType.VariableReplacement:
                    return true;
                case nodes.NodeType.Expression:
                    return true;
                case nodes.NodeType.StringLiteral:
                    return true;
                case nodes.NodeType.MultiReplace:
                    return true;
                case nodes.NodeType.MultiReplaceOption:
                    return true;
                default:
                    return true;
            }
        };
        SpellCheckVisitor.prototype.visitScene = function (node) {
            return true;
        };
        SpellCheckVisitor.prototype.visitWord = function (node) {
            var word = node.getText();
            if (!this.typo.check(word)
                && !this.wordInUserDics(word)) {
                this.addEntry(node, textRules_1.Rules.BadSpelling, "Bad spelling: " + node.getText());
            }
            return true;
        };
        SpellCheckVisitor.prefixes = [
            '-ms-', '-moz-', '-o-', '-webkit-',
        ];
        return SpellCheckVisitor;
    }());
    exports.SpellCheckVisitor = SpellCheckVisitor;
});
