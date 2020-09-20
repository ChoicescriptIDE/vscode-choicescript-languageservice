/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as languageFacts from '../languageFacts/choicescriptFacts';
import { Rules, LintConfigurationSettings, Rule, Settings } from './ChoiceScriptLintRules';
import * as nodes from '../parser/ChoiceScriptNodes';
import calculateBoxModel, { Element } from './ChoiceScriptLintUtil';
import { union } from '../utils/arrays';
import { reservedWords, allCommands, CommandType } from '../data/commands';

import * as nls from 'vscode-nls';
import { TextDocument } from '../cssLanguageTypes';
import { Node, NodeType, Variable } from '../parser/cssNodes';
import { ParseError } from '../parser/ChoiceScriptErrors';
import { ChoiceScriptProjectIndex, ChoiceScriptIndexer } from '../parser/ChoiceScriptIndexer';
import { boxKeywords } from './languageFacts';

const localize = nls.loadMessageBundle();

class NodesByRootMap {
	public data: { [name: string]: { nodes: nodes.Node[]; names: string[] } } = {};

	public add(root: string, name: string, node?: nodes.Node | null): void {
		let entry = this.data[root];
		if (!entry) {
			entry = { nodes: [], names: [] };
			this.data[root] = entry;
		}
		entry.names.push(name);
		if (node) {
			entry.nodes.push(node);
		}
	}
}

export class LintVisitor implements nodes.IVisitor {

	static entries(node: nodes.Node, document: TextDocument, settings: LintConfigurationSettings, entryFilter?: number): nodes.IMarker[] {
		const visitor = new LintVisitor(document, settings);
		node.acceptVisitor(visitor);
		visitor.completeValidations();
		return visitor.getEntries(entryFilter);
	}

	static prefixes = [
		'-ms-', '-moz-', '-o-', '-webkit-', // Quite common
		//		'-xv-', '-atsc-', '-wap-', '-khtml-', 'mso-', 'prince-', '-ah-', '-hp-', '-ro-', '-rim-', '-tc-' // Quite un-common
	];

	private warnings: nodes.IMarker[] = [];
	private settings: LintConfigurationSettings;
	private keyframes: NodesByRootMap;
	private document: TextDocument;
	private documentText: string;

	private validProperties: { [name: string]: boolean };

	private constructor(scene: TextDocument, settings: LintConfigurationSettings) {
		this.settings = settings;
		this.documentText = scene.getText();
		this.document = scene;
		this.keyframes = new NodesByRootMap();
		this.validProperties = {};

		const properties = settings.getSetting(Settings.ValidProperties);
		if (Array.isArray(properties)) {
			properties.forEach((p) => {
				if (typeof p === 'string') {
					const name = p.trim().toLowerCase();
					if (name.length) {
						this.validProperties[name] = true;
					}
				}
			});
		}
	}

	private isValidPropertyDeclaration(element: Element): boolean {
		const propertyName = element.fullPropertyName;
		return this.validProperties[propertyName];
	}

	private fetch(input: Element[], s: string): Element[] {
		const elements: Element[] = [];

		for (const curr of input) {
			if (curr.fullPropertyName === s) {
				elements.push(curr);
			}
		}

		return elements;
	}

	private findValueInExpression(expression: nodes.Expression, v: string): boolean {
		let found = false;
		expression.accept(node => {
			if (node.type === nodes.NodeType.Identifier && node.matches(v)) {
				found = true;
			}
			return !found;
		});
		return found;
	}


	public getEntries(filter: number = (nodes.Level.Warning | nodes.Level.Error)): nodes.IMarker[] {
		return this.warnings.filter(entry => {
			return (entry.getLevel() & filter) !== 0;
		});
	}

	private addEntry(node: nodes.Node, rule: Rule, details?: string): void {
		const entry = new nodes.Marker(node, rule, this.settings.getRule(rule), details);
		this.warnings.push(entry);
	}

	public visitNode(node: nodes.Node): boolean {
		switch (node.type) {
			case nodes.NodeType.Scene:
				return this.visitScene(<nodes.Scene>node);
			case nodes.NodeType.VariableDeclaration:
				return this.visitVariableDeclaration(<nodes.VariableDeclaration>node);
			case nodes.NodeType.StandardCommand:
			case nodes.NodeType.FlowCommand:
			case nodes.NodeType.Command:
				return this.visitCommand(<nodes.Command>node);
			case nodes.NodeType.Operator:
				return this.visitOperator(node);
		}
		return true;
	}

	private completeValidations() {
		//this.validateKeyframes();
	}

	private visitScene(sceneNode: nodes.Scene) {
		this.lintInitialCommands(sceneNode);
		if (sceneNode.isStartup()) {
			this.lintUniqueCommands(sceneNode);
		}
		if (sceneNode.isStats()) {
			this.lintChoiceScriptStats(sceneNode);
		}
		return true;
	}

	private visitVariableDeclaration(node: nodes.VariableDeclaration): boolean {
		let varName = node.getVariable()?.getName();
		if (!varName) {
			return true;
		} else if (/^choice_/.test(varName)) {
			this.addEntry(node, Rules.ReservedVariablePrefix);
		} else if (reservedWords.indexOf(varName) >= 0) {
			this.addEntry(node, Rules.ReservedWord);
		}
		return true;
	}

	private visitCommand(node: nodes.Command) {
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
			let setCmd = <nodes.SetCommand>node;
			let variable = setCmd.getVariable();
			let expression = setCmd.getExpr();
			if (variable && expression) {
				let projectIndex = ChoiceScriptIndexer.index.getProjectIndexForScene(this.document.uri);
				if (projectIndex) {
					let startupSymbols = projectIndex.getSceneSymbolsByName("startup");
					let symbol = startupSymbols?.findSymbol(variable.getText(), nodes.ReferenceType.Variable, 0);
					if (symbol) {
						let varDec = <nodes.VariableDeclaration>symbol.node;
						if (varDec.getVariable()?.const) {
							this.addEntry(node, Rules.ConstError);
						}
						if (expression?.csType !== varDec.getExpr()?.csType) {
							// TODO guard with lint config
							this.addEntry(node, Rules.TypeError);
						}
					}
				}
			}
		}
		return true;
	}

	private visitOperator(node: nodes.Node) {
		if (node.getText() === '%') {
			this.addEntry(node, Rules.DeprecatedOperatorPercent);
		}
		return false;
	}

	private lintInitialCommands(sceneNode: nodes.Scene): void {
		let allowInitialCommands = sceneNode.isStartup() ? true : false;
		for (let line of sceneNode.getChildren()) {
			if (line.type !== nodes.NodeType.Line) {
				continue;
			} else {
				let lineTN = <nodes.Line>line;
				if (lineTN.getLineType() !== nodes.LineType.ChoiceScript) {
					continue;
				}
				// parse error
			}
			let lineChild: nodes.Node | null;
			let childIdx = 0;
			while (lineChild = line.getChild(childIdx++)) {
				if (lineChild instanceof nodes.Command) {
					break;
				}
			}
			if (!(lineChild instanceof nodes.Command)) {
				continue;
			} else if (lineChild && lineChild.hasIssue(ParseError.UnknownCommand)) {
				continue;
			} else if (lineChild && lineChild.name === "comment") {
				continue;
			}
			let command = allCommands[lineChild.name];
			if (command.type === CommandType.Initial && !allowInitialCommands) {
				this.addEntry(lineChild, Rules.InvalidInitialCommand);
			} else if (command.type !== CommandType.Initial) {
				allowInitialCommands = false;
			}
		}
	}

	private lintChoiceScriptStats(sceneNode: nodes.Scene): void {
		for (let line of sceneNode.getChildren()) {
			if (line.type !== nodes.NodeType.Line) {
				continue;
			} else {
				let lineTN = <nodes.Line>line;
				if (lineTN.getLineType() !== nodes.LineType.ChoiceScript) {
					continue;
				}
				// parse error
			}
			let lineChild: nodes.Node | null;
			let childIdx = 0;
			while (lineChild = line.getChild(childIdx++)) {
				if (lineChild instanceof nodes.Command) {
					break;
				}
			}
			if (!(lineChild instanceof nodes.Command)) {
				continue;
			}
			let commandNode = <nodes.Command>lineChild;
			switch(commandNode.name) {
				case 'finish':
				case 'goto_scene':
				case 'ending':
					this.addEntry(commandNode, Rules.UnusualStatsCommand);
				default:
					break;
			}
		}
	}

	private lintUniqueCommands(sceneNode: nodes.Scene): void {
		let uniqueCommands: { [key: string]: boolean; } = {
			"author": false, "scene_list": false, "title": false,
		};
		for (let line of sceneNode.getChildren()) {
			if (line.type !== nodes.NodeType.Line) {
				continue;
			} else {
				let lineTN = <nodes.Line>line;
				if (lineTN.getLineType() !== nodes.LineType.ChoiceScript) {
					continue;
				}
				// parse error
			}
			let lineChild: nodes.Node | null;
			let childIdx = 0;
			while (lineChild = line.getChild(childIdx++)) {
				if (lineChild instanceof nodes.Command) {
					break;
				}
			}
			if (!(lineChild instanceof nodes.Command)) {
				continue;
			}
			let commandNode = <nodes.Command>lineChild;
			if (typeof uniqueCommands[commandNode.name] === "boolean") {
				if (!uniqueCommands[commandNode.name]) {
					uniqueCommands[commandNode.name] = true;
					continue;
				}
				this.addEntry(commandNode, Rules.DuplicateUniqueCommand);
			}
		}
	}
}
