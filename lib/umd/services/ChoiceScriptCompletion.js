(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../parser/ChoiceScriptNodes", "../parser/ChoiceScriptErrors", "../parser/ChoiceScriptSymbolScope", "../parser/ChoiceScriptIndexer", "../languageFacts/choicescriptFacts", "../utils/strings", "../cssLanguageTypes", "vscode-nls", "../utils/objects"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChoiceScriptCompletion = void 0;
    var nodes = require("../parser/ChoiceScriptNodes");
    var ChoiceScriptErrors_1 = require("../parser/ChoiceScriptErrors");
    var ChoiceScriptSymbolScope_1 = require("../parser/ChoiceScriptSymbolScope");
    var ChoiceScriptIndexer_1 = require("../parser/ChoiceScriptIndexer");
    var languageFacts = require("../languageFacts/choicescriptFacts");
    var strings = require("../utils/strings");
    var cssLanguageTypes_1 = require("../cssLanguageTypes");
    //import * as fs from 'fs';
    var nls = require("vscode-nls");
    var objects_1 = require("../utils/objects");
    var localize = nls.loadMessageBundle();
    var SnippetFormat = cssLanguageTypes_1.InsertTextFormat.Snippet;
    var SortTexts;
    (function (SortTexts) {
        // char code 32, comes before everything
        SortTexts["Enums"] = " ";
        SortTexts["Normal"] = "d";
        SortTexts["VendorPrefixed"] = "x";
        SortTexts["Term"] = "y";
        SortTexts["Label"] = "x";
        SortTexts["Variable"] = "z";
    })(SortTexts || (SortTexts = {}));
    var ChoiceScriptCompletion = /** @class */ (function () {
        function ChoiceScriptCompletion(variablePrefix, clientCapabilities) {
            if (variablePrefix === void 0) { variablePrefix = null; }
            this.variablePrefix = variablePrefix;
            this.clientCapabilities = clientCapabilities;
            this.completionParticipants = [];
            this.typo = null;
            this.valueTypes = [
                nodes.NodeType.Identifier, nodes.NodeType.Value, nodes.NodeType.StringLiteral, nodes.NodeType.NumericValue,
                nodes.NodeType.HexColorValue, nodes.NodeType.PrintVariable,
            ];
            var baseUrl = "test/dictionaries/";
        }
        ChoiceScriptCompletion.prototype.configure = function (settings) {
            this.settings = settings;
        };
        ChoiceScriptCompletion.prototype.getSymbolContext = function (scene) {
            if (!scene && !this.symbolContext) {
                this.symbolContext = new ChoiceScriptSymbolScope_1.Symbols(this.scene);
            }
            else if (scene) { // do we want to bother caching symbolContext here? Or in the indexer itself?
                return new ChoiceScriptSymbolScope_1.Symbols(scene);
            }
            return this.symbolContext;
        };
        ChoiceScriptCompletion.prototype.setCompletionParticipants = function (registeredCompletionParticipants) {
            this.completionParticipants = registeredCompletionParticipants || [];
        };
        ChoiceScriptCompletion.prototype.doComplete = function (document, position, scene, suggestSpelling) {
            var _this = this;
            if (suggestSpelling === void 0) { suggestSpelling = true; }
            this.offset = document.offsetAt(position);
            this.position = position;
            this.currentWord = getCurrentWord(document, this.offset);
            this.defaultReplaceRange = cssLanguageTypes_1.Range.create(cssLanguageTypes_1.Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
            this.textDocument = document;
            this.scene = scene;
            var result = { isIncomplete: false, items: [] };
            try {
                this.nodePath = nodes.getNodePath(this.scene, this.offset);
                for (var i = this.nodePath.length - 1; i >= 0; i--) {
                    var node = this.nodePath[i];
                    var parentRef = node.findParent(nodes.NodeType.VariableDeclaration);
                    if (parentRef) {
                        this.getCompletionsForVariableDeclaration(parentRef, document.uri, result);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result));
                        });
                    } /*else if (node.type === nodes.NodeType.Variable) {
                        this.getVariableProposals(node, document.uri, result);
                        return new Promise((resolve, reject) => {
                            resolve(this.finalize(result));
                        });
                    }*/
                    else if (node.type === nodes.NodeType.LabelRef) {
                        this.getLabelProposals(node, document.uri, result);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result));
                        });
                    }
                    else if (node.type === nodes.NodeType.SceneRef) {
                        this.getSceneProposals(node, document.uri, result);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result));
                        });
                    }
                    else if (node.type === nodes.NodeType.Identifier) {
                        this.getVariableProposals(node, document.uri, result);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result));
                        });
                    }
                    else if (node.type === nodes.NodeType.Variable) {
                        this.getVariableProposals(node, document.uri, result);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result));
                        });
                    }
                    else if (node.hasIssue(ChoiceScriptErrors_1.ParseError.UnknownCommand)) {
                        this.getCompletionsForCommands(result);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result));
                        });
                        // this.getCompletionForTopLevel(result);
                        // } else if (node instanceof nodes.Variable) {
                        // this.getCompletionsForVariableDeclaration()O
                    }
                }
            }
            finally {
                // don't hold on any state, clear symbolContext
                this.position = null;
                this.currentWord = null;
                this.textDocument = null;
                this.scene = null;
                this.symbolContext = null;
                this.defaultReplaceRange = null;
                this.nodePath = null;
            }
            return new Promise(function (resolve, reject) {
                resolve(_this.finalize(result));
            });
        };
        ChoiceScriptCompletion.prototype.isImportPathParent = function (type) {
            return type === nodes.NodeType.Import;
        };
        ChoiceScriptCompletion.prototype.finalize = function (result) {
            var needsSortText = result.items.some(function (i) { return !!i.sortText || i.label[0] === '-'; });
            if (needsSortText) {
                result.items.forEach(function (item, index) {
                    if (!item.sortText) {
                        if (item.label[0] === '-') {
                            item.sortText = SortTexts.VendorPrefixed + '_' + computeRankNumber(index);
                        }
                        else {
                            item.sortText = SortTexts.Normal + '_' + computeRankNumber(index);
                        }
                    }
                    else {
                        if (item.label[0] === '-') {
                            item.sortText += SortTexts.VendorPrefixed + '_' + computeRankNumber(index);
                        }
                        else {
                            item.sortText += SortTexts.Normal + '_' + computeRankNumber(index);
                        }
                    }
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.findInNodePath = function () {
            var types = [];
            for (var _b = 0; _b < arguments.length; _b++) {
                types[_b] = arguments[_b];
            }
            for (var i = this.nodePath.length - 1; i >= 0; i--) {
                var node = this.nodePath[i];
                if (types.indexOf(node.type) !== -1) {
                    return node;
                }
            }
            return null;
        };
        ChoiceScriptCompletion.prototype.getCompletionsForIdentifier = function (result) {
            var _this = this;
            var commands = languageFacts.getCommands().filter(function (cmd) {
                return _this.currentWord.slice(0, 1) === cmd.name.slice(0, 1);
            });
            for (var _i = 0, _a = commands; _i < _a.length; _i++) {
                result.items.push({
                    label: _a[_i].name,
                    detail: "(command)",
                    documentation: "TBD",
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(null), _a[_i].name),
                    kind: cssLanguageTypes_1.CompletionItemKind.Keyword
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getCompletionsForCommands = function (result) {
            var _this = this;
            var commands = languageFacts.getCommands().filter(function (cmd) {
                return _this.currentWord.slice(0, 1) === cmd.name.slice(0, 1);
            });
            for (var _i = 0, _a = commands; _i < _a.length; _i++) {
                result.items.push({
                    label: _a[_i].name,
                    detail: "(command)",
                    documentation: "TBD",
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(null), _a[_i].name),
                    kind: cssLanguageTypes_1.CompletionItemKind.Keyword
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getSuggestionsForSpellings = function (result) {
            var _this = this;
            var self = this;
            var word = this.currentWord;
            var editRange = this.getCompletionRange(null);
            return new Promise(function (resolve, reject) {
                if (_this.typo.working) {
                    reject(result); // TODO: Reject reason
                }
                else {
                    _this.typo.working = true;
                    _this.typo.suggest(word, 5, function (suggestions) {
                        var result = {
                            items: [],
                            isIncomplete: false
                        };
                        // defaults
                        var ignoreForSession = {
                            label: "Ignore '" + word + "' this session.",
                            documentation: "",
                            textEdit: null,
                            filterText: word,
                            sortText: 'b',
                            insertText: word,
                            kind: cssLanguageTypes_1.CompletionItemKind.Property
                        };
                        var addToDic = {
                            label: "Add '" + word + "' to user dictionary.",
                            documentation: "",
                            textEdit: null,
                            filterText: word,
                            sortText: 'c',
                            insertText: word,
                            kind: cssLanguageTypes_1.CompletionItemKind.Property,
                            command: { command: 'editor.action.triggerSuggest', title: '123' }
                        };
                        var noSuggestions = {
                            label: "No spelling suggestions for '" + word + "'.",
                            documentation: "",
                            textEdit: null,
                            insertText: word,
                            kind: cssLanguageTypes_1.CompletionItemKind.Keyword
                        };
                        if (suggestions.length < 1) {
                            result.items.push(noSuggestions);
                        }
                        else {
                            result.items = result.items.concat(suggestions.map(function (suggestion) {
                                return {
                                    label: suggestion,
                                    detail: "spelling suggestion",
                                    textEdit: cssLanguageTypes_1.TextEdit.replace(editRange, suggestion),
                                    filterText: word,
                                    sortText: 'a',
                                    insertText: suggestion,
                                    kind: cssLanguageTypes_1.CompletionItemKind.Text
                                };
                            }));
                        }
                        result.items.push(ignoreForSession, addToDic);
                        self.typo.working = false;
                        resolve(result);
                    });
                }
            });
        };
        ChoiceScriptCompletion.prototype.getCSSWideKeywordProposals = function (entry, existingNode, result) {
            for (var keywords in languageFacts.cssWideKeywords) {
                result.items.push({
                    label: keywords,
                    documentation: languageFacts.cssWideKeywords[keywords],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), keywords),
                    kind: cssLanguageTypes_1.CompletionItemKind.Keyword
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getLabelProposals = function (existingNode, sceneUri, result) {
            var _b, _c;
            var labels = [];
            var labelRef = existingNode;
            var sceneRef;
            if (sceneRef = labelRef.scene) {
                var targetScene = (_b = ChoiceScriptIndexer_1.ChoiceScriptIndexer.index.getProjectIndexForScene(sceneUri)) === null || _b === void 0 ? void 0 : _b.getSceneNodeByName(labelRef.scene.getText());
                if (targetScene) {
                    labels = (_c = this.getSymbolContext(targetScene)) === null || _c === void 0 ? void 0 : _c.findSymbolsAtOffset(0, nodes.ReferenceType.Label);
                }
            }
            else {
                labels = this.getSymbolContext().findSymbolsAtOffset(0, nodes.ReferenceType.Label);
            }
            labels = labels.filter(function (l) { return l.name.indexOf(existingNode.getText()) === 0; });
            for (var _d = 0, labels_1 = labels; _d < labels_1.length; _d++) {
                var l = labels_1[_d];
                var suggest = {
                    label: l.name,
                    documentation: l.value ? strings.getLimitedString(l.value) : l.value,
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), l.name),
                    kind: cssLanguageTypes_1.CompletionItemKind.Function,
                    sortText: SortTexts.Label
                };
                result.items.push(suggest);
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getSceneProposals = function (existingNode, sceneUri, result) {
            var _b;
            var scenes = (_b = ChoiceScriptIndexer_1.ChoiceScriptIndexer.index.getProjectIndexForScene(sceneUri)) === null || _b === void 0 ? void 0 : _b.getSceneList();
            if (!scenes) {
                return result;
            }
            scenes = scenes.filter(function (s) { return s.indexOf(existingNode.getText()) === 0; }); // TODO should we *not* suggest ourself?
            for (var _c = 0, scenes_1 = scenes; _c < scenes_1.length; _c++) {
                var s = scenes_1[_c];
                var suggest = {
                    label: s,
                    documentation: "",
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), s),
                    kind: cssLanguageTypes_1.CompletionItemKind.File,
                    sortText: SortTexts.Normal
                };
                result.items.push(suggest);
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getVariableProposals = function (existingNode, sceneUri, result) {
            var _b;
            var globalVars = [], vars = [];
            // Grab local definitions
            vars = this.getSymbolContext().findSymbolsAtOffset(0, nodes.ReferenceType.Variable);
            // Grab global definitions (if we can)
            var startupScene = (_b = ChoiceScriptIndexer_1.ChoiceScriptIndexer.index.getProjectIndexForScene(sceneUri)) === null || _b === void 0 ? void 0 : _b.getSceneNodeByName("startup");
            if (startupScene) {
                globalVars = this.getSymbolContext(startupScene).findSymbolsAtOffset(0, nodes.ReferenceType.Variable);
            }
            vars = vars.concat(globalVars);
            // TODO: include implicit_control_flow, choice_randomtest, choice_quicktest
            /*
                if (variable == "choice_subscribe_allowed") return true;
        if (variable == "choice_register_allowed") return isRegisterAllowed();
        if (variable == "choice_registered") return typeof window != "undefined" && !!window.registered;
        if (variable == "choice_is_web") return typeof window != "undefined" && !!window.isWeb;
        if (variable == "choice_is_steam") return typeof window != "undefined" && !!window.isSteamApp;
        if (variable == "choice_is_ios_app") return typeof window != "undefined" && !!window.isIosApp;
        if (variable == "choice_is_android_app") return typeof window != "undefined" && !!window.isAndroidApp;
        if (variable == "choice_is_omnibus_app") return typeof window != "undefined" && !!window.isOmnibusApp;
        if (variable == "choice_is_amazon_app") return typeof window != "undefined" && !!window.isAmazonApp;
        if (variable == "choice_is_advertising_supported") return typeof isAdvertisingSupported != "undefined" && !!isAdvertisingSupported();
        if (variable == "choice_is_trial") return !!(typeof isTrial != "undefined" && isTrial);
        if (variable == "choice_release_date") {
          if (typeof window != "undefined" && window.releaseDate) {
            return simpleDateTimeFormat(window.releaseDate);
          }
          return "release day";
        }
        if (variable == "choice_prerelease") return isPrerelease();
        if (variable == "choice_kindle") return typeof isKindle !== "undefined" && !!isKindle;
        if (variable == "choice_randomtest") return !!this.randomtest;
        if (variable == "choice_quicktest") return false; // quicktest will explore "false" paths
        if (variable == "choice_restore_purchases_allowed") return isRestorePurchasesSupported();
        if (variable == "choice_save_allowed") return areSaveSlotsSupported();
        if (variable == "choice_time_stamp") return Math.floor(new Date()/1000);
        if (variable == "choice_nightmode") return typeof isNightMode != "undefined" && isNightMode();*/
            // Remove any bad matches (and maybe limit the number? TODO)
            vars = vars.filter(function (v) { return v.name.indexOf(existingNode.getText()) === 0; });
            for (var _c = 0, vars_1 = vars; _c < vars_1.length; _c++) {
                var v = vars_1[_c];
                var suggest = {
                    label: v.name,
                    documentation: v.value ? strings.getLimitedString(v.value) : v.value,
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), v.name),
                    kind: cssLanguageTypes_1.CompletionItemKind.Variable,
                    sortText: SortTexts.Variable
                };
                result.items.push(suggest);
            }
            return result;
        };
        /*public getVariableProposalsForCSSVarFunction(result: CompletionList): CompletionList {
            let symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
            symbols = symbols.filter((symbol): boolean => {
                return strings.startsWith(symbol.name, '--');
            });
            for (const symbol of symbols) {
                const completionItem: CompletionItem = {
                    label: symbol.name,
                    documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
                    textEdit: TextEdit.replace(this.getCompletionRange(null), symbol.name),
                    kind: CompletionItemKind.Variable
                };
    
                if (typeof completionItem.documentation === 'string' && isColorString(completionItem.documentation)) {
                    completionItem.kind = CompletionItemKind.Color;
                }
    
                result.items.push(completionItem);
            }
            return result;
        }*/
        ChoiceScriptCompletion.prototype.getUnitProposals = function (entry, existingNode, result) {
            var currentWord = '0';
            if (this.currentWord.length > 0) {
                var numMatch = this.currentWord.match(/^-?\d[\.\d+]*/);
                if (numMatch) {
                    currentWord = numMatch[0];
                    result.isIncomplete = currentWord.length === this.currentWord.length;
                }
            }
            else if (this.currentWord.length === 0) {
                result.isIncomplete = true;
            }
            if (existingNode && existingNode.parent && existingNode.parent.type === nodes.NodeType.Term) {
                existingNode = existingNode.getParent(); // include the unary operator
            }
            if (entry.restrictions) {
                for (var _b = 0, _c = entry.restrictions; _b < _c.length; _b++) {
                    var restriction = _c[_b];
                    var units = languageFacts.units[restriction];
                    if (units) {
                        for (var _d = 0, units_1 = units; _d < units_1.length; _d++) {
                            var unit = units_1[_d];
                            var insertText = currentWord + unit;
                            result.items.push({
                                label: insertText,
                                textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                                kind: cssLanguageTypes_1.CompletionItemKind.Unit
                            });
                        }
                    }
                }
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getCompletionRange = function (existingNode) {
            if (existingNode && existingNode.offset <= this.offset && this.offset <= existingNode.end) {
                var end = existingNode.end !== -1 ? this.textDocument.positionAt(existingNode.end) : this.position;
                var start = this.textDocument.positionAt(existingNode.offset);
                if (start.line === end.line) {
                    return cssLanguageTypes_1.Range.create(start, end); // multi line edits are not allowed
                }
            }
            return this.defaultReplaceRange;
        };
        /*protected getColorProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
            for (let color in languageFacts.colors) {
                result.items.push({
                    label: color,
                    documentation: languageFacts.colors[color],
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                    kind: CompletionItemKind.Color
                });
            }
            for (const color in languageFacts.colorKeywords) {
                result.items.push({
                    label: color,
                    documentation: languageFacts.colorKeywords[color],
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                    kind: CompletionItemKind.Value
                });
            }
            let colorValues = new Set();
            this.scene.acceptVisitor(new ColorValueCollector(colorValues, this.offset));
            for (let color of colorValues.getEntries()) {
                result.items.push({
                    label: color,
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                    kind: CompletionItemKind.Color
                });
            }
            for (const p of languageFacts.colorFunctions) {
                let tabStop = 1;
                const replaceFunction = (_match: string, p1: string) => '${' + tabStop++ + ':' + p1 + '}';
                const insertText = p.func.replace(/\[?\$(\w+)\]?/g, replaceFunction);
                result.items.push({
                    label: p.func.substr(0, p.func.indexOf('(')),
                    detail: p.func,
                    documentation: p.desc,
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    insertTextFormat: SnippetFormat,
                    kind: CompletionItemKind.Function
                });
            }
            return result;
        }*/
        ChoiceScriptCompletion.prototype.getPositionProposals = function (entry, existingNode, result) {
            for (var position in languageFacts.positionKeywords) {
                result.items.push({
                    label: position,
                    documentation: languageFacts.positionKeywords[position],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), position),
                    kind: cssLanguageTypes_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getRepeatStyleProposals = function (entry, existingNode, result) {
            for (var repeat in languageFacts.repeatStyleKeywords) {
                result.items.push({
                    label: repeat,
                    documentation: languageFacts.repeatStyleKeywords[repeat],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), repeat),
                    kind: cssLanguageTypes_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getLineStyleProposals = function (entry, existingNode, result) {
            for (var lineStyle in languageFacts.lineStyleKeywords) {
                result.items.push({
                    label: lineStyle,
                    documentation: languageFacts.lineStyleKeywords[lineStyle],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), lineStyle),
                    kind: cssLanguageTypes_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getLineWidthProposals = function (entry, existingNode, result) {
            for (var _b = 0, _c = languageFacts.lineWidthKeywords; _b < _c.length; _b++) {
                var lineWidth = _c[_b];
                result.items.push({
                    label: lineWidth,
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), lineWidth),
                    kind: cssLanguageTypes_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getGeometryBoxProposals = function (entry, existingNode, result) {
            for (var box in languageFacts.geometryBoxKeywords) {
                result.items.push({
                    label: box,
                    documentation: languageFacts.geometryBoxKeywords[box],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), box),
                    kind: cssLanguageTypes_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getBoxProposals = function (entry, existingNode, result) {
            for (var box in languageFacts.boxKeywords) {
                result.items.push({
                    label: box,
                    documentation: languageFacts.boxKeywords[box],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), box),
                    kind: cssLanguageTypes_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getImageProposals = function (entry, existingNode, result) {
            for (var image in languageFacts.imageFunctions) {
                var insertText = moveCursorInsideParenthesis(image);
                result.items.push({
                    label: image,
                    documentation: languageFacts.imageFunctions[image],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: cssLanguageTypes_1.CompletionItemKind.Function,
                    insertTextFormat: image !== insertText ? SnippetFormat : void 0
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getTimingFunctionProposals = function (entry, existingNode, result) {
            for (var timing in languageFacts.transitionTimingFunctions) {
                var insertText = moveCursorInsideParenthesis(timing);
                result.items.push({
                    label: timing,
                    documentation: languageFacts.transitionTimingFunctions[timing],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: cssLanguageTypes_1.CompletionItemKind.Function,
                    insertTextFormat: timing !== insertText ? SnippetFormat : void 0
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getBasicShapeProposals = function (entry, existingNode, result) {
            for (var shape in languageFacts.basicShapeFunctions) {
                var insertText = moveCursorInsideParenthesis(shape);
                result.items.push({
                    label: shape,
                    documentation: languageFacts.basicShapeFunctions[shape],
                    textEdit: cssLanguageTypes_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: cssLanguageTypes_1.CompletionItemKind.Function,
                    insertTextFormat: shape !== insertText ? SnippetFormat : void 0
                });
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getCompletionsForVariableDeclaration = function (declaration, sceneUri, result) {
            if (declaration.hasIssue(ChoiceScriptErrors_1.ParseError.VariableNameExpected)) {
                this.getVariableProposals(declaration.getExpr(), sceneUri, result);
            }
            return result;
        };
        ChoiceScriptCompletion.prototype.getCompletionForUriLiteralValue = function (uriLiteralNode, result) {
            var uriValue;
            var position;
            var range;
            // No children, empty value
            if (!uriLiteralNode.hasChildren()) {
                uriValue = '';
                position = this.position;
                var emptyURIValuePosition = this.textDocument.positionAt(uriLiteralNode.offset + 'url('.length);
                range = cssLanguageTypes_1.Range.create(emptyURIValuePosition, emptyURIValuePosition);
            }
            else {
                var uriValueNode = uriLiteralNode.getChild(0);
                uriValue = uriValueNode.getText();
                position = this.position;
                range = this.getCompletionRange(uriValueNode);
            }
            this.completionParticipants.forEach(function (participant) {
                if (participant.onCssURILiteralValue) {
                    participant.onCssURILiteralValue({
                        uriValue: uriValue,
                        position: position,
                        range: range
                    });
                }
            });
            return result;
        };
        ChoiceScriptCompletion.prototype.getCompletionForImportPath = function (importPathNode, result) {
            var _this = this;
            this.completionParticipants.forEach(function (participant) {
                if (participant.onCssImportPath) {
                    participant.onCssImportPath({
                        pathValue: importPathNode.getText(),
                        position: _this.position,
                        range: _this.getCompletionRange(importPathNode)
                    });
                }
            });
            return result;
        };
        ChoiceScriptCompletion.prototype.doesSupportMarkdown = function () {
            if (!objects_1.isDefined(this.supportsMarkdown)) {
                if (!objects_1.isDefined(this.clientCapabilities)) {
                    this.supportsMarkdown = true;
                    return this.supportsMarkdown;
                }
                var completion = this.clientCapabilities.textDocument && this.clientCapabilities.textDocument.completion;
                this.supportsMarkdown = completion && completion.completionItem && Array.isArray(completion.completionItem.documentationFormat) && completion.completionItem.documentationFormat.indexOf(cssLanguageTypes_1.MarkupKind.Markdown) !== -1;
            }
            return this.supportsMarkdown;
        };
        return ChoiceScriptCompletion;
    }());
    exports.ChoiceScriptCompletion = ChoiceScriptCompletion;
    /**
     * Rank number should all be same length strings
     */
    function computeRankNumber(n) {
        var nstr = n.toString();
        switch (nstr.length) {
            case 4:
                return nstr;
            case 3:
                return '0' + nstr;
            case 2:
                return '00' + nstr;
            case 1:
                return '000' + nstr;
            default:
                return '0000';
        }
    }
    var Set = /** @class */ (function () {
        function Set() {
            this.entries = {};
        }
        Set.prototype.add = function (entry) {
            this.entries[entry] = true;
        };
        Set.prototype.getEntries = function () {
            return Object.keys(this.entries);
        };
        return Set;
    }());
    function moveCursorInsideParenthesis(text) {
        return text.replace(/\(\)$/, "($1)");
    }
    /*class ColorValueCollector implements nodes.IVisitor {
    
        constructor(public entries: Set, private currentOffset: number) {
            // nothing to do
        }
    
        public visitNode(node: nodes.Node): boolean {
            if (node instanceof nodes.HexColorValue || (node instanceof nodes.Function && languageFacts.isColorConstructor(<nodes.Function>node))) {
                if (this.currentOffset < node.offset || node.end < this.currentOffset) {
                    this.entries.add(node.getText());
                }
            }
            return true;
        }
    }*/
    function getCurrentWord(document, offset) {
        var i = offset - 1;
        var text = document.getText();
        while (i >= 0 && ' \t\n\r":{[()]},*>+'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, offset);
    }
});
