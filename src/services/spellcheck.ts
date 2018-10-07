/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as languageFacts from './languageFacts';
import { Rules, LintConfigurationSettings, Rule } from './textRules';
import * as nodes from '../parser/cssNodes';

import * as nls from 'vscode-nls';
import { TextDocument } from 'vscode-languageserver-types';
import { Typo } from './typo/typo';
const localize = nls.loadMessageBundle();

class Element {

	public name: string;
	public node: nodes.Declaration;

	constructor(text: string, data: nodes.Declaration) {
		this.name = text;
		this.node = data;
	}
}

class NodesByRootMap {
	public data: { [name: string]: { nodes: nodes.Node[]; names: string[] } } = {};

	public add(root: string, name: string, node: nodes.Node): void {
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

export class SpellCheckVisitor implements nodes.IVisitor {

	static entries(node: nodes.Node, document: TextDocument, settings: LintConfigurationSettings, entryFilter?: number, typo?: Typo): nodes.IMarker[] {
		let visitor = new SpellCheckVisitor(document, settings, typo);
		node.acceptVisitor(visitor);
		return visitor.getEntries(entryFilter);
	}

	static prefixes = [
		'-ms-', '-moz-', '-o-', '-webkit-', // Quite common
		//		'-xv-', '-atsc-', '-wap-', '-khtml-', 'mso-', 'prince-', '-ah-', '-hp-', '-ro-', '-rim-', '-tc-' // Quite un-common
	];

	private warnings: nodes.IMarker[] = [];
	private settings: LintConfigurationSettings;
	private keyframes: NodesByRootMap;
	private documentText: string;
	private typo: Typo;

	private constructor(document: TextDocument, settings: LintConfigurationSettings, typo?: Typo) {
		this.settings = settings;
		this.documentText = document.getText();
		this.keyframes = new NodesByRootMap();
		this.typo = typo;
	}

	private fetch(input: Element[], s: string): Element[] {
		let elements: Element[] = [];

		for (let curr of input) {
			if (curr.name === s) {
				elements.push(curr);
			}
		}

		return elements;
	}

	private fetchWithValue(input: Element[], s: string, v: string): Element[] {
		let elements: Element[] = [];
		for (let inputElement of input) {
			if (inputElement.name === s) {
				let expression = inputElement.node.getValue();
				if (expression && this.findValueInExpression(expression, v)) {
					elements.push(inputElement);
				}
			}
		}
		return elements;
	}

	private findValueInExpression(expression: nodes.Expression, v: string): boolean {
		let found = false;
		expression.accept(node => {
			if (node.type === nodes.NodeType.Identifier && node.getText() === v) {
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
		let entry = new nodes.Marker(node, rule, nodes.Level.Warning, details, node.offset, node.length);
		this.warnings.push(entry);
	}

	private getMissingNames(expected: string[], actual: string[]): string {
		expected = expected.slice(0); // clone
		for (let i = 0; i < actual.length; i++) {
			let k = expected.indexOf(actual[i]);
			if (k !== -1) {
				expected[k] = null;
			}
		}
		let result: string = null;
		for (let i = 0; i < expected.length; i++) {
			let curr = expected[i];
			if (curr) {
				if (result === null) {
					result = localize('namelist.single', "'{0}'", curr);
				} else {
					result = localize('namelist.concatenated', "{0}, '{1}'", result, curr);
				}
			}
		}
		return result;
	}

	public visitNode(node: nodes.Node): boolean {
		switch (node.type) {
			case nodes.NodeType.Stylesheet:
				return this.visitStylesheet(node);
			case nodes.NodeType.TextLine:
				return true;
			case nodes.NodeType.RealWord:
				return this.visitWord(node);
			default:
				return true;
		}
	}
	
	private visitStylesheet = function (node: nodes.Node) {
		return true;
	};
	private visitWord = function (node: nodes.RealWord) {
		if (!this.typo.check(node.getText())) {
			this.addEntry(node, Rules.BadSpelling, "Bad spelling: " + node.getText());
		}
		return true;
	};

	private visitKeyframe(node: nodes.Keyframe): boolean {
		let keyword = node.getKeyword();
		let text = keyword.getText();
		this.keyframes.add(node.getName(), text, (text !== '@keyframes') ? keyword : null);
		return true;
	}

	private isCSSDeclaration(node: nodes.Node): boolean {
		if (node instanceof nodes.Declaration) {
			if (!(<nodes.Declaration>node).getValue()) {
				return false;
			}
			let property = (<nodes.Declaration>node).getProperty();
			if (!property || property.getIdentifier().containsInterpolation()) {
				return false;
			}
			return true;
		}
		return false;
	}

}


