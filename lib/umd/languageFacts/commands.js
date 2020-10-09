(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../data/commands"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fullCommandList = exports.getCommands = exports.EntryImpl = exports.expandEntryStatus = void 0;
    var commands = require("../data/commands");
    function expandEntryStatus(status) {
        switch (status) {
            case 'e':
                return 'experimental';
            case 'n':
                return 'nonstandard';
            case 'o':
                return 'obsolete';
            default:
                return 'standard';
        }
    }
    exports.expandEntryStatus = expandEntryStatus;
    function getEntryStatus(status) {
        switch (status) {
            case 'e':
                return '⚠️ Property is experimental. Be cautious when using it.️\n\n';
            case 'n':
                return '🚨️ Property is nonstandard. Avoid using it.\n\n';
            case 'o':
                return '🚨️️️ Property is obsolete. Avoid using it.\n\n';
            default:
                return '';
        }
    }
    var EntryImpl = /** @class */ (function () {
        function EntryImpl(data) {
            this.data = data;
        }
        Object.defineProperty(EntryImpl.prototype, "name", {
            get: function () {
                return this.data.name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntryImpl.prototype, "description", {
            get: function () {
                return this.data.desc;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntryImpl.prototype, "restrictions", {
            get: function () {
                if (this.data.restriction) {
                    return this.data.restriction.split(',').map(function (s) { return s.trim(); });
                }
                else {
                    return [];
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntryImpl.prototype, "status", {
            get: function () {
                return expandEntryStatus(this.data.status);
            },
            enumerable: false,
            configurable: true
        });
        return EntryImpl;
    }());
    exports.EntryImpl = EntryImpl;
    var commandsArray = commands.fullCommandList;
    var descCommandList;
    function getCommands() {
        if (!descCommandList) {
            descCommandList = [];
            for (var i = 0; i < commandsArray.length; i++) {
                var rawEntry = {
                    name: commandsArray[i],
                    desc: [
                        "**Command**: " + commandsArray[i],
                    ]
                };
                if (typeof commands.standardCommands[commandsArray[i]] !== "undefined"
                    && commands.standardCommands[commandsArray[i]].desc) {
                    rawEntry.desc.push("```choicescript\n" + commands.standardCommands[commandsArray[i]].desc + "\n```");
                }
                else if (typeof commands.flowCommands[commandsArray[i]] !== "undefined"
                    && commands.flowCommands[commandsArray[i]].desc) {
                    rawEntry.desc.push("```choicescript\n" + commands.flowCommands[commandsArray[i]].desc + "\n```");
                }
                rawEntry.desc.push("Read more on the [wiki](https://choicescriptdev.wikia.com/wiki/" + commandsArray[i] + ")");
                descCommandList.push(new EntryImpl(rawEntry));
            }
        }
        return descCommandList;
    }
    exports.getCommands = getCommands;
    exports.fullCommandList = commands.fullCommandList;
});
