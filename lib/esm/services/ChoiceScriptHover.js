/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/ChoiceScriptNodes';
import * as languageFacts from '../languageFacts/choicescriptFacts';
import { Range, MarkupKind } from '../cssLanguageTypes';
import { isDefined } from '../utils/objects';
var ChoiceScriptHover = /** @class */ (function () {
    function ChoiceScriptHover(clientCapabilities) {
        this.clientCapabilities = clientCapabilities;
    }
    ChoiceScriptHover.prototype.doHover = function (document, position, stylesheet) {
        function getRange(node) {
            return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
        }
        var offset = document.offsetAt(position);
        var nodepath = nodes.getNodePath(stylesheet, offset);
        /**
         * nodepath is top-down
         * Build up the hover by appending inner node's information
         */
        var hover = null; // TODO: Figure out why it's complaining about Hover
        for (var i = 0; i < nodepath.length; i++) {
            var node = nodepath[i];
            if (node instanceof nodes.Command) {
                var command = node.name;
                var cmds = languageFacts.getCommands();
                var index = cmds.map(function (cmd) { return cmd.name; }).indexOf(command);
                if (index !== -1) {
                    return {
                        contents: cmds[index].description,
                        range: getRange(node)
                    };
                }
            }
            // Expression is not correct. Just used to shut up compile errors. Needs fixing.
            if (node instanceof nodes.Expression) {
                return {
                    contents: "selectorToMarkedString",
                    range: getRange(node)
                };
                break;
            }
            if (node instanceof nodes.Expression) {
                return {
                    contents: "simpleSelector",
                    range: getRange(node)
                };
            }
        }
        if (hover) {
            hover.contents = this.convertContents(hover.contents);
        }
        return hover;
    };
    ChoiceScriptHover.prototype.convertContents = function (contents) {
        if (!this.doesSupportMarkdown()) {
            if (typeof contents === 'string') {
                return contents;
            }
            // MarkupContent
            else if ('kind' in contents) {
                return {
                    kind: 'plaintext',
                    value: contents.value
                };
            }
            // MarkedString[]
            else if (Array.isArray(contents)) {
                return contents.map(function (c) {
                    return typeof c === 'string' ? c : c.value;
                });
            }
            // MarkedString
            else {
                return contents.value;
            }
        }
        return contents;
    };
    ChoiceScriptHover.prototype.doesSupportMarkdown = function () {
        if (!isDefined(this.supportsMarkdown)) {
            if (!isDefined(this.clientCapabilities)) {
                this.supportsMarkdown = true;
                return this.supportsMarkdown;
            }
            var hover = this.clientCapabilities.textDocument && this.clientCapabilities.textDocument.hover;
            this.supportsMarkdown = hover && hover.contentFormat && Array.isArray(hover.contentFormat) && hover.contentFormat.indexOf(MarkupKind.Markdown) !== -1;
        }
        return this.supportsMarkdown;
    };
    return ChoiceScriptHover;
}());
export { ChoiceScriptHover };
