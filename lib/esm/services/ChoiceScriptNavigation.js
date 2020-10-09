/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Location, Position, Range, SymbolKind } from 'vscode-languageserver-types';
import * as nls from 'vscode-nls';
import * as nodes from '../parser/ChoiceScriptNodes';
import { Symbols } from '../parser/ChoiceScriptSymbolScope';
import { ChoiceScriptIndexer } from '../parser/ChoiceScriptIndexer';
var localize = nls.loadMessageBundle();
var ChoiceScriptNavigation = /** @class */ (function () {
    function ChoiceScriptNavigation() {
    }
    ChoiceScriptNavigation.prototype.findSceneDefinition = function (document, scene) {
        var projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
        var targetSceneDoc = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneDocByName(scene.getText());
        if (targetSceneDoc) {
            return {
                uri: targetSceneDoc.uri,
                range: Range.create(Position.create(0, 0), Position.create(0, 0))
            };
        }
        return null;
    };
    ChoiceScriptNavigation.prototype.findSceneLabelDefinition = function (document, label) {
        var labelRef = label.parent;
        var scene = labelRef.scene;
        if (scene) {
            if (scene.hasChildren() && scene.getChildren()[0].type === nodes.NodeType.Scene) {
                var sceneName = scene.getChildren()[0].getText();
                var projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
                var targetSceneNode = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneNodeByName(sceneName);
                var targetSceneDoc = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneDocByName(sceneName);
                if (!targetSceneNode || !targetSceneNode) {
                    return null;
                }
                var symbol = new Symbols(targetSceneNode).findSymbol(label.getText(), nodes.ReferenceType.Label, 0);
                if (symbol) {
                    return {
                        uri: targetSceneDoc.uri,
                        range: getRange(symbol.node, targetSceneDoc)
                    };
                }
            }
        }
        return null;
    };
    ChoiceScriptNavigation.prototype.findDefinitionGlobal = function (localDocument, position, localScene) {
        var _a;
        // Once we're sure it's not a file-local *temp
        // we can search startup for a *create
        function checkStartup(node) {
            var projectIndex = ChoiceScriptIndexer.index.sync(localDocument.uri);
            var startupSceneDoc = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneDocByName("startup");
            var startupSceneNode = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneNodeByName("startup");
            if (startupSceneDoc && startupSceneNode) {
                var startupSymbols = new Symbols(startupSceneNode);
                var symbol = startupSymbols.findSymbol(node.getText(), nodes.ReferenceType.Variable, 0);
                if (symbol) {
                    return {
                        uri: startupSceneDoc.uri,
                        range: getRange(symbol.node, startupSceneDoc)
                    };
                }
            }
            return null;
        }
        var symbols = new Symbols(localScene);
        var offset = localDocument.offsetAt(position);
        var node = nodes.getNodeAtOffset(localScene, offset);
        if (node) {
            if (node.type === nodes.NodeType.Scene) {
                return this.findSceneDefinition(localDocument, node);
            }
            if (node.type === nodes.NodeType.Label) {
                if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === nodes.NodeType.LabelRef) {
                    var sceneLabelDef = this.findSceneLabelDefinition(localDocument, node);
                    if (sceneLabelDef) {
                        return sceneLabelDef;
                    }
                }
            }
            // labels and local (temp) vars:
            var symbol = symbols.findSymbolFromNode(node);
            if (!symbol) {
                return checkStartup(node);
            }
            return {
                uri: localDocument.uri,
                range: getRange(symbol.node, localDocument)
            };
        }
        return null;
    };
    ChoiceScriptNavigation.prototype.findDefinition = function (document, position, scene) {
        var symbols = new Symbols(scene);
        var offset = document.offsetAt(position);
        var node = nodes.getNodeAtOffset(scene, offset);
        if (!node) {
            return null;
        }
        var symbol = symbols.findSymbolFromNode(node);
        if (!symbol) {
            return null;
        }
        return {
            uri: document.uri,
            range: getRange(symbol.node, document)
        };
    };
    ChoiceScriptNavigation.prototype.findReferences = function (document, position, localScene) {
        var result = [];
        var projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
        if (!projectIndex) {
            return result;
        }
        var offset = document.offsetAt(position);
        var node = nodes.getNodeAtOffset(localScene, offset);
        if (!node || node.type === nodes.NodeType.Scene || node.type === nodes.NodeType.VariableDeclaration) {
            return result;
        }
        var symbols = new Symbols(localScene);
        var symbol = symbols.findSymbolFromNode(node);
        if (!symbol) {
            return result;
        }
        if (projectIndex) { // not necessary if we return above
            var visitor = function (doc, sceneSymbols) {
                return function (candidate) {
                    var _a;
                    if (sceneSymbols.matchesSymbol(candidate, symbol)) {
                        if (((_a = candidate.parent) === null || _a === void 0 ? void 0 : _a.type) === nodes.NodeType.VariableDeclaration) {
                            return false;
                        }
                        result.push({
                            uri: doc.uri,
                            range: getRange(candidate, doc)
                        });
                        return false;
                    }
                    return true;
                };
            };
            for (var _i = 0, _a = projectIndex.getSceneList(); _i < _a.length; _i++) {
                var sceneName = _a[_i];
                var sceneNode = projectIndex.getSceneNodeByName(sceneName);
                var sceneDoc = projectIndex.getSceneDocByName(sceneName);
                if (!sceneDoc || !sceneNode) {
                    continue; // error?
                }
                var sceneSymbols = new Symbols(sceneNode);
                sceneNode.accept(visitor(sceneDoc, sceneSymbols));
            }
        }
        return result;
    };
    /*
        public findReferences(document: TextDocument, position: Position, scene: nodes.Scene): Location[] {
            let highlights = this.findDocumentHighlights(document, position, scene);
            return highlights.map(h => {
                return {
                    uri: document.uri,
                    range: h.range
                };
            });
        }
    */
    /*
    public findDocumentHighlights(document: TextDocument, position: Position, scene: nodes.Scene): DocumentHighlight[] {
        let result: DocumentHighlight[] = [];

        let offset = document.offsetAt(position);
        let node = nodes.getNodeAtOffset(scene, offset);
        if (!node || node.type === nodes.NodeType.Scene || node.type === nodes.NodeType.VariableDeclaration) {
            return result;
        }
        if (node.type === nodes.NodeType.Identifier && node.parent && node.parent.type === nodes.NodeType.ClassSelector) {
            node = node.parent;
        }

        let symbols = new Symbols(scene);
        let symbol = symbols.findSymbolFromNode(node);
        let name = node.getText();

        scene.accept(candidate => {
            if (symbol) {
                if (symbols.matchesSymbol(candidate, symbol)) {
                    result.push({
                        kind: getHighlightKind(candidate),
                        range: getRange(candidate, document)
                    });
                    return false;
                }
            } else if (node.type === candidate.type && node.length === candidate.length && name === candidate.getText()) {
                // Same node type and data
                result.push({
                    kind: getHighlightKind(candidate),
                    range: getRange(candidate, document)
                });
            }
            return true;
        });

        return result;
    }*/
    ChoiceScriptNavigation.prototype.findDocumentSymbols = function (document, scene, includeGlobals) {
        if (includeGlobals === void 0) { includeGlobals = false; }
        var result = [];
        var visitor = function (doc) {
            return function (node) {
                var entry = {
                    name: null,
                    kind: SymbolKind.Object,
                    location: null
                };
                var locationNode = node;
                if (node instanceof nodes.VariableDeclaration) {
                    entry.name = node.getName();
                    entry.kind = SymbolKind.Variable;
                }
                else if (node instanceof nodes.LabelDeclaration) {
                    entry.name = node.getLabel().name;
                    entry.kind = SymbolKind.Function;
                }
                if (entry.name) {
                    entry.location = Location.create(doc.uri, getRange(locationNode, doc));
                    result.push(entry);
                }
                return true;
            };
        };
        if (includeGlobals) {
            var projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
            var startup = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneNodeByName("startup");
            var startupDoc = projectIndex === null || projectIndex === void 0 ? void 0 : projectIndex.getSceneDocByName("startup");
            if (startup && startupDoc) {
                startup.accept(visitor(startupDoc));
            }
        }
        scene.accept(visitor(document));
        return result;
    };
    return ChoiceScriptNavigation;
}());
export { ChoiceScriptNavigation };
function getRange(node, document) {
    return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
}
