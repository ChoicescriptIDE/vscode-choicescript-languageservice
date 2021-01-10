/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { DocumentUri } from 'vscode-languageserver-types';
import { Value } from "../services/languageFacts";
import { trim } from "../utils/strings";
import { NodeStringDecoder } from 'string_decoder';

/// <summary>
/// Nodes for the css 2.1 specification. See for reference:
/// http://www.w3.org/TR/CSS21/grammar.html#grammar
/// </summary>

export enum ChoiceScriptType {
	Number,
	String,
	Boolean
}

export enum LineType {
	Text,
	ChoiceScript,
	Comment,
	ChoiceOption
}

export enum IndentType {
	Spaces,
	Tab,
	Mixed
}

export enum NodeType {
	Undefined,
	ChoiceScriptComment,
	Identifier, // i.e. variable in a statement
	Scene,
	SceneRef,
	Line,
	Label,
	LabelRef,
	ChoiceScriptLine,
	ChoiceScriptStatement,
	TextLine,
	StringLiteral,
	Operator,
	Expression,
	BinaryExpression,
	StringExpression,
	Term,
	Value,
	RealWord,
	ChoiceCommand,
	ChoiceOption,
	MultiReplace,
	MultiReplaceOption,
	VariableReplacement,
	PrintVariable,
	NumericValue,
	Boolean,
	Indentation, // ?
	VariableDeclaration,
	LabelDeclaration,
	FlowCommand,
	// ...
	HexColorValue,
	Variable,
	CreateVariable,
	If,
	Else,
	For,
	Each,
	While,
	MixinContentReference,
	MixinContentDeclaration,
	Media,
	Keyframe,
	FontFace,
	Import,
	Namespace,
	Invocation,
	FunctionDeclaration,
	ReturnStatement,
	MediaQuery,
	FunctionParameter,
	FunctionArgument,
	KeyframeSelector,
	ViewPort,
	Document,
	AtApplyRule,
	CustomPropertyDeclaration,
	CustomPropertySet,
	ListEntry,
	Supports,
	SupportsCondition,
	NamespacePrefix,
	GridLine,
	Plugin,
	UnknownAtRule,
	Command,
	StandardCommand,
	InvalidBuiltin,
}

export enum ReferenceType {
	Label,
	Variable,
	Unknown
}



export function getNodeAtOffset(node: Node, offset: number): Node | null {

	let candidate: Node | null = null;
	if (!node || offset < node.offset || offset > node.end) {
		return null;
	}

	// Find the shortest node at the position
	node.accept((node) => {
		if (node.offset === -1 && node.length === -1) {
			return true;
		}
		if (node.offset <= offset && node.end >= offset) {
			if (!candidate) {
				candidate = node;
			} else if (node.length <= candidate.length) {
				candidate = node;
			}
			return true;
		}
		return false;
	});
	return candidate;
}

export function getNodePath(node: Node, offset: number): Node[] {

	let candidate = getNodeAtOffset(node, offset);
	const path: Node[] = [];

	while (candidate) {
		path.unshift(candidate);
		candidate = candidate.parent;
	}

	return path;
}

export interface ITextProvider {
	(offset: number, length: number): string;
}


export class Node {

	public parent: Node | null;

	public offset: number;
	public length: number;
	public get end() { return this.offset + this.length; }

	public options: { [name: string]: any; } | undefined;

	public textProvider: ITextProvider | undefined; // only set on the root node

	private children: Node[] | undefined;
	private issues: IMarker[] | undefined;

	private nodeType: NodeType | undefined;

	constructor(offset: number = -1, len: number = -1, nodeType?: NodeType) {
		this.parent = null;
		this.offset = offset;
		this.length = len;
		if (nodeType) {
			this.nodeType = nodeType;
		}
	}

	public set type(type: NodeType) {
		this.nodeType = type;
	}

	public get type(): NodeType {
		return this.nodeType || NodeType.Undefined;
	}

	private getTextProvider(): ITextProvider {
		let node: Node | null = this;
		while (node && !node.textProvider) {
			node = node.parent;
		}
		if (node) {
			return node.textProvider!;
		}
		return () => { return 'unknown'; };
	}

	public getText(): string {
		return this.getTextProvider()(this.offset, this.length);
	}

	public matches(str: string): boolean {
		return this.length === str.length && this.getTextProvider()(this.offset, this.length) === str;
	}

	public startsWith(str: string): boolean {
		return this.length >= str.length && this.getTextProvider()(this.offset, str.length) === str;
	}

	public endsWith(str: string): boolean {
		return this.length >= str.length && this.getTextProvider()(this.end - str.length, str.length) === str;
	}

	public accept(visitor: IVisitorFunction): void {
		if (visitor(this) && this.children) {
			for (const child of this.children) {
				child.accept(visitor);
			}
		}
	}

	public acceptVisitor(visitor: IVisitor): void {
		this.accept(visitor.visitNode.bind(visitor));
	}

	public adoptChild(node: Node, index: number = -1): Node {
		if (node.parent && node.parent.children) {
			const idx = node.parent.children.indexOf(node);
			if (idx >= 0) {
				node.parent.children.splice(idx, 1);
			}
		}
		node.parent = this;
		let children = this.children;
		if (!children) {
			children = this.children = [];
		}
		if (index !== -1) {
			children.splice(index, 0, node);
		} else {
			children.push(node);
		}
		return node;
	}

	public attachTo(parent: Node, index: number = -1): Node {
		if (parent) {
			parent.adoptChild(this, index);
		}
		return this;
	}

	public collectIssues(results: any[]): void {
		if (this.issues) {
			results.push.apply(results, this.issues);
		}
	}

	public addIssue(issue: IMarker): void {
		if (!this.issues) {
			this.issues = [];
		}
		this.issues.push(issue);
	}

	public hasIssue(rule: IRule): boolean {
		return Array.isArray(this.issues) && this.issues.some(i => i.getRule() === rule);
	}

	public isErroneous(recursive: boolean = false): boolean {
		if (this.issues && this.issues.length > 0) {
			return true;
		}
		return recursive && Array.isArray(this.children) && this.children.some(c => c.isErroneous(true));
	}

	public setNode(field: keyof this, node: Node | null, index: number = -1): boolean {
		if (node) {
			node.attachTo(this, index);
			(<any>this)[field] = node;
			return true;
		}
		return false;
	}

	public addChild(node: Node | null): node is Node {
		if (node) {
			if (!this.children) {
				this.children = [];
			}
			node.attachTo(this);
			this.updateOffsetAndLength(node);
			return true;
		}
		return false;
	}

	private updateOffsetAndLength(node: Node): void {
		if (node.offset < this.offset || this.offset === -1) {
			this.offset = node.offset;
		}
		const nodeEnd = node.end;
		if ((nodeEnd > this.end) || this.length === -1) {
			this.length = nodeEnd - this.offset;
		}
	}

	public hasChildren(): boolean {
		return !!this.children && this.children.length > 0;
	}

	public getChildren(): Node[] {
		return this.children ? this.children.slice(0) : [];
	}

	public getChild(index: number): Node | null {
		if (this.children && index < this.children.length) {
			return this.children[index];
		}
		return null;
	}

	public addChildren(nodes: Node[]): void {
		for (const node of nodes) {
			this.addChild(node);
		}
	}

	public findFirstChildBeforeOffset(offset: number): Node | null {
		if (this.children) {
			let current: Node | null = null;
			for (let i = this.children.length - 1; i >= 0; i--) {
				// iterate until we find a child that has a start offset smaller than the input offset
				current = this.children[i];
				if (current.offset <= offset) {
					return current;
				}
			}
		}
		return null;
	}

	public findChildAtOffset(offset: number, goDeep: boolean): Node | null {
		const current: Node | null = this.findFirstChildBeforeOffset(offset);
		if (current && current.end >= offset) {
			if (goDeep) {
				return current.findChildAtOffset(offset, true) || current;
			}
			return current;
		}
		return null;
	}

	public encloses(candidate: Node): boolean {
		return this.offset <= candidate.offset && this.offset + this.length >= candidate.offset + candidate.length;
	}

	public getParent(): Node | null {
		let result = this.parent;
		while (result instanceof Nodelist) {
			result = result.parent;
		}
		return result;
	}

	public findParent(type: NodeType): Node | null {
		let result: Node | null = this;
		while (result && result.type !== type) {
			result = result.parent;
		}
		return result;
	}

	public findAParent(...types: NodeType[]): Node | null {
		let result: Node | null = this;
		while (result && !types.some(t => result!.type === t)) {
			result = result.parent;
		}
		return result;
	}

	public setData(key: string, value: any): void {
		if (!this.options) {
			this.options = {};
		}
		this.options[key] = value;
	}

	public getData(key: string): any {
		if (!this.options || !this.options.hasOwnProperty(key)) {
			return null;
		}
		return this.options[key];
	}
}


export class Indentation extends Node {
	private iType: IndentType = IndentType.Spaces;
	private depth: number = 0;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public setIndentUnit(indentType: IndentType) {
		this.iType = indentType;
	}

	public setIndentDepth(depth: number) {
		this.depth = depth;
	}

	public get type(): NodeType {
		return NodeType.Indentation;
	}

	public get indentDepth(): number {
		return this.depth;
	}

	public get indentType(): IndentType {
		return this.iType;
	}
}


export interface NodeConstructor<T> {
	new(offset: number, len: number): T;
}

export class Nodelist extends Node {
	private _nodeList: void; // workaround for https://github.com/Microsoft/TypeScript/issues/12083

	constructor(parent: Node, index: number = -1) {
		super(-1, -1);
		this.attachTo(parent, index);
		this.offset = -1;
		this.length = -1;
	}
}

export class VariableReplacement extends Node {
	public get type(): NodeType {
		return NodeType.VariableReplacement;
	}
}

export class ChoiceScriptStatement extends Node {
	public get type(): NodeType {
		return NodeType.ChoiceScriptStatement;
	}
}

export class ChoiceScriptComment extends Node {
	public get type(): NodeType {
		return NodeType.ChoiceScriptComment;
	}
}

export class Identifier extends Node {

	public referenceTypes?: ReferenceType[];
	public isCustomProperty = false;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Identifier;
	}

	public containsInterpolation(): boolean {
		return this.hasChildren();
	}
}

export class Scene extends Node {

	private sceneName?: string;
	private uri?: string;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Scene;
	}

	public get name(): string | undefined {
		return this.sceneName;
	}

	public setUri(uri: DocumentUri): void {
		this.uri = uri;
		this.sceneName = uri.slice(uri.lastIndexOf('/')+1, -1*(".txt".length));
	}

	public getUri(): DocumentUri | undefined {
		return this.uri;
	}

	public isStartup(): boolean {
		if (!this.uri) {
			return false; // best guess
		}
		return /\/startup\.txt$/.test(this.uri);
	}

	public isStats(): boolean {
		if (!this.uri) {
			return false; // best guess
		}
		return /\/choicescript_stats\.txt$/.test(this.uri);
	}
}

export class SceneRef extends Node {

	private sceneName?: string;
	private uri?: string;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.SceneRef;
	}

	public get name(): string | undefined {
		return this.sceneName;
	}

	public getUri(): DocumentUri | undefined {
		return this.uri;
	}

	public isStartup(): boolean {
		if (!this.uri) {
			return false; // best guess
		}
		return /\/startup\.txt$/.test(this.uri);
	}
}

export class Command extends Node {

	// FIXME could we get a clever way of generic handling/modelling of params/args here?
	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Command;
	}

	// grab the unqualified name of the command
	public get name(): string {
		let match = this.getText().match(/^\*([A-Za-z_]+\b)/);
		return match ? match[1] : this.getText();
	}

}

export class Label extends Command {

	private labelName?: string;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Label;
	}

	public getValue(): string {
		return this.labelName || this.getText();
	}
}

export class LabelRef extends Node {

	// if the label is in another scene
	private sceneRef: SceneRef | null = null;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.LabelRef;
	}

	public get scene(): SceneRef | null {
		return this.sceneRef;
	}

	public setSceneRef(node: SceneRef): boolean {
		if (node) {
			this.sceneRef = node;
			return true;
		}
		return false;
	}

}

export class StandardCommand extends Command {
	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.StandardCommand;
	}
}

export class FlowCommand extends Command {
	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.FlowCommand;
	}
}

export class RandCommand extends Command {
	public get type(): NodeType {
		return NodeType.Command;
	}
}

export class SetCommand extends Command {

	private variable?: Variable; // target variable
	private expr?: Expression; // new value (can also be a variable/identifier)

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public getExpr(): Expression | undefined {
		return this.expr;
	}

	public getVariable(): Variable | undefined {
		return this.variable;
	}

	public setVariable(node: Variable): boolean {
		if (node) {
			node.attachTo(this);
			this.variable = node;
			return true;
		}
		return false;
	}

	public setValue(node: Expression): boolean {
		if (node) {
			node.attachTo(this);
			this.expr = node;
			return true;
		}
		return false;
	}

	public get type(): NodeType {
		return NodeType.Command;
	}
}

export class ChoiceCommand extends StandardCommand {

	// FIXME member array for choice options?

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.ChoiceCommand;
	}
}

export class IfElseCommand extends StandardCommand {
	private condition: Expression | null = null; // null for *else
	private next: IfElseCommand | null = null;
	private prev: IfElseCommand | null = null;
}

export class ChoiceOption extends Node {

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.ChoiceOption;
	}
}

export class RealWord extends Node {
	constructor(offset: number, length: number) {
		super(offset, length);
	}
	public get type(): NodeType {
		return NodeType.RealWord;
	}
}

export class Line extends Node {

	private lineType: LineType = LineType.Text;
	private indentDepth: number = 0;
	private indentNode: Indentation | undefined;

	// unused
	public lineNumber?: number | undefined;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public getLineNum(): number {
		return this.lineNumber!;
	}

	public setLineNum(lineNumber: number): boolean {
		if (lineNumber > 0) {
			this.lineNumber = lineNumber;
			return true;
		}
		return false;
	}

	public get type(): NodeType {
		return NodeType.Line;
	}

	public setLineType(lineType: LineType) {
		this.lineType = lineType;
	}

	public getLineType() {
		return this.lineType;
	}

	public addIndent(node: Indentation | null) {
		if (node) {
			node.attachTo(this);
			this.indentNode = node;
			this.indentDepth = node.indentDepth;
			return true;
		}
		return false;
	}

	public getIndentNode(): Indentation | undefined{
		return this.indentNode;
	}

	public get indent(): number {
		return this.indentDepth;
	}

}

/* Indented 'blocks' under *if/*else statements or choice #options */
export class CodeBlock extends Node {
	public options: [] = [];
}

export class TextLine extends Line {
	constructor(offset: number, length: number) {
		super(offset, length);
	}
	public get type(): NodeType {
		return NodeType.TextLine;
	}
}

export class ChoiceScriptLine extends Line {
	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.ChoiceScriptLine;
	}
}

export class AtApplyRule extends Node {

	public identifier: Identifier | undefined;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.AtApplyRule;
	}

	public setIdentifier(node: Identifier): boolean {
		return this.setNode('identifier', node, 0);
	}

	public getIdentifier(): Identifier | undefined {
		return this.identifier;
	}

	public getName(): string {
		return this.identifier ? this.identifier.getText() : '';
	}
}

export class Invocation extends Node {

	private arguments?: Nodelist;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Invocation;
	}

	public getArguments(): Nodelist {
		if (!this.arguments) {
			this.arguments = new Nodelist(this);
		}
		return this.arguments;
	}
}

export class FunctionParameter extends Node {

	public identifier?: Node;
	public defaultValue?: Node;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.FunctionParameter;
	}

	public setIdentifier(node: Node | null): node is Node {
		return this.setNode('identifier', node, 0);
	}

	public getIdentifier(): Node | undefined {
		return this.identifier;
	}

	public getName(): string {
		return this.identifier ? this.identifier.getText() : '';
	}

	public setDefaultValue(node: Node | null): node is Node {
		return this.setNode('defaultValue', node, 0);
	}

	public getDefaultValue(): Node | undefined {
		return this.defaultValue;
	}
}

export class FunctionArgument extends Node {

	public identifier?: Node;
	public value?: Node;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.FunctionArgument;
	}

	public setIdentifier(node: Node | null): node is Node {
		return this.setNode('identifier', node, 0);
	}

	public getIdentifier(): Node | undefined {
		return this.identifier;
	}

	public getName(): string {
		return this.identifier ? this.identifier.getText() : '';
	}

	public setValue(node: Node | null): node is Node {
		return this.setNode('value', node, 0);
	}

	public getValue(): Node | undefined {
		return this.value;
	}
}

export class Import extends Node {

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Import;
	}

	public setMedialist(node: Node | null): node is Node {
		if (node) {
			node.attachTo(this);
			return true;
		}
		return false;
	}
}

export class Namespace extends Node {

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Namespace;
	}

}

export class MediaQuery extends Node {

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.MediaQuery;
	}
}

export class SupportsCondition extends Node {

	public lParent?: number;
	public rParent?: number;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.SupportsCondition;
	}
}

export class MultiReplaceOption extends Node {
	public get type(): NodeType {
		return NodeType.MultiReplaceOption;
	}
}

export class MultiReplace extends VariableReplacement {

	public variants?: MultiReplaceOption[] = [];
	public right?: Node;
	public expression?: Expression;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.MultiReplace;
	}

	public addVariant(variant: MultiReplaceOption | null): number {
		if (variant) {
			this.variants!.push(variant);
			this.addChild(variant);
		}
		return this.variants!.length;
	}

	public setExpression(value: Node | null): value is Node {
		return this.setNode('expression', value);
	}

	public getExpression(): Expression | undefined {
		return this.expression;
	}

	public getOptions(): MultiReplaceOption[] | undefined {
		return this.variants;
	}

}

export class Expression extends Node {

	//private _expression: void; // workaround for https://github.com/Microsoft/TypeScript/issues/12083
	private exprType: ChoiceScriptType | undefined;
	public left?: Node;
	public right?: Node;
	public operator?: Node;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Expression;
	}

	public setLeft(left: Node | null): left is Node {
		return this.setNode('left', left);
	}

	public getLeft(): Node | undefined {
		return this.left;
	}

	public setRight(right: Node | null): right is Node {
		return this.setNode('right', right);
	}

	public getRight(): Node | undefined {
		return this.right;
	}

	public setOperator(node: Operator): node is Operator {
		let ret = this.setNode('operator', node);
		if (ret) {
			this.exprType = node.csType;
		}
		return ret;
	}

	public getOperator(): Node | undefined {
		return this.operator;
	}

	public isSingleValue(): boolean {
		return (typeof this.getLeft() !== 'undefined' && 
				(!this.getRight() && !this.getOperator()));
	}

	public get csType(): ChoiceScriptType | undefined {
		if (this.getLeft() && !this.getRight()) {
			switch (this.getLeft()!.type) {
				case NodeType.NumericValue:
					return ChoiceScriptType.Number;
				case NodeType.StringLiteral:
					return ChoiceScriptType.String;
				case NodeType.BinaryExpression:
				case NodeType.Boolean:
					return ChoiceScriptType.Boolean;
				case NodeType.Identifier:
					return undefined; // FIXME
				default:
					return undefined;
			}
			let term = <Term>this.getLeft();
			return term.csType;
		}
		return this.exprType; // || this.getLeft().csType;
	}
}

export class BinaryExpression extends Expression {

	public left?: Term;
	public right?: Term;
	public operator?: Node;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.BinaryExpression;
	}
}

export class StringExpression extends Expression {

	public left?: Term;
	public right?: Term;
	public operator?: Node;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.StringExpression;
	}
}

export class Term extends Node {

	public operator?: Node;
	public expression?: Node;
	private valueType?: ChoiceScriptType;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.Term;
	}

	public setValue(node: Node | null): node is Node {
		if (!this.addChild(node)) {
			return false;
		}
		switch (node?.type) {
			case NodeType.StringExpression:
			case NodeType.BinaryExpression:
			case NodeType.Expression:
				let expr = <Expression>node;
				this.valueType = expr.csType;
				break;
			case NodeType.NumericValue:
				this.valueType = ChoiceScriptType.Number;
				break;
			case NodeType.StringLiteral:
				this.valueType = ChoiceScriptType.String;
				break;
			case NodeType.Boolean:
				this.valueType = ChoiceScriptType.Boolean;
				break;
			case NodeType.Identifier:
				this.valueType = undefined; // FIXME
				break;
		}
		return true;
	}

	public get csType(): ChoiceScriptType | undefined {
		return this.valueType;
	}
}

export class Operator extends Node {

	private operatorType: ChoiceScriptType | undefined;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public setCSType(type: ChoiceScriptType): void {
		this.operatorType = type; 
	}

	public get type(): NodeType {
		return NodeType.Operator;
	}

	public get csType(): ChoiceScriptType | undefined {
		return this.operatorType;
	}

}

export class HexColorValue extends Node {
	private _hexColorValue: void; // workaround for https://github.com/Microsoft/TypeScript/issues/18276

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.HexColorValue;
	}

}

const _dot = '.'.charCodeAt(0),
	_0 = '0'.charCodeAt(0),
	_9 = '9'.charCodeAt(0);

export class NumericValue extends Node {

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.NumericValue;
	}

	public getValue(): { value: string; unit?: string } {
		const raw = this.getText();
		let unitIdx = 0;
		let code: number;
		for (let i = 0, len = raw.length; i < len; i++) {
			code = raw.charCodeAt(i);
			if (!(_0 <= code && code <= _9 || code === _dot)) {
				break;
			}
			unitIdx += 1;
		}
		return {
			value: raw.substring(0, unitIdx),
			unit: unitIdx < raw.length ? raw.substring(unitIdx) : undefined
		};
	}
}

export class StringValue extends Node {

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.StringLiteral;
	}

	public getValue(): String {
		return this.getText();
	}
}

export declare class Declarations extends Node {
	private _declarations;
	constructor(offset: number, length: number);
}

export declare class BodyDeclaration extends Node {
	declarations: Declarations | undefined;
	constructor(offset: number, length: number);
	getDeclarations(): Declarations | undefined;
	setDeclarations(decls: Declarations): boolean;
}

export declare class Document extends BodyDeclaration {
	constructor(offset: number, length: number);
}

export class VariableDeclaration extends Command {

	private variable: Variable | null = null;
	private expr: Expression | null = null;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public setVariable(node: Variable | null): node is Variable {
		if (node) {
			node.attachTo(this);
			this.variable = node;
			return true;
		}
		return false;
	}

	public setExpr(node: Expression | null): node is Expression {
		if (node) {
			node.attachTo(this);
			this.expr = node;
			return true;
		}
		return false;
	}

	// Getters

	public get csType(): ChoiceScriptType | undefined {
		return this.expr?.csType;
	}

	public get type(): NodeType {
		return NodeType.VariableDeclaration;
	}

	public isConstant(): boolean {
		return this.getName() === this.getName().toUpperCase();
	}

	public getVariable(): Variable | null {
		return this.variable;
	}

	public getName(): string {
		return this.variable ? this.variable.getName() : '';
	}

	public getExpr(): Expression | null {
		return this.expr;
	}
}

export class LabelDeclaration extends Command {

	private label?: Label;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	public get type(): NodeType {
		return NodeType.LabelDeclaration;
	}

	public setLabel(node: Label | null): boolean {
		if (node) {
			node.attachTo(this);
			this.label = node;
			return true;
		}
		return false;
	}

	public getLabel(): Label {
		return this.label!;
	}

}

export class Variable extends Node {

	private varType: ChoiceScriptType | undefined = undefined;
	private value?: Node;

	constructor(offset: number, length: number) {
		super(offset, length);
	}

	private _setCSType<T extends Node>(node: T): void {
		switch (node.type) {
			case NodeType.BinaryExpression:
				this.varType = ChoiceScriptType.Boolean;
				break;
			case NodeType.NumericValue:
				this.varType = ChoiceScriptType.Number;
				break;
			case NodeType.StringLiteral:
				this.varType = ChoiceScriptType.String;
				break;
			default:
				break;
		}
	}

	public setValue(node: Node | null): node is Node {
		if (node) {
			node.attachTo(this);
			this.value = node;
			this._setCSType(node);
			return true;
		}
		return false;
	}

	public get csType(): ChoiceScriptType | undefined {
		return this.varType;
	}

	public get const(): boolean {
		return /^const_[\w0-9]+/.test(this.getText());
	}

	public get type(): NodeType {
		return NodeType.Variable;
	}

	public getName(): string {
		return this.getText();
	}

	public getValue(): Node {
		return this.value!;
	}

}

export class ListEntry extends Node {

	public key?: Node;
	public value?: Node;

	public get type(): NodeType {
		return NodeType.ListEntry;
	}

	public setKey(node: Node | null): node is Node {
		return this.setNode('key', node, 0);
	}

	public setValue(node: Node | null): node is Node {
		return this.setNode('value', node, 1);
	}
}

export class LessGuard extends Node {

	public isNegated?: boolean;
	private conditions?: Nodelist;

	public getConditions(): Nodelist {
		if (!this.conditions) {
			this.conditions = new Nodelist(this);
		}
		return this.conditions;
	}
}

export class GuardCondition extends Node {

	public variable?: Node;
	public isEquals?: boolean;
	public isGreater?: boolean;
	public isEqualsGreater?: boolean;
	public isLess?: boolean;
	public isEqualsLess?: boolean;

	public setVariable(node: Node | null): node is Node {
		return this.setNode('variable', node);
	}
}

export interface IRule {
	id: string;
	message: string;
}


export enum Level {
	Ignore = 0,
	Error = 1,
	Warning = 2,
	Information = 3,
	Hint = 4
}

export interface IMarker {
	getNode(): Node;
	getMessage(): string;
	getOffset(): number;
	getLength(): number;
	getRule(): IRule;
	getLevel(): Level;
}

export class Marker implements IMarker {

	private node: Node;
	private rule: IRule;
	private level: Level;
	private message: string;
	private offset: number;
	private length: number;

	constructor(node: Node, rule: IRule, level: Level, message?: string, offset: number = node.offset, length: number = node.length) {
		this.node = node;
		this.rule = rule;
		this.level = level;
		this.message = message || rule.message;
		this.offset = offset;
		this.length = length;
	}

	public getRule(): IRule {
		return this.rule;
	}

	public getLevel(): Level {
		return this.level;
	}

	public getOffset(): number {
		return this.offset;
	}

	public getLength(): number {
		return this.length;
	}

	public getNode(): Node {
		return this.node;
	}

	public getMessage(): string {
		return this.message;
	}
}

export interface IVisitor {
	visitNode: (node: Node) => boolean;
}

export interface IVisitorFunction {
	(node: Node): boolean;
}
/*
export class DefaultVisitor implements IVisitor {

	public visitNode(node:Node):boolean {
		switch (node.type) {
			case NodeType.Stylesheet:
				return this.visitStylesheet(<Stylesheet> node);
			case NodeType.FontFace:
				return this.visitFontFace(<FontFace> node);
			case NodeType.Ruleset:
				return this.visitRuleSet(<RuleSet> node);
			case NodeType.Selector:
				return this.visitSelector(<Selector> node);
			case NodeType.SimpleSelector:
				return this.visitSimpleSelector(<SimpleSelector> node);
			case NodeType.Declaration:
				return this.visitDeclaration(<Declaration> node);
			case NodeType.Function:
				return this.visitFunction(<Function> node);
			case NodeType.FunctionDeclaration:
				return this.visitFunctionDeclaration(<FunctionDeclaration> node);
			case NodeType.FunctionParameter:
				return this.visitFunctionParameter(<FunctionParameter> node);
			case NodeType.FunctionArgument:
				return this.visitFunctionArgument(<FunctionArgument> node);
			case NodeType.Term:
				return this.visitTerm(<Term> node);
			case NodeType.Declaration:
				return this.visitExpression(<Expression> node);
			case NodeType.NumericValue:
				return this.visitNumericValue(<NumericValue> node);
			case NodeType.Page:
				return this.visitPage(<Page> node);
			case NodeType.PageBoxMarginBox:
				return this.visitPageBoxMarginBox(<PageBoxMarginBox> node);
			case NodeType.Property:
				return this.visitProperty(<Property> node);
			case NodeType.NumericValue:
				return this.visitNodelist(<Nodelist> node);
			case NodeType.Import:
				return this.visitImport(<Import> node);
			case NodeType.Namespace:
				return this.visitNamespace(<Namespace> node);
			case NodeType.Keyframe:
				return this.visitKeyframe(<Keyframe> node);
			case NodeType.KeyframeSelector:
				return this.visitKeyframeSelector(<KeyframeSelector> node);
			case NodeType.MixinDeclaration:
				return this.visitMixinDeclaration(<MixinDeclaration> node);
			case NodeType.MixinReference:
				return this.visitMixinReference(<MixinReference> node);
			case NodeType.Variable:
				return this.visitVariable(<Variable> node);
			case NodeType.VariableDeclaration:
				return this.visitVariableDeclaration(<VariableDeclaration> node);
		}
		return this.visitUnknownNode(node);
	}

	public visitFontFace(node:FontFace):boolean {
		return true;
	}

	public visitKeyframe(node:Keyframe):boolean {
		return true;
	}

	public visitKeyframeSelector(node:KeyframeSelector):boolean {
		return true;
	}

	public visitStylesheet(node:Stylesheet):boolean {
		return true;
	}

	public visitProperty(Node:Property):boolean {
		return true;
	}

	public visitRuleSet(node:RuleSet):boolean {
		return true;
	}

	public visitSelector(node:Selector):boolean {
		return true;
	}

	public visitSimpleSelector(node:SimpleSelector):boolean {
		return true;
	}

	public visitDeclaration(node:Declaration):boolean {
		return true;
	}

	public visitFunction(node:Function):boolean {
		return true;
	}

	public visitFunctionDeclaration(node:FunctionDeclaration):boolean {
		return true;
	}

	public visitInvocation(node:Invocation):boolean {
		return true;
	}

	public visitTerm(node:Term):boolean {
		return true;
	}

	public visitImport(node:Import):boolean {
		return true;
	}

	public visitNamespace(node:Namespace):boolean {
		return true;
	}

	public visitExpression(node:Expression):boolean {
		return true;
	}

	public visitNumericValue(node:NumericValue):boolean {
		return true;
	}

	public visitPage(node:Page):boolean {
		return true;
	}

	public visitPageBoxMarginBox(node:PageBoxMarginBox):boolean {
		return true;
	}

	public visitNodelist(node:Nodelist):boolean {
		return true;
	}

	public visitVariableDeclaration(node:VariableDeclaration):boolean {
		return true;
	}

	public visitVariable(node:Variable):boolean {
		return true;
	}

	public visitMixinDeclaration(node:MixinDeclaration):boolean {
		return true;
	}

	public visitMixinReference(node:MixinReference):boolean {
		return true;
	}

	public visitUnknownNode(node:Node):boolean {
		return true;
	}
}
*/
export class ParseErrorCollector implements IVisitor {

	static entries(node: Node): IMarker[] {
		const visitor = new ParseErrorCollector();
		node.acceptVisitor(visitor);
		return visitor.entries;
	}

	public entries: IMarker[];

	constructor() {
		this.entries = [];
	}

	public visitNode(node: Node): boolean {

		if (node.isErroneous()) {
			node.collectIssues(this.entries);
		}
		return true;
	}
}
