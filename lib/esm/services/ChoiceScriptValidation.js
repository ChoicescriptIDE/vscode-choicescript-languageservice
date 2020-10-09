/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as nodes from '../parser/ChoiceScriptNodes';
import { LintConfigurationSettings, Rules } from './ChoiceScriptLintRules';
import { Range, SpellCheckDictionary } from '../cssLanguageTypes';
import { SpellCheckVisitor } from './spellcheck';
import { LintVisitor } from './ChoiceScriptLint';
import { Typo } from './typo/typo';
//import * as fs from 'fs';
var ChoiceScriptValidation = /** @class */ (function () {
    function ChoiceScriptValidation() {
        this.settings = { validate: true, spellcheck: { enabled: false, dictionaryPath: '',
                dictionary: SpellCheckDictionary.EN_US, userDictionary: { "session": {}, "persistent": {} } }, lint: {} };
        this.typo = null;
        this.typo = new Typo("", "", "", {
            platform: 'any'
        });
    }
    ChoiceScriptValidation.prototype.configure = function (settings) {
        // Reload typo here rather than every time we call a visitor.
        // Don't bother reloading a dictionary if spellcheck is disabled.
        this.settings = settings;
        if (typeof this.settings.spellcheck !== 'undefined' && this.settings.spellcheck.enabled) {
            if (this.settings.spellcheck.dictionaryPath) {
                this.loadTypo(settings);
            }
        }
    };
    ChoiceScriptValidation.prototype.loadTypo = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var baseUrl, dict;
            return __generator(this, function (_a) {
                if (!this.settings && this.settings.spellcheck.enabled) {
                    return [2 /*return*/];
                }
                baseUrl = settings.spellcheck.dictionaryPath;
                dict = settings.spellcheck.dictionary;
                // TODO handle failure
                this.typo = new Typo(dict, 
                //fs.readFileSync(baseUrl + "/" + dict + "/" + dict + ".aff").toString(),
                //fs.readFileSync(baseUrl + "/" + dict + "/" + dict + ".dic").toString(),
                this.typo._readFile(baseUrl + "/" + dict + "/" + dict + ".aff"), this.typo._readFile(baseUrl + "/" + dict + "/" + dict + ".dic"), {
                    platform: 'any'
                });
                return [2 /*return*/];
            });
        });
    };
    ChoiceScriptValidation.prototype.doValidation = function (document, scene, settings) {
        if (settings === void 0) { settings = this.settings; }
        var entries = [];
        if (settings && settings.validate === true) {
            entries.push.apply(entries, nodes.ParseErrorCollector.entries(scene));
        }
        if (settings && settings.spellcheck.enabled === true) {
            entries.push.apply(entries, SpellCheckVisitor.entries(scene, document, this.typo, this.settings.spellcheck.userDictionary));
        }
        if (settings && settings.lint && settings.lint.enabled === true) {
            entries.push.apply(entries, LintVisitor.entries(scene, document, new LintConfigurationSettings(settings && settings.lint)));
        }
        if (settings && !settings.spellcheck.enabled && !settings.validate) {
            return [];
        }
        var ruleIds = [];
        for (var r in Rules) {
            ruleIds.push(Rules[r].id);
        }
        function toDiagnostic(marker) {
            var range = Range.create(document.positionAt(marker.getOffset()), document.positionAt(marker.getOffset() + marker.getLength()));
            var source = document.languageId;
            return {
                code: marker.getRule().id,
                source: source,
                message: marker.getMessage(),
                severity: marker.getLevel(),
                range: range
            };
        }
        return entries.filter(function (entry) { return entry.getLevel() !== nodes.Level.Ignore; }).map(toDiagnostic);
    };
    return ChoiceScriptValidation;
}());
export { ChoiceScriptValidation };
