/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Rules, Settings } from './ChoiceScriptLintRules';
import * as nodes from '../parser/ChoiceScriptNodes';
import { reservedWords, allCommands, CommandType } from '../data/commands';
import * as nls from 'vscode-nls';
import { ParseError } from '../parser/ChoiceScriptErrors';
import { ChoiceScriptIndexer } from '../parser/ChoiceScriptIndexer';
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
var LintVisitor = /** @class */ (function () {
    function LintVisitor(scene, settings) {
        var _this = this;
        this.warnings = [];
        this.settings = settings;
        this.documentText = scene.getText();
        this.document = scene;
        this.keyframes = new NodesByRootMap();
        this.validProperties = {};
        var properties = settings.getSetting(Settings.ValidProperties);
        if (Array.isArray(properties)) {
            properties.forEach(function (p) {
                if (typeof p === 'string') {
                    var name = p.trim().toLowerCase();
                    if (name.length) {
                        _this.validProperties[name] = true;
                    }
                }
            });
        }
    }
    LintVisitor.entries = function (node, document, settings, entryFilter) {
        var visitor = new LintVisitor(document, settings);
        node.acceptVisitor(visitor);
        visitor.completeValidations();
        return visitor.getEntries(entryFilter);
    };
    LintVisitor.prototype.isValidPropertyDeclaration = function (element) {
        var propertyName = element.fullPropertyName;
        return this.validProperties[propertyName];
    };
    LintVisitor.prototype.fetch = function (input, s) {
        var elements = [];
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var curr = input_1[_i];
            if (curr.fullPropertyName === s) {
                elements.push(curr);
            }
        }
        return elements;
    };
    LintVisitor.prototype.findValueInExpression = function (expression, v) {
        var found = false;
        expression.accept(function (node) {
            if (node.type === nodes.NodeType.Identifier && node.matches(v)) {
                found = true;
            }
            return !found;
        });
        return found;
    };
    LintVisitor.prototype.getEntries = function (filter) {
        if (filter === void 0) { filter = (nodes.Level.Warning | nodes.Level.Error); }
        return this.warnings.filter(function (entry) {
            return (entry.getLevel() & filter) !== 0;
        });
    };
    LintVisitor.prototype.addEntry = function (node, rule, details) {
        var entry = new nodes.Marker(node, rule, this.settings.getRule(rule), details);
        this.warnings.push(entry);
    };
    LintVisitor.prototype.visitNode = function (node) {
        switch (node.type) {
            case nodes.NodeType.Scene:
                return this.visitScene(node);
            case nodes.NodeType.VariableDeclaration:
                return this.visitVariableDeclaration(node);
            case nodes.NodeType.StandardCommand:
            case nodes.NodeType.FlowCommand:
            case nodes.NodeType.Command:
                return this.visitCommand(node);
            case nodes.NodeType.Operator:
                return this.visitOperator(node);
        }
        return true;
    };
    LintVisitor.prototype.completeValidations = function () {
        //this.validateKeyframes();
    };
    LintVisitor.prototype.visitScene = function (sceneNode) {
        this.lintInitialCommands(sceneNode);
        if (sceneNode.isStartup()) {
            this.lintUniqueCommands(sceneNode);
        }
        if (sceneNode.isStats()) {
            this.lintChoiceScriptStats(sceneNode);
        }
        return true;
    };
    LintVisitor.prototype.visitVariableDeclaration = function (node) {
        var _a;
        var varName = (_a = node.getVariable()) === null || _a === void 0 ? void 0 : _a.getName();
        if (!varName) {
            return true;
        }
        else if (/^choice_/.test(varName)) {
            this.addEntry(node, Rules.ReservedVariablePrefix);
        }
        else if (reservedWords.indexOf(varName) >= 0) {
            this.addEntry(node, Rules.ReservedWord);
        }
        return true;
    };
    LintVisitor.prototype.visitCommand = function (node) {
        var _a, _b;
        if (node.name === "script") {
            this.addEntry(node, Rules.ScriptCommandUnsupported);
        }
        if (allCommands[node.name] && allCommands[node.name].type === CommandType.Deprecated) {
            this.addEntry(node, Rules.DeprecatedCommand);
        }
        //let localSymbols = projectIndex.getSceneSymbolsByName(this.document.uri);
        //let symbol = symbols.findSymbol(node.getText(), nodes.ReferenceType.Variable, 0);
        //if (!symbol) {
        //}
        // globals only for now TODO locals
        //findDefinitionGlobal
        if (node instanceof nodes.RandCommand) {
            // lint on const and type
        }
        if (node instanceof nodes.SetCommand) {
            var setCmd = node;
            var variable = setCmd.getVariable();
            var expression = setCmd.getExpr();
            if (variable && expression) {
                var projectIndex = ChoiceScriptIndexer.index.getProjectIndexForScene(this.document.uri);
                if (projectIndex) {
                    var startupSymbols = projectIndex.getSceneSymbolsByName("startup");
                    var symbol = startupSymbols === null || startupSymbols === void 0 ? void 0 : startupSymbols.findSymbol(variable.getText(), nodes.ReferenceType.Variable, 0);
                    if (symbol) {
                        var varDec = symbol.node;
                        if ((_a = varDec.getVariable()) === null || _a === void 0 ? void 0 : _a.const) {
                            this.addEntry(node, Rules.ConstError);
                        }
                        if ((expression === null || expression === void 0 ? void 0 : expression.csType) !== ((_b = varDec.getExpr()) === null || _b === void 0 ? void 0 : _b.csType)) {
                            // TODO guard with lint config
                            this.addEntry(node, Rules.TypeError);
                        }
                    }
                }
            }
        }
        return true;
    };
    LintVisitor.prototype.visitOperator = function (node) {
        if (node.getText() === '%') {
            this.addEntry(node, Rules.DeprecatedOperatorPercent);
        }
        return false;
    };
    LintVisitor.prototype.lintInitialCommands = function (sceneNode) {
        var allowInitialCommands = sceneNode.isStartup() ? true : false;
        for (var _i = 0, _a = sceneNode.getChildren(); _i < _a.length; _i++) {
            var line = _a[_i];
            if (line.type !== nodes.NodeType.Line) {
                continue;
            }
            else {
                var lineTN = line;
                if (lineTN.getLineType() !== nodes.LineType.ChoiceScript) {
                    continue;
                }
                // parse error
            }
            var lineChild = void 0;
            var childIdx = 0;
            while (lineChild = line.getChild(childIdx++)) {
                if (lineChild instanceof nodes.Command) {
                    break;
                }
            }
            if (!(lineChild instanceof nodes.Command)) {
                continue;
            }
            else if (lineChild && lineChild.hasIssue(ParseError.UnknownCommand)) {
                continue;
            }
            else if (lineChild && lineChild.name === "comment") {
                continue;
            }
            var command = allCommands[lineChild.name];
            if (command.type === CommandType.Initial && !allowInitialCommands) {
                this.addEntry(lineChild, Rules.InvalidInitialCommand);
            }
            else if (command.type !== CommandType.Initial) {
                allowInitialCommands = false;
            }
        }
    };
    LintVisitor.prototype.lintChoiceScriptStats = function (sceneNode) {
        for (var _i = 0, _a = sceneNode.getChildren(); _i < _a.length; _i++) {
            var line = _a[_i];
            if (line.type !== nodes.NodeType.Line) {
                continue;
            }
            else {
                var lineTN = line;
                if (lineTN.getLineType() !== nodes.LineType.ChoiceScript) {
                    continue;
                }
                // parse error
            }
            var lineChild = void 0;
            var childIdx = 0;
            while (lineChild = line.getChild(childIdx++)) {
                if (lineChild instanceof nodes.Command) {
                    break;
                }
            }
            if (!(lineChild instanceof nodes.Command)) {
                continue;
            }
            var commandNode = lineChild;
            switch (commandNode.name) {
                case 'finish':
                case 'goto_scene':
                case 'ending':
                    this.addEntry(commandNode, Rules.UnusualStatsCommand);
                default:
                    break;
            }
        }
    };
    LintVisitor.prototype.lintUniqueCommands = function (sceneNode) {
        var uniqueCommands = {
            "author": false, "scene_list": false, "title": false,
        };
        for (var _i = 0, _a = sceneNode.getChildren(); _i < _a.length; _i++) {
            var line = _a[_i];
            if (line.type !== nodes.NodeType.Line) {
                continue;
            }
            else {
                var lineTN = line;
                if (lineTN.getLineType() !== nodes.LineType.ChoiceScript) {
                    continue;
                }
                // parse error
            }
            var lineChild = void 0;
            var childIdx = 0;
            while (lineChild = line.getChild(childIdx++)) {
                if (lineChild instanceof nodes.Command) {
                    break;
                }
            }
            if (!(lineChild instanceof nodes.Command)) {
                continue;
            }
            var commandNode = lineChild;
            if (typeof uniqueCommands[commandNode.name] === "boolean") {
                if (!uniqueCommands[commandNode.name]) {
                    uniqueCommands[commandNode.name] = true;
                    continue;
                }
                this.addEntry(commandNode, Rules.DuplicateUniqueCommand);
            }
        }
    };
    LintVisitor.prefixes = [
        '-ms-', '-moz-', '-o-', '-webkit-',
    ];
    return LintVisitor;
}());
export { LintVisitor };
