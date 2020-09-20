/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from './cssNodes';

import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();

export class CSIssueType implements nodes.IRule {
	id: string;
	message: string;

	public constructor(id: string, message: string) {
		this.id = id;
		this.message = message;
	}
}

export let ParseError = {
	ExpectedScene: new CSIssueType('cs-expectedScene', localize('expected.scene', "Expected a scene name or string expression")),	
	ExpectedLabel: new CSIssueType('cs-expectedLabel', localize('expected.label', "Expected a label name or string expression")),	
	GenericSyntaxError: new CSIssueType('cs-genericSyntaxError', localize('generic.syntax.error', "Syntax error")),
	WrongIndentationUnit: new CSIssueType('cs-wrongindentunit', localize('indentunit.error', "Incorrect indentation unit")),
	IndentationError: new CSIssueType('cs-indentationError', localize('indentation.error', "Incorrect indentation")),
	MixedIndentation: new CSIssueType('cs-mixedIndentation', localize('mixed.indentation', "Mixed indentation units (spaces/tabs)")),
	ExpectedChoiceOption: new CSIssueType('cs-expectedchoiceoption', localize('expected.choice.option', "Expected Choice option starting with a hash '#'")),
	UnknownCommand: new CSIssueType('cs-unknowncommand', localize('unknown.command', "unknown command")),
	NoChoiceOption: new CSIssueType('cs-nochoiceoption', localize('no.choice.command', "expected at least one choice option")),
	NotEnoughMultiReplaceOptions: new CSIssueType('cs-notenoughmultireplaceopts', localize('notenough.multi.command', "there should be at least one pipe '|' to separate at least two options")),
	NumberExpected: new CSIssueType('cs-numberexpected', localize('expected.number', "number expected")),
	ConditionExpected: new CSIssueType('cs-conditionexpected', localize('expected.condt', "condition expected")),
	RuleOrSelectorExpected: new CSIssueType('cs-ruleorselectorexpected', localize('expected.ruleorselector', "at-rule or selector expected")),
	InvalidVariableFormatOption: new CSIssueType('cs-invalid-variable-format', localize('invalid.variableformat', "Valid format options are '!' or '!!'")),
	DotExpected: new CSIssueType('cs-dotexpected', localize('expected.dot', "dot expected")),
	ColonExpected: new CSIssueType('cs-colonexpected', localize('expected.colon', "colon expected")),
	NoCloseQuote: new CSIssueType('cs-noclosequote', localize('no.close.quote', "Invalid string, expected a closing quotation: '\"'")),
	SemiColonExpected: new CSIssueType('cs-semicolonexpected', localize('expected.semicolon', "semi-colon expected")),
	TermExpected: new CSIssueType('cs-termexpected', localize('expected.term', "term expected")),
	ExpressionExpected: new CSIssueType('cs-expressionexpected', localize('expected.expression', "expression expected")),
	OperatorExpected: new CSIssueType('cs-operatorexpected', localize('expected.operator', "operator expected")),
	IdentifierExpected: new CSIssueType('cs-identifierexpected', localize('expected.ident', "identifier expected")),
	PercentageExpected: new CSIssueType('cs-percentageexpected', localize('expected.percentage', "percentage expected")),
	URIOrStringExpected: new CSIssueType('cs-uriorstringexpected', localize('expected.uriorstring', "uri or string expected")),
	URIExpected: new CSIssueType('cs-uriexpected', localize('expected.uri', "URI expected")),
	LabelNameExpected: new CSIssueType('cs-labelnamexpected', localize('expected.labelname', "label name expected")),
	VariableNameExpected: new CSIssueType('cs-varnameexpected', localize('expected.varname', "variable name expected")),
	VariableValueExpected: new CSIssueType('cs-varvalueexpected', localize('expected.varvalue', "variable value expected")),
	PropertyValueExpected: new CSIssueType('cs-propertyvalueexpected', localize('expected.propvalue', "property value expected")),
	LeftCurlyExpected: new CSIssueType('cs-lcurlyexpected', localize('expected.lcurly', "{ expected")),
	UnbalancedBrackets: new CSIssueType('cs-unbalancedbrackets', localize('expected.lcurly', "Unbalanced Brackets")),
	RightCurlyExpected: new CSIssueType('cs-rcurlyexpected', localize('expected.rcurly', "} expected")),
	LeftSquareBracketExpected: new CSIssueType('cs-rbracketexpected', localize('expected.lsquare', "[ expected")),
	RightSquareBracketExpected: new CSIssueType('cs-lbracketexpected', localize('expected.rsquare', "] expected")),
	LeftParenthesisExpected: new CSIssueType('cs-lparentexpected', localize('expected.lparen', "( expected")),
	RightParenthesisExpected: new CSIssueType('cs-rparentexpected', localize('expected.rparent', ") expected")),
	CommaExpected: new CSIssueType('cs-commaexpected', localize('expected.comma', "comma expected")),
	PageDirectiveOrDeclarationExpected: new CSIssueType('cs-pagedirordeclexpected', localize('expected.pagedirordecl', "page directive or declaraton expected")),
	UnknownAtRule: new CSIssueType('cs-unknownatrule', localize('unknown.atrule', "at-rule unknown")),
	SelectorExpected: new CSIssueType('cs-selectorexpected', localize('expected.selector', "selector expected")),
	StringLiteralExpected: new CSIssueType('cs-stringliteralexpected', localize('expected.stringliteral', "string literal expected")),
	WhitespaceExpected: new CSIssueType('cs-whitespaceexpected', localize('expected.whitespace', "whitespace expected")),
	MediaQueryExpected: new CSIssueType('cs-mediaqueryexpected', localize('expected.mediaquery', "media query expected")),
	IdentifierOrWildcardExpected: new CSIssueType('cs-idorwildcardexpected', localize('expected.idorwildcard', "identifier or wildcard expected")),
	WildcardExpected: new CSIssueType('cs-wildcardexpected', localize('expected.wildcard', "wildcard expected")),
	IdentifierOrVariableExpected: new CSIssueType('cs-idorvarexpected', localize('expected.idorvar', "identifier or variable expected")),
};
