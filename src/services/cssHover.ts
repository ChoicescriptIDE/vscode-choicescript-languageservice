/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nodes from '../parser/cssNodes';
import * as languageFacts from './languageFacts';
import { TextDocument, Range, Position, Hover, MarkedString } from 'vscode-languageserver-types';
import { selectorToMarkedString, simpleSelectorToMarkedString } from './selectorPrinting';

export class CSSHover {

	constructor() {
	}

	public doHover(document: TextDocument, position: Position, stylesheet: nodes.Stylesheet): Hover {

		function getRange(node: nodes.Node) {
			return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
		}

		let offset = document.offsetAt(position);
		let nodepath = nodes.getNodePath(stylesheet, offset);

		for (let i = 0; i < nodepath.length; i++) {
			let node = nodepath[i];
			if (node.type === nodes.NodeType.Builtin) {
				var propertyName = node.getText().slice(1, node.getText().length);
				var builtins = languageFacts.getBuiltins();
				var index = builtins.map(function(cmd) { return cmd.name; } ).indexOf(propertyName);
				if (index !== -1) {
					return {
						contents: builtins[index].description,
						range: getRange(node)
					};  
				}
			}
			if (node instanceof nodes.Selector) {
				return {
					contents: selectorToMarkedString(<nodes.Selector>node),
					range: getRange(node)
				};
			}
			if (node instanceof nodes.SimpleSelector) {
				return {
					contents: simpleSelectorToMarkedString(<nodes.SimpleSelector>node),
					range: getRange(node)
				};
			}
		}

		return null;
	}
}

