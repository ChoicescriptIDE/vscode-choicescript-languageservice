/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as languageFacts from './languageFacts';
import { Rules, LintConfigurationSettings, Rule } from './textRules';
import { TextDocument, Range, Diagnostic, DiagnosticSeverity, UserDictionary, SpellCheckDictionary, UserDictionaryEntry } from '../cssLanguageTypes';
import * as nodes from '../parser/ChoiceScriptNodes';

import * as nls from 'vscode-nls';
import { Typo } from './typo/typo';
const localize = nls.loadMessageBundle();

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

	static entries(node: nodes.Node, document: TextDocument, typo: any, userDics?: UserDictionary ): nodes.IMarker[] {
		let visitor = new SpellCheckVisitor(document, typo, userDics);
		node.acceptVisitor(visitor);
		return visitor.getEntries();
	}

	static prefixes = [
		'-ms-', '-moz-', '-o-', '-webkit-', // Quite common
		//		'-xv-', '-atsc-', '-wap-', '-khtml-', 'mso-', 'prince-', '-ah-', '-hp-', '-ro-', '-rim-', '-tc-' // Quite un-common
	];

	private misspellings: nodes.IMarker[] = [];
	private documentText: string;
	private typo: any;
	private userDics: UserDictionary = { "persistent": {}, "session": {}};

	private constructor(document: TextDocument, typo?: any, userDics?: UserDictionary) {
		this.documentText = document.getText();
		this.typo = typo;
		this.userDics = userDics || this.userDics;
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


	public getEntries(): nodes.IMarker[] {
		return this.misspellings;
	}

	private addEntry(node: nodes.Node, rule: Rule, details?: string): void {
		let entry = new nodes.Marker(node, rule, nodes.Level.Information, details, node.offset, node.length);
		this.misspellings.push(entry);
	}

	private getMissingNames(expected: string[], actual: string[]): string {
		expected = expected.slice(0); // clone
		for (let i = 0; i < actual.length; i++) {
			let k = expected.indexOf(actual[i]);
			if (k !== -1) {
				expected[k] = null!;
			}
		}
		let result: string = null!;
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

	public wordInUserDics(word: string): boolean {
		word = word.toLowerCase(); // spellings are case insensitive
		for (var dic in this.userDics) {
			if (this.userDics[dic][word]) {
				return true;
			}
		}
		return false;
	}

	public visitNode(node: nodes.Node): boolean {
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
	}
	
	private visitScene(node: nodes.Node) {
		return true;
	}

	private visitWord(node: nodes.Node): boolean {
		let word = node.getText();
		if (!this.typo.check(word)
			&& !this.wordInUserDics(word)) {
			this.addEntry(node, Rules.BadSpelling, "Bad spelling: " + node.getText());
		}
		return true;
	}

}

