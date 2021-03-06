/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { Hover, TextDocument, getChoiceScriptLanguageService } from '../../cssLanguageService';

function assertHover(value: string, expected: Hover, languageId = 'css'): void {
	let offset = value.indexOf('|');
	value = value.substr(0, offset) + value.substr(offset + 1);
	const ls = getChoiceScriptLanguageService();

	const document = TextDocument.create(`test://foo/bar.${languageId}`, languageId, 1, value);
	const hoverResult = ls.doHover(document, document.positionAt(offset), ls.parseScene(document));
	assert(hoverResult);

	if (hoverResult!.range && expected.range) {
		assert.equal(hoverResult!.range, expected.range);
	}
	assert.deepEqual(hoverResult!.contents, expected.contents);
}

suite('ChoiceScript Hover', () => {
	test('basic command', () => {
		assertHover('*cho|ice', {
			contents: [ '**Command**: choice', '```choicescript\n*choice\n\t#Option 1\n\t\t*comment code here\n\t\t*goto label1\n\t#Option 2\n\t\t*comment code here\n\t\t*goto label2\n```', 'Read more on the [wiki](https://choicescriptdev.wikia.com/wiki/choice)' ]
		});

		/**
		 * Reenable after converting specificity to use MarkupContent
		 */

		// assertHover('.test:h|over { color: blue; }', {
		// 	contents: `Applies while the user designates an element with a pointing device, but does not necessarily activate it. For example, a visual user agent could apply this pseudo-class when the cursor (mouse pointer) hovers over a box generated by the element.`
		// });

		// assertHover('.test::a|fter { color: blue; }', {
		// 	contents: `Represents a styleable child pseudo-element immediately after the originating element’s actual content.`
		// });
	});
	test('command with params', () => {
		assertHover('*s|et myvar is', {
			contents: ["**Command**: set",
			"```choicescript\n*set n 5\n```",
			"Read more on the [wiki](https://choicescriptdev.wikia.com/wiki/set)"]
		});
	});
});
