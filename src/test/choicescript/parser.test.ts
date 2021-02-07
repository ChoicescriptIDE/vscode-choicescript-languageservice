/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { readFileSync, readdirSync, fstat } from 'fs';
import { basename } from 'path';
import { ChoiceScriptParser } from '../../parser/ChoiceScriptParser';
import { TokenType } from '../../parser/ChoiceScriptScanner';
import * as nodes from '../../parser/ChoiceScriptNodes';
import { ParseError } from '../../parser/ChoiceScriptErrors';
import * as commands from '../../data/commands';
import { Rule } from '../../services/textRules';
import { Scene, ParseErrorCollector, IRule, Level, Node, IMarker } from '../../parser/ChoiceScriptNodes';
import {
	TextDocument
} from '../../cssLanguageService';
import { Range } from 'vscode-languageserver-types';
import { fork } from 'child_process';

export function assertNode(text: string, parser: ChoiceScriptParser, f: (...args: any[]) => nodes.Node | null): nodes.Node {
	let node = parser.internalParse(text, f)!;
	assert.ok(node !== null, 'no node returned');
	let markers = nodes.ParseErrorCollector.entries(node);
	if (markers.length > 0) {
		console.log(markers, node);
		assert.ok(false, ('node has error -\n\t' + markers[0].getMessage() + ', offset: ' + markers[0].getNode().offset + ' when parsing:\n' + text));
	}
	assert.ok(parser.accept(TokenType.EOF), 'Scanner is not at EOF: ' + parser.token.text + ' (' + parser.token.offset + ')');
	return node;
}

export function assertFunction(text: string, parser: ChoiceScriptParser, f: () => nodes.Node | null): void {
	assertNode(text, parser, f);
}

export function assertNoNode(text: string, parser: ChoiceScriptParser, f: () => nodes.Node | null): void {
	let node = parser.internalParse(text, f)!;
	assert.ok(node === null);
}

export function assertError(text: string, parser: ChoiceScriptParser, f: () => nodes.Node | null, error: nodes.IRule): void {
	let node = parser.internalParse(text, f)!;
	assert.ok(node !== null, 'no node returned');
	let markers = nodes.ParseErrorCollector.entries(node);
	if (markers.length === 0) {
		assert.ok(false, 'no errors but error expected: ' + error.message);
	} else {
		markers = markers.sort((a, b) => { return a.getOffset() - b.getOffset(); });
		assert.equal(markers[0].getRule().id, error.id, 'incorrect error returned from parsing: ' + text);
	}
}

suite('Text - Parser', () => {
	test('Text and Real Words', function () {
		let parser = new ChoiceScriptParser();
		assertNode('The mighty dragon roared', parser, parser._parseLine.bind(parser));
		assertNode('Let\'s', parser, parser._parseWord.bind(parser));
		assertNode('Hello', parser, parser._parseWord.bind(parser));
		assertNode('\'No way,\' he exclaimed!', parser, parser._parseLine.bind(parser));
		// blank lines
		assertNode(' \n', parser, parser._parseLine.bind(parser));
		assertNode('\n', parser, parser._parseLine.bind(parser));
		assertNode(' ', parser, parser._parseLine.bind(parser));
		assertNode('', parser, parser._parseLine.bind(parser));
	});
});

suite('ChoiceScript - Parser', () => {

	test('scene', function () {
		let parser = new ChoiceScriptParser();
		assertNode('*choice\n\t#Option1\n\t#Option2', parser, parser._parseScene.bind(parser));
		assertNode('#option1', parser, parser._parseScene.bind(parser));
		assertNode('#option2', parser, parser._parseScene.bind(parser));
		assertNode('TextLine TextLine TextLine', parser, parser._parseScene.bind(parser));
		assertNode('${variable}', parser, parser._parseScene.bind(parser));
		assertNode('*create myvar false', parser, parser._parseScene.bind(parser));
		assertNode('*temp magic 5', parser, parser._parseScene.bind(parser));
		assertNode('*set magic infinity', parser, parser._parseScene.bind(parser));
	});

	test('operator', function () {
		let parser = new ChoiceScriptParser();
		assertNode('/', parser, parser._parseNumericalOperator.bind(parser));
		assertNode('*', parser, parser._parseNumericalOperator.bind(parser));
		assertNode('+', parser, parser._parseNumericalOperator.bind(parser));
		assertNode('-', parser, parser._parseNumericalOperator.bind(parser));
		assertNode('modulo', parser, parser._parseNamedCSOperator.bind(parser));
	});

	test('variables', function() {
		let parser = new ChoiceScriptParser();
		assertNode('test', parser, parser._parseVariable.bind(parser));
		assertNode('value', parser, parser._parseVariable.bind(parser));
		assertNode('*temp valuelesstemp', parser, parser._parseVariableDeclaration.bind(parser));
		assertNode('*temp my_val 4', parser, parser._parseVariableDeclaration.bind(parser));
		assertNode('*create completed false', parser, parser._parseVariableDeclaration.bind(parser));
		assertError('*create varwithoutvalue', parser, parser._parseVariableDeclaration.bind(parser), ParseError.VariableValueExpected);
	});

	test('labels', function() {
		/* tslint:disable */
		this.skip();
		/* tslint:enable */
		/*
		let parser = new ChoiceScriptParser();
		assertNode('*label my_label', parser, parser._parseLabelDeclaration.bind(parser));
		assertNode('*label _my_private_label', parser, parser._parseLabelDeclaration.bind(parser));
		assertError('*label', parser, parser._parseLabelDeclaration.bind(parser), ParseError.LabelNameExpected);
		*/
	});

	/*test('string literals', function () {
		let parser = new Parser();
		assertNode('"My name is"', parser, parser._parseStringLiteral.bind(parser));
		assertNode('"I"', parser, parser._parseStringLiteral.bind(parser));
		assertNode('""', parser, parser._parseStringLiteral.bind(parser));
		assertNode('"Broken literal', parser, parser._parseStringLiteral.bind(parser));
	});*/

	// This is basically just duplicating basic commands atm...
	test('ChoiceScript statement', function () {
		let parser = new ChoiceScriptParser();
		assertError('*temp', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.VariableNameExpected);
		assertError('*create', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.VariableNameExpected);
		assertNode('*set my_var "string"', parser, parser._parseChoiceScriptStatement.bind(parser));
		// Even invalid commands from CS statements:
		assertError('*qeif', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);
		assertError('*c', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);
		assertError('*label', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.LabelNameExpected);
	});


	test('Valid commands', function () {
		let parser = new ChoiceScriptParser();

		// A few valid examples:
		assertNode('*set my_var 5', parser, parser._parseChoiceScriptStatement.bind(parser));
		assertNode('*goto mylabel', parser, parser._parseChoiceScriptStatement.bind(parser));
		assertNode('*gosub myroutine', parser, parser._parseChoiceScriptStatement.bind(parser));
		assertNode('*rand', parser, parser._parseChoiceScriptStatement.bind(parser));

		// And invalid:
		assertError('*sets', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);
		assertError('*win', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);
		assertError('*do_nothing', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);
		assertError('*create_array', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);
		assertError('*_command', parser, parser._parseChoiceScriptStatement.bind(parser), ParseError.UnknownCommand);

		// Asterisks followed by non-letters should be text lines rather than unknown commands
		assertNoNode('*-', parser, parser._parseChoiceScriptStatement.bind(parser));
		assertNode('**', parser, parser._parseLine.bind(parser));

	});

	test('flow commands', function () {
		let parser = new ChoiceScriptParser();

		// A few valid examples:
		assertNode('*label', parser, parser._parseFlowCommand.bind(parser));
		assertNode('*goto mylabel', parser, parser._parseFlowCommand.bind(parser));
		assertNode('*gosub myroutine', parser, parser._parseFlowCommand.bind(parser));
		assertNode('*goto_scene myscene', parser, parser._parseFlowCommand.bind(parser));

		// And invalid:
		assertNoNode('*set', parser, parser._parseFlowCommand.bind(parser));
		assertNoNode('*create', parser, parser._parseFlowCommand.bind(parser));
		assertNoNode('*rand', parser, parser._parseFlowCommand.bind(parser));
		assertNoNode('*if', parser, parser._parseFlowCommand.bind(parser));
	});

	test('Choice Options', function() {
		/* tslint:disable */
		this.skip();
		/* tslint:enable */
		let parser = new ChoiceScriptParser("auto");
		assertNode('*if true\n  Do something\n  *else\n  Don\'t do something', parser, parser._parseIfBlock.bind(parser));
		assertNode('*if true\n  Do something', parser, parser._parseIfBlock.bind(parser));
	});

	test('Choice Options', function() {
		/* tslint:disable */
		this.skip();
		/* tslint:enable */
		let parser = new ChoiceScriptParser("auto");
		assertNode('*fake_choice\n  #option_space\n  #option_space2\n', parser, parser._parseChoiceCommand.bind(parser));

		/*
		let parser = new ChoiceScriptParser("auto");
		assertNode('*choice\n  #option_space', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n  #option_space\n    ...\n  #two options\n    ...', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n  *if (true) #tab!\n  #tab it\n', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n  *selectable_if (true) #tab!\n    #tab it\n', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n\t*hide_reuse #tab!    #tab!\n    *allow_reuse #tab it\n', parser, parser._parseChoiceCommand.bind(parser));

		parser = new ChoiceScriptParser("tabs", 1);
		assertNode('*choice\n\t#tab!\n\t#tab it\n', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n\t*if (true)\n\t\t#tab!\n\t\t#tab it\n', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n\t*selectable_if (true) #tab!\n\t#tab it\n', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n\t*allow_reuse #tab!\n\t#tab it\n', parser, parser._parseChoiceCommand.bind(parser));

		// Scanner is not at EOF:
		assertNode('*choice\n\t*if var and var2\n\t\t#Option1\n\t\t\t...\n\t*if (var3 = false) and var4\n\t\t#Option2\n\t\t\t...\n', parser, parser._parseChoiceCommand.bind(parser));
		assertNode('*choice\n\t*if not(var)\n\t\t#Option1\n\t\t\t...\n\t*if var\n\t\t#Option2\n\t\t\t...\n', parser, parser._parseChoiceCommand.bind(parser));

		assertError('*choice\n', parser, parser._parseChoiceCommand.bind(parser), ParseError.NoChoiceOption);
		assertError('*choice identifier', parser, parser._parseChoiceCommand.bind(parser), ParseError.GenericSyntaxError);
		assertError('*choice\nto#InvalidOption', parser, parser._parseChoiceCommand.bind(parser), ParseError.NoChoiceOption);
		assertError('*choice\n', parser, parser._parseChoiceCommand.bind(parser), ParseError.NoChoiceOption);
		*/
	});

	test('misc', function() {
		let parser = new ChoiceScriptParser();
		assertNode('false', parser, parser._parseBoolean.bind(parser));
		assertNode('true', parser, parser._parseBoolean.bind(parser));
		assertNode('0', parser, parser._parseNumericalLiteral.bind(parser));
		assertNode('1', parser, parser._parseNumericalLiteral.bind(parser));
		assertNode('999', parser, parser._parseNumericalLiteral.bind(parser));
		assertNode('3.41', parser, parser._parseNumericalLiteral.bind(parser));
		assertNode('"string"', parser, parser._parseStringLiteral.bind(parser));
		assertNode('"Sure, let\'s \\"help\\" them"', parser, parser._parseStringLiteral.bind(parser));
		//assertError('"I\'m sure I\'ve forgotten something...', parser, parser._parseStringLiteral.bind(parser), ParseError.NoCloseQuote);
	});

	test('Expressions - \'Singletons\'', function() {
		let parser = new ChoiceScriptParser();
		assertNode('true', parser, parser._parseCSExpr.bind(parser));
		assertNode('false', parser, parser._parseCSExpr.bind(parser));
		assertNode('item', parser, parser._parseCSExpr.bind(parser));
	});

	test('Expressions - \'Complicated\'', function() {
		let parser = new ChoiceScriptParser();
		assertNode('%+(round((100-sta)/5)+20)', parser, parser._parseFairMathExpr.bind(parser));
		assertNode('%-(round((100-sta)/5)+20)', parser, parser._parseFairMathExpr.bind(parser));		
		assertNode('item and item', parser, parser._parseCSExpr.bind(parser));
		assertNode('not(item)', parser, parser._parseCSExpr.bind(parser));
		assertNode('((item) and not(item))', parser, parser._parseCSExpr.bind(parser));
		assertNode('(var != not(var))', parser, parser._parseCSExpr.bind(parser));
		assertNode('(var and var) and var', parser, parser._parseCSExpr.bind(parser));
		assertNode('(var and var) = var', parser, parser._parseCSExpr.bind(parser));
		assertNode('(var and (var1 or (var2 and var3))) and var', parser, parser._parseCSExpr.bind(parser));
		assertNode('(var and (var1 or (var2 and not(var3)))) and var', parser, parser._parseCSExpr.bind(parser));
		assertNode('myarray[4]', parser, parser._parseCSExpr.bind(parser));
		assertNode('{myarray[myvar]}', parser, parser._parseCSExpr.bind(parser));
		assertNode('myarray[myotherarray[myfinalarray[0]]]', parser, parser._parseCSExpr.bind(parser));
		assertNode('"mystr"', parser, parser._parseCSExpr.bind(parser));
		assertNode('"mystr"&var', parser, parser._parseCSExpr.bind(parser));

		assertError('myarray[myotherarray[myfinalarray[]]]', parser, parser._parseCSExpr.bind(parser), ParseError.TermExpected);
		assertError('myarray[myotherarray[myfinalarray[0]', parser, parser._parseCSExpr.bind(parser), ParseError.RightSquareBracketExpected);
		assertError('myarray[myotherarray[myfinalarray[0]]', parser, parser._parseCSExpr.bind(parser), ParseError.RightSquareBracketExpected);
		assertError('{{myvarref}', parser, parser._parseCSExpr.bind(parser), ParseError.RightCurlyExpected);
		assertError('var and not(var))', parser, parser._parseCSExpr.bind(parser), ParseError.LeftParenthesisExpected);
		assertError('not(not(x) and not(x)', parser, parser._parseCSExpr.bind(parser), ParseError.RightParenthesisExpected);
		assertError('(item and item and item)', parser, parser._parseCSExpr.bind(parser), ParseError.RightParenthesisExpected);
		assertError('((item and item and item)', parser, parser._parseCSExpr.bind(parser), ParseError.RightParenthesisExpected);
		assertError('item)', parser, parser._parseCSExpr.bind(parser), ParseError.OperatorExpected);
		assertError('(var and var) ! var', parser, parser._parseCSExpr.bind(parser), ParseError.InvalidVariableFormatOption);		
	});

/*
*set myvar %+(round((100-sta)/5)+20)
*set myvar %-(round((100-sta)/5)+20)
*set myvar item and item
*set myvar not(item)
*set myvar ((item) and not(item))
*set myvar (var != not(var))
*set myvar (var and var) and var
*set myvar (var and var) = var
*set myvar (var and (var1 or (var2 and var3))) and var
*set myvar (var and (var1 or (var2 and not(var3)))) and var
*comment //assertError
*set myvar (var and var) ! var
*set myvar var and not(var))
*set myvar not(not(x) and not(x)
*set myvar (item and item and item)
*set myvar ((item and item and item)
*set myvar item)
*/


	test('Assignments', function() {
		let parser = new ChoiceScriptParser();
		assertNode('*set myvar myothervar', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set myvar "a string"', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set myvar "*comment"', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set myvar var&var', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set myvar +1', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set thatvar -99', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set name &firstname', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set {stat_hold} -10', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set {n} modulo 7', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set stat_mod ((multiplier)*10)', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set stat_mod ((multiplier)*mynum)', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set myvar %-(round(modifier/4)+((other_mod+1)*100))', parser, parser._parseSetCommand.bind(parser));
		assertNode('*set myvar %-(round(modifier/4)+((other_mod-1)*100))', parser, parser._parseSetCommand.bind(parser));
		assertError('*set {n modulo 7', parser, parser._parseSetCommand.bind(parser), ParseError.RightCurlyExpected);
	});

	test('Variable Replacements', function() {
		let parser = new ChoiceScriptParser();
		assertNode('My name is ${full_name} and my gender is ${gender}.', parser, parser._parseLine.bind(parser));
		assertNode('My job title is $!{job_title}.', parser, parser._parseLine.bind(parser));
		assertNode('And I always shout my catchphrase, like this "$!!{catch_phrase}"!', parser, parser._parseLine.bind(parser));
		assertNode('In my right hand I have a ${weapon_name[inv_right_hand]} equipped.', parser, parser._parseLine.bind(parser));
		//assertNode('next to @{ten_four cool,| not,}', parser, parser._parseTextLine.bind(parser));
		assertNode('${myvar}', parser, parser._parseVariableReplacement.bind(parser));
		assertNode('${{myrefarrayvar[{myotherrefvar}]}}', parser, parser._parseVariableReplacement.bind(parser));		
		assertNode('@{(plural > 1) plural|singular}', parser, parser._parseVariableReplacement.bind(parser));
		assertNode('@{comma and,| and}', parser, parser._parseVariableReplacement.bind(parser));
		assertNode('@{(("Jane"&" Doe") = full_name) fullname|mismatch}', parser, parser._parseVariableReplacement.bind(parser)); // not convinced this is handled properly
	});

	test('Types — Expressions', function() {
		let parser = new ChoiceScriptParser();
		let node = parser.internalParse("true and true", parser._parseCSExpr.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.Boolean, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.Boolean}`);
		node = parser.internalParse("\"Jane \"&doe", parser._parseCSExpr.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.String, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.String}`);
		node = parser.internalParse("5*num", parser._parseCSExpr.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.Number, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.Number}`);
		node = parser.internalParse("fair %+ notfair", parser._parseCSExpr.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.Number, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.Number}`);
	});

	test('Types — Variable Declarations', function() {
		let parser = new ChoiceScriptParser();
		let node = parser.internalParse("*create myboo true", parser._parseVariableDeclaration.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.Boolean, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.Boolean}`);
		node = parser.internalParse("*create mystr \"STRING\"", parser._parseVariableDeclaration.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.String, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.String}`);
		node = parser.internalParse("*temp mynum 5", parser._parseVariableDeclaration.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.Number, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.Number}`);
		node = parser.internalParse("*temp fair fair %+ notfair", parser._parseVariableDeclaration.bind(parser));
		assert(node.csType === nodes.ChoiceScriptType.Number, `Got: ${node.csType}, but expected: ${nodes.ChoiceScriptType.Number}`);
	});

	test('scene_list', function() {
		let parser = new ChoiceScriptParser();
		assertNode("*scene_list\n\tscene1\n\tscene2", parser, parser._parseSceneList);
		assertError("*scene_list", parser, parser._parseSceneList, ParseError.EmptySceneList);
		assertError("*scene_list\n\tscene1\n\t\tscene2", parser, parser._parseSceneList, ParseError.IndentationError);
	});

	test('Indentation', function() {
		let parser = new ChoiceScriptParser();
		assertNode("		", parser, parser._parseIndentation);
		assertNode("   ", parser, parser._parseIndentation);
		assertError("  	", parser, parser._parseIndentation, ParseError.MixedIndentation);
		assertError("	 	 ", parser, parser._parseIndentation, ParseError.MixedIndentation);
/*
		const filePath = "./src/test/choicescript/data/scenes/parser/indentation/startup.txt";
		let textDoc: TextDocument = TextDocument.create(filePath, 'choicescript', 0, readFileSync(filePath).toString());
		let node = parser.internalParse(readFileSync(filePath).toString(), parser._parseScene.bind(parser, textDoc));
		let markers = ParseErrorCollector.entries(node!); 
		assert(markers.length === 0, `issues:\n\t${markers.map((m)=>m.getMessage() + textDoc.getText({ start: textDoc.positionAt(m.getOffset()), end: textDoc.positionAt(m.getOffset() + m.getLength())}) + "\n" + "Line " + textDoc.positionAt(m.getOffset()).line).join("\n\t")}\n`);
	*/
	});

	test('DELETE ME', function() {
		let parser = new ChoiceScriptParser();
		assertNode('on the end of a Jaime-sized log at the edge of the clearing, and as you take a seat next to @{benjoin them,|him,}', parser, parser._parseLine.bind(parser));
	});

});

suite('Parser - Blocks', () => {

	// Positive
	let parser = new ChoiceScriptParser();
	const testDir = "./src/test/choicescript/data/scenes/parser/ifblocks/";
	let testFiles = readdirSync("./src/test/choicescript/data/scenes/parser/ifblocks");
	testFiles.filter((name) => !/\_fail\.txt/.test(name)).forEach(function(fileName) {
		console.log("pos", fileName);
		test(basename(fileName), function() {
			let filePath = testDir + fileName;
			let textDoc: TextDocument = TextDocument.create(filePath, 'choicescript', 0, readFileSync(filePath).toString());
			assertNode(textDoc.getText(), parser, parser._parseIfBlock);	
		});
	});

	// Negative
	testFiles.filter((name) => /\_fail\.txt$/.test(name)).forEach(function(fileName) {
		console.log("neg", fileName);
		test(basename(fileName), function() {
			let filePath = testDir + fileName;
			let textDoc: TextDocument = TextDocument.create(filePath, 'choicescript', 0, readFileSync(filePath).toString());
			assertError(textDoc.getText(), parser, parser._parseIfBlock, ParseError.IndentBlockExpected);	
		});
	});

})

/* More improvements:
*if trained_survival ""
*if trained_search ""
*if trained_scaven ""

*if kevlar_vests 0
*if leather_armors 0
*if football_pads 0
*if tactical_vests 0


scene_list spellings
also gotoref/{} spellings used in strings (can turn off, maybe?)

  *purchase_discount and *feedback considered unknown commands

  *comments aren't spellchecked

*choice
  *comment R&R options/
  *comment Train others in the use of weapons, stealth, etc./


  ^Comment errors as 'expected choice option'


*choice hover affects the entire scope block, not just the command name

Watch token highlighting mid text line*/