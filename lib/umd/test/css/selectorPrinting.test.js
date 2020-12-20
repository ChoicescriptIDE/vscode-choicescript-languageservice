(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/cssParser", "../../parser/cssNodes", "../../services/selectorPrinting", "../../cssLanguageTypes", "../../languageFacts/dataManager"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertSelector = void 0;
    var assert = require("assert");
    var cssParser_1 = require("../../parser/cssParser");
    var nodes = require("../../parser/cssNodes");
    var selectorPrinting = require("../../services/selectorPrinting");
    var cssLanguageTypes_1 = require("../../cssLanguageTypes");
    var dataManager_1 = require("../../languageFacts/dataManager");
    var cssDataManager = new dataManager_1.CSSDataManager({ useDefaultDataProvider: true });
    function elementToString(element) {
        var label = element.findAttribute('name') || '';
        var attributes = element.attributes && element.attributes.filter(function (a) { return a.name !== 'name'; });
        if (attributes && attributes.length > 0) {
            label = label + '[';
            var needsSeparator = false;
            for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
                var attribute = attributes_1[_i];
                if (attribute.name !== 'name') {
                    if (needsSeparator) {
                        label = label + '|';
                    }
                    needsSeparator = true;
                    label = label + attribute.name + '=' + attribute.value;
                }
            }
            label = label + ']';
        }
        if (element.children) {
            label = label + '{';
            for (var index = 0; index < element.children.length; index++) {
                if (index > 0) {
                    label = label + '|';
                }
                label = label + elementToString(element.children[index]);
            }
            label = label + '}';
        }
        return label;
    }
    function doParse(p, input, selectorName) {
        var document = cssLanguageTypes_1.TextDocument.create('test://test/test.css', 'css', 0, input);
        var styleSheet = p.parseStylesheet(document);
        var node = nodes.getNodeAtOffset(styleSheet, input.indexOf(selectorName));
        if (!node) {
            return null;
        }
        return node.findParent(nodes.NodeType.Selector);
    }
    function assertSelector(p, input, selectorName, expected) {
        var selector = doParse(p, input, selectorName);
        assert(selector);
        var element = selectorPrinting.selectorToElement(selector);
        assert(element);
        assert.equal(elementToString(element), expected);
    }
    exports.assertSelector = assertSelector;
    function assertElement(p, input, expected) {
        var node = p.internalParse(input, p._parseSimpleSelector);
        var actual = selectorPrinting.toElement(node);
        assert.deepEqual(actual.attributes, expected);
    }
    function assertSelectorMarkdown(p, input, selectorName, expected) {
        var selector = doParse(p, input, selectorName);
        assert(selector);
        var selectorPrinter = new selectorPrinting.SelectorPrinting(cssDataManager);
        var printedElement = selectorPrinter.selectorToMarkedString(selector);
        assert.deepEqual(printedElement, expected);
    }
    suite('CSS - Selector Printing', function () {
        test('class/hash/elementname/attr', function () {
            var p = new cssParser_1.Parser();
            assertElement(p, 'element', [{ name: 'name', value: 'element' }]);
            assertElement(p, '.div', [{ name: 'class', value: 'div' }]);
            assertElement(p, '#first', [{ name: 'id', value: 'first' }]);
            assertElement(p, 'element.on', [{ name: 'name', value: 'element' }, { name: 'class', value: 'on' }]);
            assertElement(p, 'element.on#first', [
                { name: 'name', value: 'element' },
                { name: 'class', value: 'on' },
                { name: 'id', value: 'first' }
            ]);
            assertElement(p, '.on#first', [{ name: 'class', value: 'on' }, { name: 'id', value: 'first' }]);
            assertElement(p, "[lang='de']", [{ name: 'lang', value: 'de' }]);
            assertElement(p, '[enabled]', [{ name: 'enabled', value: void 0 }]);
        });
        test('simple selector', function () {
            var p = new cssParser_1.Parser();
            assertSelector(p, 'element { }', 'element', '{element}');
            assertSelector(p, 'element.div { }', 'element', '{element[class=div]}');
            assertSelector(p, 'element.on#first { }', 'element', '{element[class=on|id=first]}');
            assertSelector(p, 'element:hover { }', 'element', '{element[:hover=]}');
            assertSelector(p, "element[lang='de'] { }", 'element', '{element[lang=de]}');
            assertSelector(p, 'element[enabled] { }', 'element', '{element[enabled=undefined]}');
            assertSelector(p, 'element[foo~="warning"] { }', 'element', '{element[foo= … warning … ]}');
            assertSelector(p, 'element[lang|="en"] { }', 'element', '{element[lang=en-…]}');
            assertSelector(p, '* { }', '*', '{element}');
        });
        test('selector', function () {
            var p = new cssParser_1.Parser();
            assertSelector(p, 'e1 e2 { }', 'e1', '{e1{…{e2}}}');
            assertSelector(p, 'e1 .div { }', 'e1', '{e1{…{[class=div]}}}');
            assertSelector(p, 'e1 > e2 { }', 'e2', '{e1{e2}}');
            assertSelector(p, 'e1, e2 { }', 'e1', '{e1}');
            assertSelector(p, 'e1 + e2 { }', 'e2', '{e1|e2}');
            assertSelector(p, 'e1 ~ e2 { }', 'e2', '{e1|⋮|e2}');
        });
        test('escaping', function () {
            var p = new cssParser_1.Parser();
            assertSelector(p, '#\\34 04-error { }', '#\\34 04-error', '{[id=404-error]}');
        });
    });
    suite('CSS - MarkedStringPrinter selectors', function () {
        test('descendant selector', function () {
            var p = new cssParser_1.Parser();
            assertSelectorMarkdown(p, 'e1 e2 { }', 'e1', [
                { language: 'html', value: '<e1>\n  …\n    <e2>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
            assertSelectorMarkdown(p, 'e1 .div { }', 'e1', [
                { language: 'html', value: '<e1>\n  …\n    <element class="div">' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 1, 1)'
            ]);
        });
        test('child selector', function () {
            var p = new cssParser_1.Parser();
            assertSelectorMarkdown(p, 'e1 > e2 { }', 'e2', [
                { language: 'html', value: '<e1>\n  <e2>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
        });
        test('group selector', function () {
            var p = new cssParser_1.Parser();
            assertSelectorMarkdown(p, 'e1, e2 { }', 'e1', [
                { language: 'html', value: '<e1>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 1)'
            ]);
            assertSelectorMarkdown(p, 'e1, e2 { }', 'e2', [
                { language: 'html', value: '<e2>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 1)'
            ]);
        });
        test('sibling selector', function () {
            var p = new cssParser_1.Parser();
            assertSelectorMarkdown(p, 'e1 + e2 { }', 'e2', [
                { language: 'html', value: '<e1>\n<e2>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
            assertSelectorMarkdown(p, 'e1 ~ e2 { }', 'e2', [
                { language: 'html', value: '<e1>\n⋮\n<e2>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
        });
    });
    suite('CSS - MarkedStringPrinter selectors specificities', function () {
        var p = new cssParser_1.Parser();
        test('attribute selector', function () {
            assertSelectorMarkdown(p, 'h1 + *[rel=up]', 'h1', [
                { language: 'html', value: '<h1>\n<element rel="up">' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 1, 1)'
            ]);
        });
        test('class selector', function () {
            assertSelectorMarkdown(p, 'ul ol li.red', 'ul', [
                { language: 'html', value: '<ul>\n  …\n    <ol>\n      …\n        <li class="red">' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 1, 3)'
            ]);
            assertSelectorMarkdown(p, 'li.red.level', 'li', [
                { language: 'html', value: '<li class="red level">' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 2, 1)'
            ]);
        });
        test('pseudo class selector', function () {
            assertSelectorMarkdown(p, 'p:focus', 'p', [
                { language: 'html', value: '<p :focus>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 1, 1)'
            ]);
        });
        test('element selector', function () {
            assertSelectorMarkdown(p, 'li', 'li', [
                { language: 'html', value: '<li>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 1)'
            ]);
            assertSelectorMarkdown(p, 'ul li', 'ul', [
                { language: 'html', value: '<ul>\n  …\n    <li>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
            assertSelectorMarkdown(p, 'ul ol+li', 'ul', [
                { language: 'html', value: '<ul>\n  …\n    <ol>\n    <li>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 3)'
            ]);
        });
        test('pseudo element selector', function () {
            assertSelectorMarkdown(p, 'p::after', 'p', [
                { language: 'html', value: '<p ::after>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
            assertSelectorMarkdown(p, 'p:after', 'p', [
                { language: 'html', value: '<p :after>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 2)'
            ]);
        });
        test('identifier selector', function () {
            assertSelectorMarkdown(p, '#x34y', '#x34y', [
                { language: 'html', value: '<element id="x34y">' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (1, 0, 0)'
            ]);
        });
        test('ignore universal and not selector', function () {
            assertSelectorMarkdown(p, '*', '*', [
                { language: 'html', value: '<element>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (0, 0, 0)'
            ]);
            assertSelectorMarkdown(p, '#s12:not(foo)', '#s12', [
                { language: 'html', value: '<element id="s12" :not>' },
                '[Selector Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity): (1, 0, 1)'
            ]);
        });
    });
});
