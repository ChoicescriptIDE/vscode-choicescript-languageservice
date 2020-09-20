/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Color, ColorInformation, ColorPresentation, DocumentHighlight, DocumentHighlightKind, DocumentLink, Location, Position, Range, SymbolInformation, SymbolKind, TextDocument, TextEdit, WorkspaceEdit } from 'vscode-languageserver-types';
import * as nls from 'vscode-nls';
import { DocumentContext } from '../cssLanguageTypes';
import * as nodes from '../parser/ChoiceScriptNodes';
import { Symbols } from '../parser/ChoiceScriptSymbolScope';
import { ChoiceScriptIndexer } from '../parser/ChoiceScriptIndexer';
import { hslFromColor } from '../services/languageFacts';
import { endsWith, startsWith } from '../utils/strings';

const localize = nls.loadMessageBundle();

export class ChoiceScriptNavigation {

	public findSceneDefinition(document: TextDocument, scene: nodes.Node): Location | null {
		let projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
		let targetSceneDoc = projectIndex?.getSceneDocByName(scene.getText());
		if (targetSceneDoc) {
			return {
				uri: targetSceneDoc.uri,
				range: Range.create(Position.create(0,0), Position.create(0,0))
			};
		}
		return null;
	}

	public findSceneLabelDefinition(document: TextDocument, label: nodes.Node): Location | null {
		let labelRef: nodes.LabelRef = <nodes.LabelRef>label.parent!;
		let scene = labelRef.scene;
		if (scene) {
			if (scene.hasChildren() && scene.getChildren()[0].type === nodes.NodeType.Scene) {
				let sceneName = scene.getChildren()[0].getText();
				let projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
				let targetSceneNode = projectIndex?.getSceneNodeByName(sceneName);
				let targetSceneDoc = projectIndex?.getSceneDocByName(sceneName);
				if (!targetSceneNode || !targetSceneNode) {
					return null;
				}
				let symbol = new Symbols(targetSceneNode).findSymbol(label.getText(), nodes.ReferenceType.Label, 0);
				if (symbol) {
					return {
						uri: targetSceneDoc!.uri,
						range: getRange(symbol.node, targetSceneDoc!)
					};
				}
			}
		}
		return null;
	}

	public findDefinitionGlobal(localDocument: TextDocument, position: Position, localScene: nodes.Node): Location | null {

		// Once we're sure it's not a file-local *temp
		// we can search startup for a *create
		function checkStartup(node: nodes.Node) {
			let projectIndex = ChoiceScriptIndexer.index.sync(localDocument.uri);
			let startupSceneDoc = projectIndex?.getSceneDocByName("startup");
			let startupSceneNode = projectIndex?.getSceneNodeByName("startup");
			if (startupSceneDoc && startupSceneNode) {
				let startupSymbols = new Symbols(startupSceneNode);
				let symbol = startupSymbols.findSymbol(node.getText(), nodes.ReferenceType.Variable, 0);
				if (symbol) {
					return {
						uri: startupSceneDoc.uri,
						range: getRange(symbol.node, startupSceneDoc)
					};
				}
			}
			return null;
		}

		let symbols = new Symbols(localScene);
		let offset = localDocument.offsetAt(position);
		let node = nodes.getNodeAtOffset(localScene, offset);

		if (node) {
			if (node.type === nodes.NodeType.Scene) {
				return this.findSceneDefinition(localDocument, node);
			}
			if (node.type === nodes.NodeType.Label) {
				if (node.parent?.type === nodes.NodeType.LabelRef) {
					let sceneLabelDef = this.findSceneLabelDefinition(localDocument, node);
					if (sceneLabelDef) {
						return sceneLabelDef;
					}
				}
			}
			// labels and local (temp) vars:
			let symbol = symbols.findSymbolFromNode(node);
			if (!symbol) {
				return checkStartup(node);
			}
			return {
				uri: localDocument.uri,
				range: getRange(symbol.node, localDocument)
			};
		}
		return null;
	}

	public findDefinition(document: TextDocument, position: Position, scene: nodes.Node): Location | null {

		let symbols = new Symbols(scene);
		let offset = document.offsetAt(position);
		let node = nodes.getNodeAtOffset(scene, offset);

		if (!node) {
			return null;
		}

		let symbol = symbols.findSymbolFromNode(node);
		if (!symbol) {
			return null;
		}

		return {
			uri: document.uri,
			range: getRange(symbol.node, document)
		};
	}

	public findReferences(document: TextDocument, position: Position, localScene: nodes.Scene): Location[] {
		let result: Location[] = [];
		let projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
		if (!projectIndex) {
			return result;
		}

		let offset = document.offsetAt(position);
		let node = nodes.getNodeAtOffset(localScene, offset);
		if (!node || node.type === nodes.NodeType.Scene || node.type === nodes.NodeType.VariableDeclaration) {
			return result;
		}

		let symbols = new Symbols(localScene);
		let symbol = symbols.findSymbolFromNode(node);
		if (!symbol) {
			return result;
		}

		if (projectIndex) { // not necessary if we return above
			let visitor = (doc: TextDocument, sceneSymbols: Symbols) => {
				return (candidate: nodes.Node) => {
					if (sceneSymbols.matchesSymbol(candidate, symbol!)) {
						if (candidate.parent?.type === nodes.NodeType.VariableDeclaration) {
							return false;
						}
						result.push({
							uri: doc.uri, // TODO
							range: getRange(candidate, doc)
						});
						return false;
					}
					return true;
				};
			};
			
			for (let sceneName of projectIndex.getSceneList()) {
				let sceneNode = projectIndex.getSceneNodeByName(sceneName);
				let sceneDoc = projectIndex.getSceneDocByName(sceneName);
				if (!sceneDoc || !sceneNode) {
					continue; // error?
				}
				let sceneSymbols = new Symbols(sceneNode);
				sceneNode.accept(visitor(sceneDoc, sceneSymbols));
			}
		}
		return result;
	}

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

	public findDocumentSymbols(document: TextDocument, scene: nodes.Scene, includeGlobals: boolean = false): SymbolInformation[] {

		let result: SymbolInformation[] = [];

		let visitor = (doc: TextDocument) => {
			return (node: nodes.Node) => {

				let entry: SymbolInformation = {
					name: null!,
					kind: SymbolKind.Object,
					location: null!
				};
				let locationNode = node;
				if (node instanceof nodes.VariableDeclaration) {
					entry.name = (<nodes.VariableDeclaration>node).getName();
					entry.kind = SymbolKind.Variable;
				} else if (node instanceof nodes.LabelDeclaration) {
					entry.name = (<nodes.LabelDeclaration>node).getLabel().name;
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
			let projectIndex = ChoiceScriptIndexer.index.sync(document.uri);
			let startup = projectIndex?.getSceneNodeByName("startup");
			let startupDoc = projectIndex?.getSceneDocByName("startup");
			if (startup && startupDoc) {
				startup.accept(visitor(startupDoc));
			}
		}
		scene.accept(visitor(document));

		return result;
	}

/*
	public doRename(document: TextDocument, position: Position, newName: string, scene: nodes.Scene): WorkspaceEdit {
		let highlights = this.findDocumentHighlights(document, position, scene);
		let edits = highlights.map(h => TextEdit.replace(h.range, newName));
		return {
			changes: { [document.uri]: edits }
		};
	}
*/
}

function getRange(node: nodes.Node, document: TextDocument): Range {
	return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
}

/*
function getHighlightKind(node: nodes.Node): DocumentHighlightKind {

	if (node.type === nodes.NodeType.Selector) {
		return DocumentHighlightKind.Write;
	}

	if (node instanceof nodes.Identifier) {
		if (node.parent && node.parent instanceof nodes.Property) {
			if (node.isCustomProperty) {
				return DocumentHighlightKind.Write;
			}
		}
	}

	if (node.parent) {
		switch (node.parent.type) {
			case nodes.NodeType.FunctionDeclaration:
			case nodes.NodeType.Keyframe:
			case nodes.NodeType.VariableDeclaration:
			case nodes.NodeType.FunctionParameter:
				return DocumentHighlightKind.Write;
		}
	}

	return DocumentHighlightKind.Read;
}*/