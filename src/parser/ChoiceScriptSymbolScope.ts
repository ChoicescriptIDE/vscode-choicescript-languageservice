/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from './ChoiceScriptNodes';
import { findFirst } from '../utils/arrays';

export class Scope {

	public parent: Scope | null;
	public children: Scope[];

	public offset: number;
	public length: number;

	private symbols: Symbol[];

	constructor(offset: number, length: number) {
		this.offset = offset;
		this.length = length;
		this.symbols = [];

		this.parent = null;
		this.children = [];
	}

	public addChild(scope: Scope): void {
		this.children.push(scope);
		scope.setParent(this);
	}

	public setParent(scope: Scope): void {
		this.parent = scope;
	}

	public findScope(offset: number, length: number = 0): Scope | null {
		if (this.offset <= offset && this.offset + this.length > offset + length || this.offset === offset && this.length === length) {
			return this.findInScope(offset, length);
		}
		return null;
	}

	private findInScope(offset: number, length: number = 0): Scope {
		// find the first scope child that has an offset larger than offset + length
		const end = offset + length;
		const idx = findFirst(this.children, s => s.offset > end);
		if (idx === 0) {
			// all scopes have offsets larger than our end
			return this;
		}

		const res = this.children[idx - 1];
		if (res.offset <= offset && res.offset + res.length >= offset + length) {
			return res.findInScope(offset, length);
		}
		return this;
	}

	public addSymbol(symbol: Symbol): void {
		this.symbols.push(symbol);
	}

	public getSymbol(name: string, type: nodes.ReferenceType): Symbol | null {
		for (let index = 0; index < this.symbols.length; index++) {
			const symbol = this.symbols[index];
			if (symbol.name === name && symbol.type === type) {
				return symbol;
			}
		}
		return null;
	}

	public getSymbols(): Symbol[] {
		return this.symbols;
	}
}

export class GlobalScope extends Scope {

	constructor() {
		super(0, Number.MAX_VALUE);
	}
}



export class Symbol {

	public name: string;
	public value: string | undefined;
	public type: nodes.ReferenceType;
	public node: nodes.Node;

	constructor(name: string, value: string | undefined, node: nodes.Node, type: nodes.ReferenceType) {
		this.name = name;
		this.value = value;
		this.node = node;
		this.type = type;
	}
}

export class ScopeBuilder implements nodes.IVisitor {

	public scope: Scope;

	constructor(scope: Scope) {
		this.scope = scope;
	}

	private addSymbol(node: nodes.Node, name: string, value: string | undefined, type: nodes.ReferenceType): void {
		if (node.offset !== -1) {
			const current = this.scope.findScope(node.offset, node.length);
			if (current) {
				current.addSymbol(new Symbol(name, value, node, type));
			}
		}
	}

	private addScope(node: nodes.Node): Scope | null {
		if (node.offset !== -1) {
			const current = this.scope.findScope(node.offset, node.length);
			if (current && (current.offset !== node.offset || current.length !== node.length)) { // scope already known?
				const newScope = new Scope(node.offset, node.length);
				current.addChild(newScope);
				return newScope;
			}
			return current;
		}
		return null;
	}

	private addSymbolToChildScope(scopeNode: nodes.Node, node: nodes.Node, name: string, value: string | undefined, type: nodes.ReferenceType): void {
		if (scopeNode && scopeNode.offset !== -1) {
			const current = this.addScope(scopeNode); // create the scope or gets the existing one
			if (current) {
				current.addSymbol(new Symbol(name, value, node, type));
			}
		}
	}

	public visitNode(node: nodes.Node): boolean {
		switch (node.type) {
			// achievement, scene_list ...
			case nodes.NodeType.FlowCommand:
				return true;
			case nodes.NodeType.ChoiceCommand:
				this.addScope(node);
				break;
			case nodes.NodeType.VariableDeclaration:
				return this.visitVariableDeclarationNode(<nodes.VariableDeclaration>node);
			case nodes.NodeType.LabelDeclaration:
				return this.visitLabelDeclarationNode(<nodes.LabelDeclaration>node);
			/*case nodes.NodeType.FunctionParameter: {
				return this.visitFunctionParameterNode(<nodes.FunctionParameter>node);
			}*/
		}
		return true;
	}

	public visitVariableDeclarationNode(node: nodes.VariableDeclaration): boolean {
		const value = node.getExpr() ? node.getExpr()!.getText() : void 0;
		this.addSymbol(node, node.getName(), value, nodes.ReferenceType.Variable);
		return true;
	}

	public visitLabelDeclarationNode(node: nodes.LabelDeclaration): boolean {
		if (node.getLabel()) {
			this.addSymbol(node, node.getLabel().name, null!, nodes.ReferenceType.Label);
		}
		return true;
	}

	public visitFunctionParameterNode(node: nodes.FunctionParameter): boolean {
		// parameters are part of the body scope
		const scopeNode = (<nodes.BodyDeclaration>node.getParent()).getDeclarations();
		if (scopeNode) {
			const valueNode = (<nodes.FunctionParameter>node).getDefaultValue();
			const value = valueNode ? valueNode.getText() : void 0;
			this.addSymbolToChildScope(scopeNode, node, node.getName(), value, nodes.ReferenceType.Variable);
		}
		return true;
	}

	private addCSSVariable(node: nodes.Node, name: string, value: string, type: nodes.ReferenceType): void {
		if (node.offset !== -1) {
			this.scope.addSymbol(new Symbol(name, value, node, type));
		}
	}
}

export class Symbols {

	private global: Scope;

	constructor(node: nodes.Node) {
		this.global = new GlobalScope();
		node.acceptVisitor(new ScopeBuilder(this.global));
	}

	public findSymbolsAtOffset(offset: number, referenceType: nodes.ReferenceType): Symbol[] {
		let scope = this.global.findScope(offset, 0);
		const result: Symbol[] = [];
		const names: { [name: string]: boolean } = {};
		while (scope) {
			const symbols = scope.getSymbols();
			for (let i = 0; i < symbols.length; i++) {
				const symbol = symbols[i];
				if (symbol.type === referenceType && !names[symbol.name]) {
					result.push(symbol);
					names[symbol.name] = true;
				}
			}
			scope = scope.parent;
		}
		return result;
	}


	private internalFindSymbol(node: nodes.Node, referenceTypes: nodes.ReferenceType[]): Symbol | null {
		let scopeNode: nodes.Node | undefined = node;
		if (!scopeNode) {
			return null;
		}
		const name = node.getText();
		let scope = this.global.findScope(scopeNode.offset, scopeNode.length);
		//console.log("internalFindSymbol", node, referenceTypes, name, scope);
		while (scope) {
			for (let index = 0; index < referenceTypes.length; index++) {
				const type = referenceTypes[index];
				const symbol = scope.getSymbol(name, type);
				if (symbol) {
					return symbol;
				}
			}
			scope = scope.parent;
		}
		return null;
	}

	private evaluateReferenceTypes(node: nodes.Node): nodes.ReferenceType[] | null {
		/*if (node instanceof nodes.Identifier) {
			let referenceTypes = (<nodes.Identifier>node).referenceTypes;
			if (referenceTypes) {
				return referenceTypes;
			} else {
				if (node.isCustomProperty) {
					return [nodes.ReferenceType.Variable];
				}
				// are a reference to a keyframe?
				const decl = nodes.getParentDeclaration(node);
				if (decl) {
					const propertyName = decl.getNonPrefixedPropertyName();
					if ((propertyName === 'animation' || propertyName === 'animation-name')
						&& decl.getValue() && decl.getValue()!.offset === node.offset) {
						return [nodes.ReferenceType.Keyframe];
					}
				}
			}
		} else */ 
		if (node instanceof nodes.Label) {
			return [nodes.ReferenceType.Label];
		}
		if (node instanceof nodes.Variable) {
			return [nodes.ReferenceType.Variable];
		}
		if (node instanceof nodes.Identifier) {
			return node.referenceTypes || null;
		}
		return null;
	}

	public findSymbolFromNode(node: nodes.Node): Symbol | null {
		if (!node) {
			return null;
		}

		let referenceTypes = this.evaluateReferenceTypes(node);
		//console.log(node, referenceTypes);
		if (referenceTypes) {
			return this.internalFindSymbol(node, referenceTypes);
		}
		return null;
	}

	public matchesSymbol(node: nodes.Node, symbol: Symbol): boolean {
		if (!node) {
			return false;
		}

		if (!node.matches(symbol.name)) {
			return false;
		}

		const referenceTypes = this.evaluateReferenceTypes(node);
		if (!referenceTypes || referenceTypes.indexOf(symbol.type) === -1) {
			return false;
		}

		const nodeSymbol = this.internalFindSymbol(node, referenceTypes);
		if (nodeSymbol) {
			//if (nodeSymbol.type === symbol.type) {
				if (nodeSymbol.name === symbol.name) {
					return true;
				}
			//}
		}
		return false;
	}


	public findSymbol(name: string, type: nodes.ReferenceType, offset: number): Symbol | null {
		let scope = this.global.findScope(offset);
		while (scope) {
			const symbol = scope.getSymbol(name, type);
			if (symbol) {
				return symbol;
			}
			scope = scope.parent;
		}
		return null;
	}
}