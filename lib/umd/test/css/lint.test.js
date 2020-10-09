(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../parser/cssNodes", "../../parser/cssParser", "../../services/lint", "../../services/lintRules", "../../cssLanguageTypes", "../../parser/scssParser", "../../parser/lessParser", "../../languageFacts/dataManager"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertEntries = void 0;
    var assert = require("assert");
    var cssNodes_1 = require("../../parser/cssNodes");
    var cssParser_1 = require("../../parser/cssParser");
    var lint_1 = require("../../services/lint");
    var lintRules_1 = require("../../services/lintRules");
    var cssLanguageTypes_1 = require("../../cssLanguageTypes");
    var scssParser_1 = require("../../parser/scssParser");
    var lessParser_1 = require("../../parser/lessParser");
    var dataManager_1 = require("../../languageFacts/dataManager");
    var cssDataManager = new dataManager_1.CSSDataManager({ useDefaultDataProvider: true });
    function assertEntries(node, document, expectedRules, expectedMessages, settings) {
        if (expectedMessages === void 0) { expectedMessages = undefined; }
        if (settings === void 0) { settings = new lintRules_1.LintConfigurationSettings(); }
        var entries = lint_1.LintVisitor.entries(node, document, settings, cssDataManager, cssNodes_1.Level.Error | cssNodes_1.Level.Warning | cssNodes_1.Level.Ignore);
        var message = "Did not find all linting error [" + expectedRules.map(function (e) { return e.id; }).join(', ') + "]";
        assert.equal(entries.length, expectedRules.length, message);
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var index = expectedRules.indexOf(entry.getRule());
            assert.ok(index !== -1, entry.getRule().id + " found but not expected (" + expectedRules.map(function (r) { return r.id; }).join(', ') + ")");
            if (expectedMessages) {
                assert.equal(entry.getMessage(), expectedMessages[index]);
            }
        }
    }
    exports.assertEntries = assertEntries;
    var parsers = [new cssParser_1.Parser(), new lessParser_1.LESSParser(), new scssParser_1.SCSSParser()];
    function assertStyleSheet(input) {
        var rules = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rules[_i - 1] = arguments[_i];
        }
        for (var _a = 0, parsers_1 = parsers; _a < parsers_1.length; _a++) {
            var p = parsers_1[_a];
            var document = cssLanguageTypes_1.TextDocument.create('test://test/test.css', 'css', 0, input);
            var node = p.parseStylesheet(document);
            assertEntries(node, document, rules);
        }
    }
    function assertRuleSet(input) {
        var rules = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rules[_i - 1] = arguments[_i];
        }
        assertRuleSet2(input, rules);
    }
    function assertRuleSet2(input, rules, messages, settings) {
        for (var _i = 0, parsers_2 = parsers; _i < parsers_2.length; _i++) {
            var p = parsers_2[_i];
            var document = cssLanguageTypes_1.TextDocument.create('test://test/test.css', 'css', 0, input);
            var node = p.internalParse(input, p._parseRuleset);
            assertEntries(node, document, rules, messages, settings);
        }
    }
    function assertFontFace(input) {
        var rules = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rules[_i - 1] = arguments[_i];
        }
        for (var _a = 0, parsers_3 = parsers; _a < parsers_3.length; _a++) {
            var p = parsers_3[_a];
            var document = cssLanguageTypes_1.TextDocument.create('test://test/test.css', 'css', 0, input);
            var node = p.internalParse(input, p._parseFontFace);
            assertEntries(node, document, rules);
        }
    }
    suite('CSS - Lint', function () {
        test('universal selector, empty rule', function () {
            assertRuleSet('* { color: perty }', lintRules_1.Rules.UniversalSelector);
            assertRuleSet('*, div { color: perty }', lintRules_1.Rules.UniversalSelector);
            assertRuleSet('div, * { color: perty }', lintRules_1.Rules.UniversalSelector);
            assertRuleSet('div > * { color: perty }', lintRules_1.Rules.UniversalSelector);
            assertRuleSet('div + * { color: perty }', lintRules_1.Rules.UniversalSelector);
        });
        test('empty ruleset', function () {
            assertRuleSet('selector {}', lintRules_1.Rules.EmptyRuleSet);
        });
        test('properies ignored due to inline ', function () {
            assertRuleSet('selector { display: inline; float: right; }', lintRules_1.Rules.AvoidFloat);
            assertRuleSet('selector { display: inline; float: none; }', lintRules_1.Rules.AvoidFloat);
            assertRuleSet('selector { display: inline-block; float: right; }', lintRules_1.Rules.PropertyIgnoredDueToDisplay, lintRules_1.Rules.AvoidFloat);
            assertRuleSet('selector { display: inline-block; float: none; }', lintRules_1.Rules.AvoidFloat);
            assertRuleSet('selector { display: block; vertical-align: center; }', lintRules_1.Rules.PropertyIgnoredDueToDisplay);
            assertRuleSet('selector { display: inline-block; float: none !important; }', lintRules_1.Rules.AvoidFloat, lintRules_1.Rules.AvoidImportant);
        });
        test('avoid !important', function () {
            assertRuleSet('selector { display: inline !important; }', lintRules_1.Rules.AvoidImportant);
        });
        test('avoid float', function () {
            assertRuleSet('selector { float: right; }', lintRules_1.Rules.AvoidFloat);
        });
        test('avoid id selectors', function () {
            assertRuleSet('#selector {  display: inline; }', lintRules_1.Rules.AvoidIdSelector);
        });
        test('zero with unit', function () {
            assertRuleSet('selector { width: 0px }', lintRules_1.Rules.ZeroWithUnit);
            assertRuleSet('selector { width: 0Px }', lintRules_1.Rules.ZeroWithUnit);
            assertRuleSet('selector { line-height: 0EM }', lintRules_1.Rules.ZeroWithUnit);
            assertRuleSet('selector { line-height: 0pc }', lintRules_1.Rules.ZeroWithUnit);
            assertRuleSet('selector { outline: black 0em solid; }', lintRules_1.Rules.ZeroWithUnit);
            assertRuleSet('selector { grid-template-columns: 40px 50px auto 0px 40px; }', lintRules_1.Rules.ZeroWithUnit);
            assertRuleSet('selector { min-height: 0% }');
            assertRuleSet('selector { top: calc(0px - 10vw); }'); // issue 46997
        });
        test('duplicate declarations', function () {
            assertRuleSet('selector { color: perty; color: perty }', lintRules_1.Rules.DuplicateDeclarations, lintRules_1.Rules.DuplicateDeclarations);
            assertRuleSet('selector { color: -o-perty; color: perty }');
        });
        test('unknown properties', function () {
            assertRuleSet('selector { -ms-property: "rest is missing" }', lintRules_1.Rules.UnknownVendorSpecificProperty);
            assertRuleSet('selector { -moz-box-shadow: "rest is missing" }', lintRules_1.Rules.UnknownVendorSpecificProperty, lintRules_1.Rules.IncludeStandardPropertyWhenUsingVendorPrefix);
            assertRuleSet('selector { box-shadow: none }'); // no error
            assertRuleSet('selector { box-property: "rest is missing" }', lintRules_1.Rules.UnknownProperty);
            assertRuleSet(':export { prop: "some" }'); // no error for properties inside :export
            assertRuleSet2('selector { foo: "some"; bar: 0px }', [], undefined, new lintRules_1.LintConfigurationSettings({ validProperties: ['foo', 'bar'] }));
            assertRuleSet2('selector { foo: "some"; }', [], undefined, new lintRules_1.LintConfigurationSettings({ validProperties: ['foo', null] }));
            assertRuleSet2('selector { bar: "some"; }', [lintRules_1.Rules.UnknownProperty], undefined, new lintRules_1.LintConfigurationSettings({ validProperties: ['foo'] }));
            assertRuleSet2('selector { Box-Property: "rest is missing" }', [lintRules_1.Rules.UnknownProperty], ["Unknown property: 'Box-Property'"]);
        });
        test('box model', function () {
            // border shorthand, zero values
            assertRuleSet('.mybox { height: 100px;         border: initial;           }');
            assertRuleSet('.mybox { height: 100px;         border: unset;             }');
            assertRuleSet('.mybox { height: 100px;         border: none;              }');
            assertRuleSet('.mybox { height: 100px;         border: hidden;            }');
            assertRuleSet('.mybox { height: 100px;         border: 0;                 }');
            assertRuleSet('.mybox { height: 100px;         border: 0 solid;           }');
            assertRuleSet('.mybox { height: 100px;         border: 1px none;          }');
            assertRuleSet('.mybox { height: 100px;         border: 0 solid #ccc;      }');
            // order doesn't matter
            assertRuleSet('.mybox { border: initial;       height: 100px;             }');
            assertRuleSet('.mybox { border: 0;             height: 100px;             }');
            // border shorthand, non-zero values
            assertRuleSet('.mybox { height: 100px;         border: 1px;               }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { height: 100px;         border: 1px solid;         }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { width: 100px;          border: 1px;               }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // order doesn't matter
            assertRuleSet('.mybox { border: 1px;           height: 100px;             }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { border: 1px solid;     height: 100px;             }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // border-top shorthand, zero values
            assertRuleSet('.mybox { height: 100px;         border-top: initial;       }');
            assertRuleSet('.mybox { height: 100px;         border-top: none;          }');
            assertRuleSet('.mybox { height: 100px;         border-top: 0;             }');
            assertRuleSet('.mybox { height: 100px;         border-top: 0 solid;       }');
            assertRuleSet('.mybox { width: 100px;          border-top: 1px;           }');
            assertRuleSet('.mybox { width: 100px;          border-top: 1px solid;     }');
            // border-top shorthand, non-zero values
            assertRuleSet('.mybox { height: 100px;         border-top: 1px;           }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize); // shorthand | single value | 1px
            assertRuleSet('.mybox { height: 100px;         border-top: 1px solid;     }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize); // shorthand |
            // border-width shorthand, zero values
            assertRuleSet('.mybox { height: 100px;         border-width: 0;           }');
            assertRuleSet('.mybox { height: 100px;         border-width: 0 0;         }');
            assertRuleSet('.mybox { height: 100px;         border-width: 0 0 0;       }');
            assertRuleSet('.mybox { height: 100px;         border-width: 0 0 0 0;     }');
            assertRuleSet('.mybox { height: 100px;         border-width: 0 1px;       }');
            assertRuleSet('.mybox { height: 100px;         border-width: 0 1px 0 1px; }');
            assertRuleSet('.mybox { width: 100px;          border-width: 1px 0;       }');
            assertRuleSet('.mybox { width: 100px;          border-width: 1px 0 1px 0; }');
            // border-width shorthand, non-zero values
            assertRuleSet('.mybox { height: 100px;         border-width: 1px;         }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { height: 100px;         border-width: 0 0 1px;     }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { width: 100px;          border-width: 0 1px;       }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { width: 100px;          border-width: 0 0 0 1px;   }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // border-style shorthand, zero values
            assertRuleSet('.mybox { height: 100px;         border-style: unset;       }');
            assertRuleSet('.mybox { height: 100px;         border-style: initial;     }');
            assertRuleSet('.mybox { height: 100px;         border-style: none;        }');
            assertRuleSet('.mybox { height: 100px;         border-style: hidden;      }');
            // border-style shorthand, non-zero values
            assertRuleSet('.mybox { height: 100px;         border-style: solid;       }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { height: 100px;         border-style: dashed;      }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // border-top-width property, zero values
            assertRuleSet('.mybox { height: 100px;         border-top-width: 0;       }');
            assertRuleSet('.mybox { width: 100px;          border-top-width: 1px;     }');
            // border-top-width property, non-zero values
            assertRuleSet('.mybox { height: 100px;         border-top-width: 1px;     }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // border-top-style property, zero values
            assertRuleSet('.mybox { height: 100px;         border-top-style: unset;   }');
            assertRuleSet('.mybox { width: 100px;          border-top-style: solid;   }');
            // border-top-style property, non-zero values
            assertRuleSet('.mybox { height: 100px;         border-top-style: solid;   }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // padding shorthand, zero values
            assertRuleSet('.mybox { height: 100px;         padding: initial;          }');
            assertRuleSet('.mybox { height: 100px;         padding: unset;            }');
            assertRuleSet('.mybox { height: 100px;         padding: 0;                }');
            assertRuleSet('.mybox { height: 100px;         padding: 0 0;              }');
            assertRuleSet('.mybox { height: 100px;         padding: 0 0 0;            }');
            assertRuleSet('.mybox { height: 100px;         padding: 0 0 0 0;          }');
            assertRuleSet('.mybox { height: 100px;         padding: 0 1px;            }');
            assertRuleSet('.mybox { height: 100px;         padding: 0 1px 0 1px;      }');
            assertRuleSet('.mybox { width: 100px;          padding: 1px 0;            }');
            assertRuleSet('.mybox { width: 100px;          padding: 1px 0 1px;        }');
            // padding shorthand, non-zero values
            assertRuleSet('.mybox { height: 100px;         padding: 1px;              }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { height: 100px;         padding: 1px 0;            }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            assertRuleSet('.mybox { height: 100px;         padding: 0 0 1px;          }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
            // box-sizing supress errors
            assertRuleSet('.mybox { height: 100px;         border: 1px;               box-sizing: border-box; }');
            // property be overriden
            assertRuleSet('.mybox { height: 100px;         border: 1px;               border-top: 0; border-bottom: 0; }');
            // imcomplete rules
            assertRuleSet('.mybox { padding:; }');
            assertRuleSet('.mybox { border: ');
            assertRuleSet('.mybox { height: 100px;         padding: 1px;              border: }', lintRules_1.Rules.BewareOfBoxModelSize, lintRules_1.Rules.BewareOfBoxModelSize);
        });
        test('IE hacks', function () {
            assertRuleSet('selector { display: inline-block; *display: inline; }', lintRules_1.Rules.IEStarHack);
            assertRuleSet('selector { background: #00f; /* all browsers including Mac IE */ *background: #f00; /* IE 7 and below */ _background: #f60; /* IE 6 and below */  }', lintRules_1.Rules.IEStarHack, lintRules_1.Rules.IEStarHack);
        });
        test('vendor specific prefixes', function () {
            assertRuleSet('selector { -moz-animation: none }', lintRules_1.Rules.AllVendorPrefixes, lintRules_1.Rules.IncludeStandardPropertyWhenUsingVendorPrefix);
            assertRuleSet('selector { -moz-transform: none; transform: none }', lintRules_1.Rules.AllVendorPrefixes);
            assertRuleSet('selector { transform: none; }');
            assertRuleSet('selector { -moz-transform: none; transform: none; -o-transform: none; -webkit-transform: none; -ms-transform: none; }');
            assertRuleSet('selector { --transform: none; }');
            assertRuleSet('selector { -webkit-appearance: none }');
        });
        test('font-face required properties', function () {
            assertFontFace('@font-face {  }', lintRules_1.Rules.RequiredPropertiesForFontFace);
            assertFontFace('@font-face { src: url(test.tff) }', lintRules_1.Rules.RequiredPropertiesForFontFace);
            assertFontFace('@font-face { font-family: \'name\' }', lintRules_1.Rules.RequiredPropertiesForFontFace);
            assertFontFace('@font-face { src: url(test.tff); font-family: \'name\' }'); // no error
        });
        test('keyframes', function () {
            assertStyleSheet('@keyframes foo { }');
            assertStyleSheet('@keyframes foo { } @-moz-keyframes foo { }', lintRules_1.Rules.AllVendorPrefixes);
            assertStyleSheet('@-moz-keyframes foo { }', lintRules_1.Rules.AllVendorPrefixes, lintRules_1.Rules.IncludeStandardPropertyWhenUsingVendorPrefix);
        });
    });
});
