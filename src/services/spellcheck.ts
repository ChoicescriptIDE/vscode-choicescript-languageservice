/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as languageFacts from './languageFacts';
import { Rules, LintConfigurationSettings, Rule } from './lintRules';
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
		let entry = new nodes.Marker(node, rule, nodes.Level.Error, details, node.offset, node.length);
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

	private completeValidations() {
		this.validateKeyframes();
	}

	private visitUnknownAtRule(node: nodes.UnknownAtRule): boolean {
		const atRuleName = node.getChild(0);
		if (!atRuleName) {
			return false;
		}

		this.addEntry(atRuleName, Rules.UnknownAtRules, `Unknown at rule ${atRuleName.getText()}`);
		return true;
    }
    
    private visitStylesheet = function (node: nodes.Node) {
        return true;
    };
    private visitWord = function (node: nodes.RealWord) {
        if (!this.typo.check(node.getText()))
           this.addEntry(node, Rules.UnknownAtRules, "Bad spelling: " + node.getText(), node.offset, node.length);
        return true;
    };

	private visitKeyframe(node: nodes.Keyframe): boolean {
		let keyword = node.getKeyword();
		let text = keyword.getText();
		this.keyframes.add(node.getName(), text, (text !== '@keyframes') ? keyword : null);
		return true;
	}

	private validateKeyframes(): boolean {
		// @keyframe and it's vendor specific alternatives
		// @keyframe should be included
		let expected = ['@-webkit-keyframes', '@-moz-keyframes', '@-o-keyframes'];

		for (let name in this.keyframes.data) {
			let actual = this.keyframes.data[name].names;
			let needsStandard = (actual.indexOf('@keyframes') === -1);
			if (!needsStandard && actual.length === 1) {
				continue; // only the non-vendor specific keyword is used, that's fine, no warning
			}

			let missingVendorSpecific = this.getMissingNames(expected, actual);
			if (missingVendorSpecific || needsStandard) {
				for (let node of this.keyframes.data[name].nodes) {
					if (needsStandard) {
						let message = localize('keyframes.standardrule.missing', "Always define standard rule '@keyframes' when defining keyframes.");
						this.addEntry(node, Rules.IncludeStandardPropertyWhenUsingVendorPrefix, message);
					}
					if (missingVendorSpecific) {
						let message = localize('keyframes.vendorspecific.missing', "Always include all vendor specific rules: Missing: {0}", missingVendorSpecific);
						this.addEntry(node, Rules.AllVendorPrefixes, message);
					}
				}
			}
		}

		return true;
	}

	private visitSimpleSelector(node: nodes.SimpleSelector): boolean {

		let firstChar = this.documentText.charAt(node.offset);

		/////////////////////////////////////////////////////////////
		//	Lint - The universal selector (*) is known to be slow.
		/////////////////////////////////////////////////////////////
		if (node.length === 1 && firstChar === '*') {
			this.addEntry(node, Rules.UniversalSelector);
		}

		/////////////////////////////////////////////////////////////
		//	Lint - Avoid id selectors
		/////////////////////////////////////////////////////////////
		if (firstChar === '#') {
			this.addEntry(node, Rules.AvoidIdSelector);
		}
		return true;
	}

	private visitImport(node: nodes.Import): boolean {
		/////////////////////////////////////////////////////////////
		//	Lint - Import statements shouldn't be used, because they aren't offering parallel downloads.
		/////////////////////////////////////////////////////////////
		this.addEntry(node, Rules.ImportStatemement);
		return true;
	}

	private visitPrio(node: nodes.Node) {
		/////////////////////////////////////////////////////////////
		//	Don't use !important
		/////////////////////////////////////////////////////////////
		this.addEntry(node, Rules.AvoidImportant);
		return true;
	}

	private visitNumericValue(node: nodes.NumericValue): boolean {
		/////////////////////////////////////////////////////////////
		//	0 has no following unit
		/////////////////////////////////////////////////////////////
		let decl = node.findParent(nodes.NodeType.Declaration);
		if (decl) {
			let declValue = (<nodes.Declaration>decl).getValue();
			if (declValue && declValue.offset === node.offset && declValue.length === node.length) {
				let value = node.getValue();
				if (!value.unit || languageFacts.units.length.indexOf(value.unit.toLowerCase()) === -1) {
					return true;
				}
				if (parseFloat(value.value) === 0.0 && !!value.unit) {
					this.addEntry(node, Rules.ZeroWithUnit);
				}
			}
		}
		return true;
	}

	private visitFontFace(node: nodes.FontFace): boolean {
		let declarations = node.getDeclarations();
		if (!declarations) {
			// syntax error
			return;
		}

		let definesSrc = false, definesFontFamily = false;
		let containsUnknowns = false;
		for (let node of declarations.getChildren()) {
			if (this.isCSSDeclaration(node)) {
				let name = ((<nodes.Declaration>node).getProperty().getName().toLowerCase());
				if (name === 'src') { definesSrc = true; }
				if (name === 'font-family') { definesFontFamily = true; }
			} else {
				containsUnknowns = true;
			}
		}

		if (!containsUnknowns && (!definesSrc || !definesFontFamily)) {
			this.addEntry(node, Rules.RequiredPropertiesForFontFace);
		}

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

	private visitHexColorValue(node: nodes.HexColorValue): boolean {
		// Rule: #eeff0011 or #eeff00 or #ef01 or #ef0 
		let length = node.length;
		if (length !== 9 && length !== 7 && length !== 5 && length !== 4) {
			this.addEntry(node, Rules.HexColorLength);
		}
		return false;
	}

	private visitFunction(node: nodes.Function): boolean {

		let fnName = node.getName().toLowerCase();
		let expectedAttrCount = -1;
		let actualAttrCount = 0;

		switch (fnName) {
			case 'rgb(':
			case 'hsl(':
				expectedAttrCount = 3;
				break;
			case 'rgba(':
			case 'hsla(':
				expectedAttrCount = 4;
				break;
		}

		if (expectedAttrCount !== -1) {
			node.getArguments().accept(n => {
				if (n instanceof nodes.BinaryExpression) {
					actualAttrCount += 1;
					return false;
				}
				return true;
			});

			if (actualAttrCount !== expectedAttrCount) {
				this.addEntry(node, Rules.ArgsInColorFunction);
			}
		}

		return true;
	}
}


