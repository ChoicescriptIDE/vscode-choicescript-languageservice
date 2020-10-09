(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/cssNodes", "../../parser/cssParser"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertNodes = exports.PrintingVisitor = void 0;
    var assert = require("assert");
    var nodes = require("../../parser/cssNodes");
    var cssParser_1 = require("../../parser/cssParser");
    var PrintingVisitor = /** @class */ (function () {
        function PrintingVisitor() {
            this.tree = [];
        }
        PrintingVisitor.prototype.visitNode = function (node) {
            this.tree.push(nodes.NodeType[node.type].toLowerCase());
            return true;
        };
        return PrintingVisitor;
    }());
    exports.PrintingVisitor = PrintingVisitor;
    function assertNodes(fn, input, expected) {
        var node = fn(input);
        var visitor = new PrintingVisitor();
        node.acceptVisitor(visitor);
        var actual = visitor.tree.join(',') + ',';
        var segments = expected.split(',');
        var oldIndex = undefined;
        var index = -1;
        while (segments.length > 0) {
            var segment = segments.shift();
            if (segment === '...') {
                continue;
            }
            index = actual.indexOf(segment + ',', oldIndex);
            if (oldIndex && index <= oldIndex) {
                assert.ok(false, segment + ' NOT found in ' + actual);
            }
            oldIndex = index + segment.length;
        }
        assert.ok(true);
    }
    exports.assertNodes = assertNodes;
    suite('CSS - Nodes', function () {
        test('Test Node', function () {
            var node = new nodes.Node();
            assert.equal(node.offset, -1);
            assert.equal(node.length, -1);
            assert.equal(node.parent, null);
            assert.equal(node.getChildren().length, 0);
            var c = 0;
            node.accept(function (n) {
                assert.ok(n === node);
                c += 1;
                return true;
            });
            assert.equal(c, 1);
            var child = new nodes.Node();
            node.adoptChild(child);
            c = 0;
            var expects = [node, child];
            node.accept(function (n) {
                assert.ok(n === expects[c]);
                c += 1;
                return true;
            });
            assert.equal(c, 2);
        });
        test('Test Adopting', function () {
            var child = new nodes.Node();
            var p1 = new nodes.Node();
            var p2 = new nodes.Node();
            assert.ok(child.parent === null);
            assert.equal(p1.getChildren().length, 0);
            assert.equal(p2.getChildren().length, 0);
            p1.adoptChild(child);
            assert.ok(child.parent === p1);
            assert.equal(p1.getChildren().length, 1);
            assert.equal(p2.getChildren().length, 0);
            p2.adoptChild(child);
            assert.ok(child.parent === p2);
            assert.equal(p1.getChildren().length, 0);
            assert.equal(p2.getChildren().length, 1);
        });
        function ruleset(input) {
            var parser = new cssParser_1.Parser();
            var node = parser.internalParse(input, parser._parseRuleset);
            return node;
        }
        test('RuleSet', function () {
            assertNodes(ruleset, 'selector { prop: value }', 'ruleset,...,selector,...,declaration,...,property,...,expression');
            assertNodes(ruleset, 'selector { prop; }', 'ruleset,...,selector,...,selector');
        });
        test('Keyframe', function () {
            function fn(input) {
                var parser = new cssParser_1.Parser();
                var node = parser.internalParse(input, parser._parseKeyframe);
                return node;
            }
            assertNodes(fn, '@keyframes name { from { top: 0px} to { top: 100px } }', 'keyframe,identifier,keyframeselector,declaration,keyframeselector,declaration');
        });
    });
});
