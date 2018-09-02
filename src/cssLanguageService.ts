/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {
	TextDocument, Position, CompletionList, Hover, Range, SymbolInformation, Diagnostic, Location, DocumentHighlight,
	CodeActionContext, Command, WorkspaceEdit, Color, ColorInformation, ColorPresentation, FoldingRange, CodeAction, DocumentLink
} from 'vscode-languageserver-types';

import { Parser } from './parser/cssParser';
import { CSSCompletion } from './services/cssCompletion';
import { CSSHover } from './services/cssHover';
import { CSSNavigation } from './services/cssNavigation';
import { csSpellCheck } from './services/csSpellCheck';

import { LanguageSettings, ICompletionParticipant, DocumentContext } from './cssLanguageTypes';

export type Stylesheet = {};
export * from './cssLanguageTypes';
export * from 'vscode-languageserver-types';

export interface LanguageService {
	configure(raw: LanguageSettings): void;
	doSpellCheck(document: TextDocument, stylesheet: Stylesheet, documentSettings?: LanguageSettings): Diagnostic[];
	parseStylesheet(document: TextDocument): Stylesheet;
	doComplete(document: TextDocument, position: Position, stylesheet: Stylesheet): CompletionList;
	setCompletionParticipants(registeredCompletionParticipants: ICompletionParticipant[]): void;
	doHover(document: TextDocument, position: Position, stylesheet: Stylesheet): Hover | null;
	findDefinition(document: TextDocument, position: Position, stylesheet: Stylesheet): Location | null;
	findReferences(document: TextDocument, position: Position, stylesheet: Stylesheet): Location[];
	findDocumentHighlights(document: TextDocument, position: Position, stylesheet: Stylesheet): DocumentHighlight[];
	findDocumentLinks(document: TextDocument, stylesheet: Stylesheet, documentContext: DocumentContext): DocumentLink[];
	findDocumentSymbols(document: TextDocument, stylesheet: Stylesheet): SymbolInformation[];
	/** deprecated, use findDocumentColors instead */
	findColorSymbols(document: TextDocument, stylesheet: Stylesheet): Range[];
	findDocumentColors(document: TextDocument, stylesheet: Stylesheet): ColorInformation[];
	getColorPresentations(document: TextDocument, stylesheet: Stylesheet, color: Color, range: Range): ColorPresentation[];
	doRename(document: TextDocument, position: Position, newName: string, stylesheet: Stylesheet): WorkspaceEdit;
}

function createFacade(parser: Parser, completion: CSSCompletion, hover: CSSHover, navigation: CSSNavigation, spellcheck: csSpellCheck) {
	return {
		configure: spellcheck.configure.bind(spellcheck),
		doSpellCheck: spellcheck.doSpellCheck.bind(spellcheck),
		parseStylesheet: parser.parseStylesheet.bind(parser),
		doComplete: completion.doComplete.bind(completion),
		setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
		doHover: hover.doHover.bind(hover),
		findDefinition: navigation.findDefinition.bind(navigation),
		findReferences: navigation.findReferences.bind(navigation),
		findDocumentHighlights: navigation.findDocumentHighlights.bind(navigation),
		findDocumentLinks: navigation.findDocumentLinks.bind(navigation),
		findDocumentSymbols: navigation.findDocumentSymbols.bind(navigation),
		findColorSymbols: (d, s) => navigation.findDocumentColors(d, s).map(s => s.range),
		findDocumentColors: navigation.findDocumentColors.bind(navigation),
		getColorPresentations: navigation.getColorPresentations.bind(navigation),
		doRename: navigation.doRename.bind(navigation),
	};
}


export function getCSSLanguageService(): LanguageService {
	return createFacade(new Parser(), new CSSCompletion(), new CSSHover(), new CSSNavigation(), new csSpellCheck());
}