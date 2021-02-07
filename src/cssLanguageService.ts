/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ChoiceScriptParser } from './parser/ChoiceScriptParser';
import { ChoiceScriptIndexer, ChoiceScriptProjectIndex } from './parser/ChoiceScriptIndexer';
import { ChoiceScriptCompletion } from './services/ChoiceScriptCompletion';
import { ChoiceScriptHover } from './services/ChoiceScriptHover';
import { ChoiceScriptNavigation } from './services/ChoiceScriptNavigation';
//import { ChoiceScriptCodeActions } from './services/cssCodeActions';
import { ChoiceScriptValidation } from './services/ChoiceScriptValidation';

import { Parser } from './parser/cssParser';
import { CSSCompletion } from './services/cssCompletion';
import { CSSHover } from './services/cssHover';
import { CSSNavigation } from './services/cssNavigation';
import { CSSCodeActions } from './services/cssCodeActions';
import { CSSValidation } from './services/cssValidation';

import { SCSSParser } from './parser/scssParser';
import { SCSSCompletion } from './services/scssCompletion';
import { LESSParser } from './parser/lessParser';
import { LESSCompletion } from './services/lessCompletion';
import { getFoldingRanges } from './services/cssFolding';

import {
	LanguageSettings, ICompletionParticipant, DocumentContext, LanguageServiceOptions,
	Diagnostic, Position, CompletionList, Hover, Location, DocumentHighlight, DocumentLink,
	SymbolInformation, Range, CodeActionContext, Command, CodeAction, ColorInformation,
	Color, ColorPresentation, WorkspaceEdit, FoldingRange, SelectionRange, TextDocument, ICSSDataProvider, CSSDataV1, ChoiceScriptLanguageSettings, DocumentUri, HoverSettings, CompletionSettings

} from './cssLanguageTypes';

import { CSSDataManager } from './languageFacts/dataManager';
import { CSSDataProvider } from './languageFacts/dataProvider';
import { getSelectionRanges } from './services/cssSelectionRange';
import { SCSSNavigation } from './services/scssNavigation';
import { Stylesheet as StyleSheetImpl } from './parser/cssNodes';
import { Scene } from './parser/ChoiceScriptNodes';
import { URI } from 'vscode-uri';
import { cssData } from './data/webCustomData';

export type Stylesheet = {};
export * from './cssLanguageTypes';

export interface LanguageService {
	configure(raw?: LanguageSettings): void;
	setDataProviders(useDefaultDataProvider: boolean, customDataProviders: ICSSDataProvider[]): void;
	doValidation(document: TextDocument, stylesheet: Stylesheet, documentSettings?: LanguageSettings): Diagnostic[];
	parseStylesheet(document: TextDocument): Stylesheet;
	doComplete(document: TextDocument, position: Position, stylesheet: Stylesheet, settings?: CompletionSettings): CompletionList;
	doComplete2(document: TextDocument, position: Position, stylesheet: Stylesheet, documentContext: DocumentContext, settings?: CompletionSettings): Promise<CompletionList>;
	setCompletionParticipants(registeredCompletionParticipants: ICompletionParticipant[]): void;
	doHover(document: TextDocument, position: Position, stylesheet: Stylesheet, settings?: HoverSettings): Hover | null;
	findDefinition(document: TextDocument, position: Position, stylesheet: Stylesheet): Location | null;
	findReferences(document: TextDocument, position: Position, stylesheet: Stylesheet): Location[];
	findDocumentHighlights(document: TextDocument, position: Position, stylesheet: Stylesheet): DocumentHighlight[];
	findDocumentLinks(document: TextDocument, stylesheet: Stylesheet, documentContext: DocumentContext): DocumentLink[];
	/**
	 * Return statically resolved links, and dynamically resolved links if `fsProvider` is proved.
	 */
	findDocumentLinks2(document: TextDocument, stylesheet: Stylesheet, documentContext: DocumentContext): Promise<DocumentLink[]>;
	findDocumentSymbols(document: TextDocument, stylesheet: Stylesheet): SymbolInformation[];
	doCodeActions(document: TextDocument, range: Range, context: CodeActionContext, stylesheet: Stylesheet): Command[];
	doCodeActions2(document: TextDocument, range: Range, context: CodeActionContext, stylesheet: Stylesheet): CodeAction[];
	findDocumentColors(document: TextDocument, stylesheet: Stylesheet): ColorInformation[];
	getColorPresentations(document: TextDocument, stylesheet: Stylesheet, color: Color, range: Range): ColorPresentation[];
	doRename(document: TextDocument, position: Position, newName: string, stylesheet: Stylesheet): WorkspaceEdit;
	getFoldingRanges(document: TextDocument, context?: { rangeLimit?: number; }): FoldingRange[];
	getSelectionRanges(document: TextDocument, positions: Position[], stylesheet: Stylesheet): SelectionRange[];
}

export function getDefaultCSSDataProvider(): ICSSDataProvider {
	return newCSSDataProvider(cssData);
}

export function newCSSDataProvider(data: CSSDataV1): ICSSDataProvider {
	return new CSSDataProvider(data);
}

function createFacade(parser: Parser, completion: CSSCompletion, hover: CSSHover, navigation: CSSNavigation, codeActions: CSSCodeActions, validation: CSSValidation, cssDataManager: CSSDataManager): LanguageService {
	return {
		configure: (settings) => {
			validation.configure(settings);
			completion.configure(settings?.completion);
			hover.configure(settings?.hover);
		},
		setDataProviders: cssDataManager.setDataProviders.bind(cssDataManager),
		doValidation: validation.doValidation.bind(validation),
		parseStylesheet: parser.parseStylesheet.bind(parser),
		doComplete: completion.doComplete.bind(completion),
		doComplete2: completion.doComplete2.bind(completion),
		setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
		doHover: hover.doHover.bind(hover),
		findDefinition: navigation.findDefinition.bind(navigation),
		findReferences: navigation.findReferences.bind(navigation),
		findDocumentHighlights: navigation.findDocumentHighlights.bind(navigation),
		findDocumentLinks: navigation.findDocumentLinks.bind(navigation),
		findDocumentLinks2: navigation.findDocumentLinks2.bind(navigation),
		findDocumentSymbols: navigation.findDocumentSymbols.bind(navigation),
		doCodeActions: codeActions.doCodeActions.bind(codeActions),
		doCodeActions2: codeActions.doCodeActions2.bind(codeActions),
		findDocumentColors: navigation.findDocumentColors.bind(navigation),
		getColorPresentations: navigation.getColorPresentations.bind(navigation),
		doRename: navigation.doRename.bind(navigation),
		getFoldingRanges,
		getSelectionRanges
	};
}

const defaultLanguageServiceOptions = {};

export function getCSSLanguageService(options: LanguageServiceOptions = defaultLanguageServiceOptions): LanguageService {
	const cssDataManager = new CSSDataManager(options);
	return createFacade(
		new Parser(),
		new CSSCompletion(null, options, cssDataManager),
		new CSSHover(options && options.clientCapabilities, cssDataManager),
		new CSSNavigation(options && options.fileSystemProvider),
		new CSSCodeActions(cssDataManager),
		new CSSValidation(cssDataManager),
		cssDataManager
	);
}

export function getSCSSLanguageService(options: LanguageServiceOptions = defaultLanguageServiceOptions): LanguageService {
	const cssDataManager = new CSSDataManager(options);
	return createFacade(
		new SCSSParser(),
		new SCSSCompletion(options, cssDataManager),
		new CSSHover(options && options.clientCapabilities, cssDataManager),
		new SCSSNavigation(options && options.fileSystemProvider),
		new CSSCodeActions(cssDataManager),
		new CSSValidation(cssDataManager),
		cssDataManager
	);
}

export function getLESSLanguageService(options: LanguageServiceOptions = defaultLanguageServiceOptions): LanguageService {
	const cssDataManager = new CSSDataManager(options);
	return createFacade(
		new LESSParser(),
		new LESSCompletion(options, cssDataManager),
		new CSSHover(options && options.clientCapabilities, cssDataManager),
		new CSSNavigation(options && options.fileSystemProvider),
		new CSSCodeActions(cssDataManager),
		new CSSValidation(cssDataManager),
		cssDataManager
	);
}

export function getChoiceScriptLanguageService(options?: LanguageServiceOptions): ChoiceScriptLanguageService {
	const choicescriptDataManager = new CSSDataManager(options);
	return createChoiceScriptFacade(
		new ChoiceScriptParser(),
		new ChoiceScriptCompletion(null, options && options.clientCapabilities),
		new ChoiceScriptHover(options && options.clientCapabilities),
		new ChoiceScriptNavigation(),
		new ChoiceScriptValidation(),
		ChoiceScriptIndexer.index
	);
}

export interface ChoiceScriptLanguageService {
	configure(raw?: ChoiceScriptLanguageSettings): void;
	doValidation(document: TextDocument, stylesheet: Stylesheet, documentSettings?: LanguageSettings): Diagnostic[];
	parseScene(document: TextDocument): Scene;
	doComplete(document: TextDocument, position: Position, scene: Scene, suggestSpelling?: boolean): Promise<CompletionList>;
	setCompletionParticipants(registeredCompletionParticipants: ICompletionParticipant[]): void;
	doHover(document: TextDocument, position: Position, stylesheet: Stylesheet): Hover | null;
	findDefinition(localDocument: TextDocument, position: Position, localScene: Scene): Location | null;
	updateProject(scene: DocumentUri, resources?: TextDocument[], forceUpdate?: boolean): ChoiceScriptProjectIndex | null;
	purgeProject(scene: DocumentUri, resources?: DocumentUri[]): ChoiceScriptProjectIndex | null;
	findDocumentSymbols(document: TextDocument, scene: Scene, includeGlobals?: boolean): SymbolInformation[];
	findReferences(document: TextDocument, position: Position, scene: Scene): Location[];
	//findDocumentHighlights(document: TextDocument, position: Position, stylesheet: Stylesheet): DocumentHighlight[];
	//findDocumentLinks(document: TextDocument, stylesheet: Stylesheet, documentContext: DocumentContext): DocumentLink[];
	/**
	 * Return statically resolved links, and dynamically resolved links if `fsProvider` is proved.
	 */
	//findDocumentLinks2(document: TextDocument, stylesheet: Stylesheet, documentContext: DocumentContext): Promise<DocumentLink[]>;
	//doCodeActions(document: TextDocument, range: Range, context: CodeActionContext, stylesheet: Stylesheet): Command[];
	//doCodeActions2(document: TextDocument, range: Range, context: CodeActionContext, stylesheet: Stylesheet): CodeAction[];
	/**
	 * @deprecated use findDocumentColors instead
	 */
	//findColorSymbols(document: TextDocument, stylesheet: Stylesheet): Range[];
	//findDocumentColors(document: TextDocument, stylesheet: Stylesheet): ColorInformation[];
	//getColorPresentations(document: TextDocument, stylesheet: Stylesheet, color: Color, range: Range): ColorPresentation[];
	//doRename(document: TextDocument, position: Position, newName: string, stylesheet: Stylesheet): WorkspaceEdit;
	//getFoldingRanges(document: TextDocument, context?: { rangeLimit?: number; }): FoldingRange[];
	//getSelectionRanges(document: TextDocument, positions: Position[], stylesheet: Stylesheet): SelectionRange[];
}

function createChoiceScriptFacade(parser: ChoiceScriptParser, completion: ChoiceScriptCompletion, hover: ChoiceScriptHover, navigation: ChoiceScriptNavigation, validation: ChoiceScriptValidation, indexer: ChoiceScriptIndexer): ChoiceScriptLanguageService {
	return {
		configure: (settings) => {
			validation.configure(settings!);
			completion.configure(settings);
		},
		updateProject: indexer.sync.bind(indexer),
		purgeProject: indexer.purge.bind(indexer),
		doValidation: validation.doValidation.bind(validation),
		parseScene: parser.parseScene.bind(parser),
		doComplete: completion.doComplete.bind(completion),
		setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
		doHover: hover.doHover.bind(hover),
		findDefinition: navigation.findDefinitionGlobal.bind(navigation),
		findDocumentSymbols: navigation.findDocumentSymbols.bind(navigation),
		findReferences: navigation.findReferences.bind(navigation),
		//findDocumentHighlights: navigation.findDocumentHighlights.bind(navigation),
		//findDocumentLinks: navigation.findDocumentLinks.bind(navigation),
		//findDocumentLinks2: navigation.findDocumentLinks2.bind(navigation),
		//doCodeActions: codeActions.doCodeActions.bind(codeActions),
		//doCodeActions2: codeActions.doCodeActions2.bind(codeActions),
		//findColorSymbols: (d, s: StyleSheetImpl) => navigation.findDocumentColors(d, s).map(s => s.range),
		//findDocumentColors: navigation.findDocumentColors.bind(navigation),
		//getColorPresentations: navigation.getColorPresentations.bind(navigation),
		//doRename: navigation.doRename.bind(navigation),
		//getFoldingRanges,
		//getSelectionRanges
	};
}