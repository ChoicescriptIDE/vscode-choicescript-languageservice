/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/ChoiceScriptNodes';
import { ParseError } from '../parser/ChoiceScriptErrors';
import { Symbols, Symbol } from '../parser/ChoiceScriptSymbolScope';
import { ChoiceScriptIndexer, ChoiceScriptProjectIndex } from '../parser/ChoiceScriptIndexer';
import * as languageFacts from '../languageFacts/choicescriptFacts';
import * as strings from '../utils/strings';
import {
	ICompletionParticipant, LanguageSettings, ClientCapabilities, TextDocument,
	Position, CompletionList, CompletionItem, CompletionItemKind, Range, TextEdit, InsertTextFormat, MarkupKind, MarkupContent, CompletionItemTag
} from '../cssLanguageTypes';
import { Rules, LintConfigurationSettings, Rule } from './textRules';
//import * as fs from 'fs';
import * as nls from 'vscode-nls';
import { isDefined } from '../utils/objects';
const localize = nls.loadMessageBundle();
const SnippetFormat = InsertTextFormat.Snippet;

enum SortTexts {
	// char code 32, comes before everything
	Enums = ' ',

	Normal = 'd',

	VendorPrefixed = 'x',
	Term = 'y',
	Label = 'x',
	Variable = 'z'
}

export class ChoiceScriptCompletion {

	private settings?: LanguageSettings;

	private supportsMarkdown: boolean | undefined;

	position!: Position;
	offset!: number;
	currentWord!: string;
	textDocument!: TextDocument;
	scene!: nodes.Scene;
	symbolContext!: Symbols;
	defaultReplaceRange!: Range;
	nodePath!: nodes.Node[];
	completionParticipants: ICompletionParticipant[] = [];
	public typo: any = null;

	constructor(public variablePrefix: string | null = null, private clientCapabilities: ClientCapabilities | undefined) {
		let baseUrl = "test/dictionaries/";
	}

	public configure(settings?: LanguageSettings) {
		this.settings = settings;
	}

	protected getSymbolContext(scene?: nodes.Scene): Symbols {
		if (!scene && !this.symbolContext) {
			this.symbolContext = new Symbols(this.scene);
		} else if (scene) { // do we want to bother caching symbolContext here? Or in the indexer itself?
			return new Symbols(scene);
		}
		return this.symbolContext;
	}

	public setCompletionParticipants(registeredCompletionParticipants: ICompletionParticipant[]) {
		this.completionParticipants = registeredCompletionParticipants || [];
	}
	
	public doComplete(document: TextDocument, position: Position, scene: nodes.Scene, suggestSpelling: boolean = true): Promise<CompletionList> {
		this.offset = document.offsetAt(position);
		this.position = position;
		this.currentWord = getCurrentWord(document, this.offset);
		this.defaultReplaceRange = Range.create(Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
		this.textDocument = document;
		this.scene = scene;
		const result: CompletionList = { isIncomplete: false, items: [] };
		try {
			this.nodePath = nodes.getNodePath(this.scene, this.offset);

			for (let i = this.nodePath.length - 1; i >= 0; i--) {
				let node = this.nodePath[i];
				let parentRef = <nodes.VariableDeclaration>node.findParent(nodes.NodeType.VariableDeclaration);
				if (parentRef) {
					this.getCompletionsForVariableDeclaration(parentRef, document.uri, result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
				} /*else if (node.type === nodes.NodeType.Variable) {
					this.getVariableProposals(node, document.uri, result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
				}*/ else if (node.type === nodes.NodeType.LabelRef) {
					this.getLabelProposals(node, document.uri, result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
				} else if (node.type === nodes.NodeType.SceneRef) {
					this.getSceneProposals(node, document.uri, result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
				} else if (node.type === nodes.NodeType.Identifier) {
					this.getVariableProposals(node, document.uri, result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
				} else if (node.type === nodes.NodeType.Variable) {
					this.getVariableProposals(node, document.uri, result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
				} else if (node.hasIssue(ParseError.UnknownCommand)) {
					this.getCompletionsForCommands(result);
					return new Promise((resolve, reject) => {
						resolve(this.finalize(result));
					});
					// this.getCompletionForTopLevel(result);
					// } else if (node instanceof nodes.Variable) {
					// this.getCompletionsForVariableDeclaration()O
				}
			}
		} finally {
			// don't hold on any state, clear symbolContext
			this.position = null!;
			this.currentWord = null!;
			this.textDocument = null!;
			this.scene = null!;
			this.symbolContext = null!;
			this.defaultReplaceRange = null!;
			this.nodePath = null!;
		}
		return new Promise((resolve, reject) => {
			resolve(this.finalize(result));
		});
	}

	protected isImportPathParent(type: nodes.NodeType): boolean {
		return type === nodes.NodeType.Import;
	}

	private finalize(result: CompletionList): CompletionList {
		const needsSortText = result.items.some(i => !!i.sortText || i.label[0] === '-');
		if (needsSortText) {
			result.items.forEach((item, index) => {
				if (!item.sortText) {
					if (item.label[0] === '-') {
						item.sortText = SortTexts.VendorPrefixed + '_' + computeRankNumber(index);
					} else {
						item.sortText = SortTexts.Normal + '_' + computeRankNumber(index);
					}
				} else {
					if (item.label[0] === '-') {
						item.sortText += SortTexts.VendorPrefixed + '_' + computeRankNumber(index);
					} else {
						item.sortText += SortTexts.Normal + '_' + computeRankNumber(index);
					}
				}
			});
		}
		return result;
	}

	private findInNodePath(...types: nodes.NodeType[]) {
		for (let i = this.nodePath.length - 1; i >= 0; i--) {
			const node = this.nodePath[i];
			if (types.indexOf(node.type) !== -1) {
				return node;
			}
		}
		return null;
	}

	private valueTypes = [
		nodes.NodeType.Identifier, nodes.NodeType.Value, nodes.NodeType.StringLiteral, nodes.NodeType.NumericValue,
		nodes.NodeType.HexColorValue, nodes.NodeType.PrintVariable,
	];

	public getCompletionsForIdentifier(result: CompletionList): CompletionList {
		let commands = languageFacts.getCommands().filter((cmd: languageFacts.IEntry): boolean => {
			return this.currentWord.slice(0, 1) === cmd.name.slice(0, 1);
		});
		for (var _i = 0, _a = commands; _i < _a.length; _i++) {
			result.items.push({
				label: _a[_i].name,
				detail: "(command)",
				documentation: "TBD",
				textEdit: TextEdit.replace(this.getCompletionRange(null), _a[_i].name),
				kind: CompletionItemKind.Keyword
			});
		}
		return result;
	}

	public getCompletionsForCommands(result: CompletionList): CompletionList {
		let commands = languageFacts.getCommands().filter((cmd: languageFacts.IEntry): boolean => {
			return this.currentWord.slice(0, 1) === cmd.name.slice(0, 1);
		});
		for (var _i = 0, _a = commands; _i < _a.length; _i++) {
			result.items.push({
				label: _a[_i].name,
				detail: "(command)",
				documentation: "TBD",
				textEdit: TextEdit.replace(this.getCompletionRange(null), _a[_i].name),
				kind: CompletionItemKind.Keyword
			});
		}
		return result;
	}

	public getSuggestionsForSpellings(result: CompletionList): Promise<CompletionList> {
		let self = this;
		let word = this.currentWord;
		let editRange = this.getCompletionRange(null);
		return new Promise((resolve, reject) => {
			if (this.typo.working) {
				reject(result); // TODO: Reject reason
			} else {
				this.typo.working = true;
				this.typo.suggest(word, 5, function(suggestions: string[]) {
					var result: { isIncomplete: boolean, items: CompletionItem[] } = {
						items: [],
						isIncomplete: false
					};
					// defaults
					const ignoreForSession: CompletionItem = {
						label: "Ignore '" + word + "' this session.",
						documentation: "",
						textEdit: null!,
						filterText: word,
						sortText: 'b', // second
						insertText: word,
						kind: CompletionItemKind.Property
					};
					const addToDic: CompletionItem = {
						label: "Add '" + word + "' to user dictionary.",
						documentation: "",
						textEdit: null!,
						filterText: word,
						sortText: 'c', // third
						insertText: word,
						kind: CompletionItemKind.Property,
						command: { command: 'editor.action.triggerSuggest', title: '123'}
					};
					const noSuggestions: CompletionItem = {
						label: "No spelling suggestions for '" + word + "'.",
						documentation: "",
						textEdit: null!,
						insertText: word,
						kind: CompletionItemKind.Keyword
					};
					if (suggestions.length < 1) {
						result.items.push(noSuggestions);
					} else {
						result.items = result.items.concat(suggestions.map(function(suggestion) {
							return {
								label: suggestion,
								detail: "spelling suggestion",
								textEdit: TextEdit.replace(editRange, suggestion),
								filterText: word,
								sortText: 'a', // top
								insertText: suggestion,
								kind: CompletionItemKind.Text
							};
						}));
					}
					result.items.push(ignoreForSession, addToDic);
					self.typo.working = false;
					resolve(result);
				});
			}
		});
	}

	public getCSSWideKeywordProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const keywords in languageFacts.cssWideKeywords) {
			result.items.push({
				label: keywords,
				documentation: languageFacts.cssWideKeywords[keywords],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), keywords),
				kind: CompletionItemKind.Keyword
			});
		}
		return result;
	}

	public getLabelProposals(existingNode: nodes.Node, sceneUri: string, result: CompletionList) {
		let labels: Symbol[] = [];
		let labelRef = <nodes.LabelRef>existingNode;
		let sceneRef: nodes.SceneRef | null;
		if (sceneRef = labelRef.scene) {
			let targetScene = ChoiceScriptIndexer.index.getProjectIndexForScene(sceneUri)?.getSceneNodeByName(labelRef.scene.getText());
			if (targetScene) {
				labels = this.getSymbolContext(targetScene)?.findSymbolsAtOffset(0, nodes.ReferenceType.Label);
			}
		} else {
			labels = this.getSymbolContext().findSymbolsAtOffset(0, nodes.ReferenceType.Label);
		}

		labels = labels.filter((l) => l.name.indexOf(existingNode.getText()) === 0);

		for (let l of labels) {
			const suggest: CompletionItem = {
				label: l.name,
				documentation: l.value ? strings.getLimitedString(l.value) : l.value,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), l.name),
				kind: CompletionItemKind.Function,
				sortText: SortTexts.Label
			};
			result.items.push(suggest);
		}
		return result;
	}

	public getSceneProposals(existingNode: nodes.Node, sceneUri: string, result: CompletionList) {
		let scenes : string[] | undefined = ChoiceScriptIndexer.index.getProjectIndexForScene(sceneUri)?.getSceneList();
		if (!scenes) {
			return result;
		}
		scenes = scenes.filter((s) => s.indexOf(existingNode.getText()) === 0); // TODO should we *not* suggest ourself?
		for (let s of scenes) {
			const suggest: CompletionItem = {
				label: s,
				documentation: "",
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), s),
				kind: CompletionItemKind.File,
				sortText: SortTexts.Normal
			};
			result.items.push(suggest);
		}
		return result;
	}

	public getVariableProposals(existingNode: nodes.Node, sceneUri: string, result: CompletionList): CompletionList {
		let globalVars : Symbol[] = [], vars : Symbol[] = [];

		// Grab local definitions
		vars = this.getSymbolContext().findSymbolsAtOffset(0, nodes.ReferenceType.Variable);
	
		// Grab global definitions (if we can)
		let startupScene = ChoiceScriptIndexer.index.getProjectIndexForScene(sceneUri)?.getSceneNodeByName("startup");
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
		vars = vars.filter((v) => v.name.indexOf(existingNode.getText()) === 0);

		for (let v of vars) {
			const suggest: CompletionItem = {
				label: v.name,
				documentation: v.value ? strings.getLimitedString(v.value) : v.value,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), v.name),
				kind: CompletionItemKind.Variable,
				sortText: SortTexts.Variable
			};
			result.items.push(suggest);
		}
		return result;
	}

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

	public getUnitProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		let currentWord = '0';
		if (this.currentWord.length > 0) {
			const numMatch = this.currentWord.match(/^-?\d[\.\d+]*/);
			if (numMatch) {
				currentWord = numMatch[0];
				result.isIncomplete = currentWord.length === this.currentWord.length;
			}
		} else if (this.currentWord.length === 0) {
			result.isIncomplete = true;
		}
		if (existingNode && existingNode.parent && existingNode.parent.type === nodes.NodeType.Term) {
			existingNode = existingNode.getParent(); // include the unary operator
		}
		if (entry.restrictions) {
			for (const restriction of entry.restrictions) {
				const units = languageFacts.units[restriction];
				if (units) {
					for (const unit of units) {
						const insertText = currentWord + unit;
						result.items.push({
							label: insertText,
							textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
							kind: CompletionItemKind.Unit
						});
					}
				}
			}
		}
		return result;
	}

	protected getCompletionRange(existingNode: nodes.Node | null) {
		if (existingNode && existingNode.offset <= this.offset && this.offset <= existingNode.end) {
			const end = existingNode.end !== -1 ? this.textDocument.positionAt(existingNode.end) : this.position;
			const start = this.textDocument.positionAt(existingNode.offset);
			if (start.line === end.line) {
				return Range.create(start, end); // multi line edits are not allowed
			}
		}
		return this.defaultReplaceRange;
	}

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

	protected getPositionProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const position in languageFacts.positionKeywords) {
			result.items.push({
				label: position,
				documentation: languageFacts.positionKeywords[position],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), position),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getRepeatStyleProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const repeat in languageFacts.repeatStyleKeywords) {
			result.items.push({
				label: repeat,
				documentation: languageFacts.repeatStyleKeywords[repeat],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), repeat),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getLineStyleProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const lineStyle in languageFacts.lineStyleKeywords) {
			result.items.push({
				label: lineStyle,
				documentation: languageFacts.lineStyleKeywords[lineStyle],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineStyle),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getLineWidthProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const lineWidth of languageFacts.lineWidthKeywords) {
			result.items.push({
				label: lineWidth,
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineWidth),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getGeometryBoxProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const box in languageFacts.geometryBoxKeywords) {
			result.items.push({
				label: box,
				documentation: languageFacts.geometryBoxKeywords[box],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getBoxProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const box in languageFacts.boxKeywords) {
			result.items.push({
				label: box,
				documentation: languageFacts.boxKeywords[box],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
				kind: CompletionItemKind.Value
			});
		}
		return result;
	}

	protected getImageProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const image in languageFacts.imageFunctions) {
			const insertText = moveCursorInsideParenthesis(image);
			result.items.push({
				label: image,
				documentation: languageFacts.imageFunctions[image],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Function,
				insertTextFormat: image !== insertText ? SnippetFormat : void 0
			});
		}
		return result;
	}

	protected getTimingFunctionProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const timing in languageFacts.transitionTimingFunctions) {
			const insertText = moveCursorInsideParenthesis(timing);
			result.items.push({
				label: timing,
				documentation: languageFacts.transitionTimingFunctions[timing],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Function,
				insertTextFormat: timing !== insertText ? SnippetFormat : void 0
			});
		}
		return result;
	}

	protected getBasicShapeProposals(entry: languageFacts.IEntry, existingNode: nodes.Node | null, result: CompletionList): CompletionList {
		for (const shape in languageFacts.basicShapeFunctions) {
			const insertText = moveCursorInsideParenthesis(shape);
			result.items.push({
				label: shape,
				documentation: languageFacts.basicShapeFunctions[shape],
				textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
				kind: CompletionItemKind.Function,
				insertTextFormat: shape !== insertText ? SnippetFormat : void 0
			});
		}
		return result;
	}

	public getCompletionsForVariableDeclaration(declaration: nodes.VariableDeclaration, sceneUri: string, result: CompletionList): CompletionList {
		if (declaration.hasIssue(ParseError.VariableNameExpected)) {
			this.getVariableProposals(declaration.getExpr()!, sceneUri, result);
		}
		return result;
	}

	public getCompletionForUriLiteralValue(uriLiteralNode: nodes.Node, result: CompletionList): CompletionList {
		let uriValue: string;
		let position: Position;
		let range: Range;
		// No children, empty value
		if (!uriLiteralNode.hasChildren()) {
			uriValue = '';
			position = this.position;
			const emptyURIValuePosition = this.textDocument.positionAt(uriLiteralNode.offset + 'url('.length);
			range = Range.create(emptyURIValuePosition, emptyURIValuePosition);
		} else {
			const uriValueNode = uriLiteralNode.getChild(0)!;
			uriValue = uriValueNode.getText();
			position = this.position;
			range = this.getCompletionRange(uriValueNode);
		}
		this.completionParticipants.forEach(participant => {
			if (participant.onCssURILiteralValue) {
				participant.onCssURILiteralValue({
					uriValue,
					position,
					range
				});
			}
		});

		return result;
	}

	public getCompletionForImportPath(importPathNode: nodes.Node, result: CompletionList): CompletionList {
		this.completionParticipants.forEach(participant => {
			if (participant.onCssImportPath) {
				participant.onCssImportPath({
					pathValue: importPathNode.getText(),
					position: this.position,
					range: this.getCompletionRange(importPathNode)
				});
			}
		});
		return result;
	}

	private doesSupportMarkdown() {
		if (!isDefined(this.supportsMarkdown)) {
			if (!isDefined(this.clientCapabilities)) {
				this.supportsMarkdown = true;
				return this.supportsMarkdown;
			}

			const completion = this.clientCapabilities.textDocument && this.clientCapabilities.textDocument.completion;
			this.supportsMarkdown = completion && completion.completionItem && Array.isArray(completion.completionItem.documentationFormat) && completion.completionItem.documentationFormat.indexOf(MarkupKind.Markdown) !== -1;
		}
		return <boolean>this.supportsMarkdown;
	}
}

/**
 * Rank number should all be same length strings
 */
function computeRankNumber(n: Number): string {
	const nstr = n.toString();
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

class Set {
	private entries: { [key: string]: boolean } = {};
	public add(entry: string): void {
		this.entries[entry] = true;
	}
	public getEntries(): string[] {
		return Object.keys(this.entries);
	}
}

function moveCursorInsideParenthesis(text: string): string {
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

function getCurrentWord(document: TextDocument, offset: number): string {
	let i = offset - 1;
	const text = document.getText();
	while (i >= 0 && ' \t\n\r":{[()]},*>+'.indexOf(text.charAt(i)) === -1) {
		i--;
	}
	return text.substring(i + 1, offset);
}