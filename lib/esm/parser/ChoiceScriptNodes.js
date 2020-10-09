/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <summary>
/// Nodes for the css 2.1 specification. See for reference:
/// http://www.w3.org/TR/CSS21/grammar.html#grammar
/// </summary>
export var ChoiceScriptType;
(function (ChoiceScriptType) {
    ChoiceScriptType[ChoiceScriptType["Number"] = 0] = "Number";
    ChoiceScriptType[ChoiceScriptType["String"] = 1] = "String";
    ChoiceScriptType[ChoiceScriptType["Boolean"] = 2] = "Boolean";
})(ChoiceScriptType || (ChoiceScriptType = {}));
export var LineType;
(function (LineType) {
    LineType[LineType["Text"] = 0] = "Text";
    LineType[LineType["ChoiceScript"] = 1] = "ChoiceScript";
    LineType[LineType["Comment"] = 2] = "Comment";
    LineType[LineType["ChoiceOption"] = 3] = "ChoiceOption";
})(LineType || (LineType = {}));
export var IndentType;
(function (IndentType) {
    IndentType[IndentType["Spaces"] = 0] = "Spaces";
    IndentType[IndentType["Tab"] = 1] = "Tab";
    IndentType[IndentType["Mixed"] = 2] = "Mixed";
})(IndentType || (IndentType = {}));
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["Undefined"] = 0] = "Undefined";
    NodeType[NodeType["ChoiceScriptComment"] = 1] = "ChoiceScriptComment";
    NodeType[NodeType["Identifier"] = 2] = "Identifier";
    NodeType[NodeType["Scene"] = 3] = "Scene";
    NodeType[NodeType["SceneRef"] = 4] = "SceneRef";
    NodeType[NodeType["Line"] = 5] = "Line";
    NodeType[NodeType["Label"] = 6] = "Label";
    NodeType[NodeType["LabelRef"] = 7] = "LabelRef";
    NodeType[NodeType["ChoiceScriptLine"] = 8] = "ChoiceScriptLine";
    NodeType[NodeType["ChoiceScriptStatement"] = 9] = "ChoiceScriptStatement";
    NodeType[NodeType["TextLine"] = 10] = "TextLine";
    NodeType[NodeType["StringLiteral"] = 11] = "StringLiteral";
    NodeType[NodeType["Operator"] = 12] = "Operator";
    NodeType[NodeType["Expression"] = 13] = "Expression";
    NodeType[NodeType["BinaryExpression"] = 14] = "BinaryExpression";
    NodeType[NodeType["StringExpression"] = 15] = "StringExpression";
    NodeType[NodeType["Term"] = 16] = "Term";
    NodeType[NodeType["Value"] = 17] = "Value";
    NodeType[NodeType["RealWord"] = 18] = "RealWord";
    NodeType[NodeType["ChoiceCommand"] = 19] = "ChoiceCommand";
    NodeType[NodeType["ChoiceOption"] = 20] = "ChoiceOption";
    NodeType[NodeType["MultiReplace"] = 21] = "MultiReplace";
    NodeType[NodeType["MultiReplaceOption"] = 22] = "MultiReplaceOption";
    NodeType[NodeType["VariableReplacement"] = 23] = "VariableReplacement";
    NodeType[NodeType["PrintVariable"] = 24] = "PrintVariable";
    NodeType[NodeType["NumericValue"] = 25] = "NumericValue";
    NodeType[NodeType["Boolean"] = 26] = "Boolean";
    NodeType[NodeType["Indentation"] = 27] = "Indentation";
    NodeType[NodeType["VariableDeclaration"] = 28] = "VariableDeclaration";
    NodeType[NodeType["LabelDeclaration"] = 29] = "LabelDeclaration";
    NodeType[NodeType["FlowCommand"] = 30] = "FlowCommand";
    // ...
    NodeType[NodeType["HexColorValue"] = 31] = "HexColorValue";
    NodeType[NodeType["Variable"] = 32] = "Variable";
    NodeType[NodeType["CreateVariable"] = 33] = "CreateVariable";
    NodeType[NodeType["If"] = 34] = "If";
    NodeType[NodeType["Else"] = 35] = "Else";
    NodeType[NodeType["For"] = 36] = "For";
    NodeType[NodeType["Each"] = 37] = "Each";
    NodeType[NodeType["While"] = 38] = "While";
    NodeType[NodeType["MixinContentReference"] = 39] = "MixinContentReference";
    NodeType[NodeType["MixinContentDeclaration"] = 40] = "MixinContentDeclaration";
    NodeType[NodeType["Media"] = 41] = "Media";
    NodeType[NodeType["Keyframe"] = 42] = "Keyframe";
    NodeType[NodeType["FontFace"] = 43] = "FontFace";
    NodeType[NodeType["Import"] = 44] = "Import";
    NodeType[NodeType["Namespace"] = 45] = "Namespace";
    NodeType[NodeType["Invocation"] = 46] = "Invocation";
    NodeType[NodeType["FunctionDeclaration"] = 47] = "FunctionDeclaration";
    NodeType[NodeType["ReturnStatement"] = 48] = "ReturnStatement";
    NodeType[NodeType["MediaQuery"] = 49] = "MediaQuery";
    NodeType[NodeType["FunctionParameter"] = 50] = "FunctionParameter";
    NodeType[NodeType["FunctionArgument"] = 51] = "FunctionArgument";
    NodeType[NodeType["KeyframeSelector"] = 52] = "KeyframeSelector";
    NodeType[NodeType["ViewPort"] = 53] = "ViewPort";
    NodeType[NodeType["Document"] = 54] = "Document";
    NodeType[NodeType["AtApplyRule"] = 55] = "AtApplyRule";
    NodeType[NodeType["CustomPropertyDeclaration"] = 56] = "CustomPropertyDeclaration";
    NodeType[NodeType["CustomPropertySet"] = 57] = "CustomPropertySet";
    NodeType[NodeType["ListEntry"] = 58] = "ListEntry";
    NodeType[NodeType["Supports"] = 59] = "Supports";
    NodeType[NodeType["SupportsCondition"] = 60] = "SupportsCondition";
    NodeType[NodeType["NamespacePrefix"] = 61] = "NamespacePrefix";
    NodeType[NodeType["GridLine"] = 62] = "GridLine";
    NodeType[NodeType["Plugin"] = 63] = "Plugin";
    NodeType[NodeType["UnknownAtRule"] = 64] = "UnknownAtRule";
    NodeType[NodeType["Command"] = 65] = "Command";
    NodeType[NodeType["StandardCommand"] = 66] = "StandardCommand";
    NodeType[NodeType["InvalidBuiltin"] = 67] = "InvalidBuiltin";
})(NodeType || (NodeType = {}));
export var ReferenceType;
(function (ReferenceType) {
    ReferenceType[ReferenceType["Label"] = 0] = "Label";
    ReferenceType[ReferenceType["Variable"] = 1] = "Variable";
    ReferenceType[ReferenceType["Unknown"] = 2] = "Unknown";
})(ReferenceType || (ReferenceType = {}));
export function getNodeAtOffset(node, offset) {
    var candidate = null;
    if (!node || offset < node.offset || offset > node.end) {
        return null;
    }
    // Find the shortest node at the position
    node.accept(function (node) {
        if (node.offset === -1 && node.length === -1) {
            return true;
        }
        if (node.offset <= offset && node.end >= offset) {
            if (!candidate) {
                candidate = node;
            }
            else if (node.length <= candidate.length) {
                candidate = node;
            }
            return true;
        }
        return false;
    });
    return candidate;
}
export function getNodePath(node, offset) {
    var candidate = getNodeAtOffset(node, offset);
    var path = [];
    while (candidate) {
        path.unshift(candidate);
        candidate = candidate.parent;
    }
    return path;
}
var Node = /** @class */ (function () {
    function Node(offset, len, nodeType) {
        if (offset === void 0) { offset = -1; }
        if (len === void 0) { len = -1; }
        this.parent = null;
        this.offset = offset;
        this.length = len;
        if (nodeType) {
            this.nodeType = nodeType;
        }
    }
    Object.defineProperty(Node.prototype, "end", {
        get: function () { return this.offset + this.length; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "type", {
        get: function () {
            return this.nodeType || NodeType.Undefined;
        },
        set: function (type) {
            this.nodeType = type;
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.getTextProvider = function () {
        var node = this;
        while (node && !node.textProvider) {
            node = node.parent;
        }
        if (node) {
            return node.textProvider;
        }
        return function () { return 'unknown'; };
    };
    Node.prototype.getText = function () {
        return this.getTextProvider()(this.offset, this.length);
    };
    Node.prototype.matches = function (str) {
        return this.length === str.length && this.getTextProvider()(this.offset, this.length) === str;
    };
    Node.prototype.startsWith = function (str) {
        return this.length >= str.length && this.getTextProvider()(this.offset, str.length) === str;
    };
    Node.prototype.endsWith = function (str) {
        return this.length >= str.length && this.getTextProvider()(this.end - str.length, str.length) === str;
    };
    Node.prototype.accept = function (visitor) {
        if (visitor(this) && this.children) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.accept(visitor);
            }
        }
    };
    Node.prototype.acceptVisitor = function (visitor) {
        this.accept(visitor.visitNode.bind(visitor));
    };
    Node.prototype.adoptChild = function (node, index) {
        if (index === void 0) { index = -1; }
        if (node.parent && node.parent.children) {
            var idx = node.parent.children.indexOf(node);
            if (idx >= 0) {
                node.parent.children.splice(idx, 1);
            }
        }
        node.parent = this;
        var children = this.children;
        if (!children) {
            children = this.children = [];
        }
        if (index !== -1) {
            children.splice(index, 0, node);
        }
        else {
            children.push(node);
        }
        return node;
    };
    Node.prototype.attachTo = function (parent, index) {
        if (index === void 0) { index = -1; }
        if (parent) {
            parent.adoptChild(this, index);
        }
        return this;
    };
    Node.prototype.collectIssues = function (results) {
        if (this.issues) {
            results.push.apply(results, this.issues);
        }
    };
    Node.prototype.addIssue = function (issue) {
        if (!this.issues) {
            this.issues = [];
        }
        this.issues.push(issue);
    };
    Node.prototype.hasIssue = function (rule) {
        return Array.isArray(this.issues) && this.issues.some(function (i) { return i.getRule() === rule; });
    };
    Node.prototype.isErroneous = function (recursive) {
        if (recursive === void 0) { recursive = false; }
        if (this.issues && this.issues.length > 0) {
            return true;
        }
        return recursive && Array.isArray(this.children) && this.children.some(function (c) { return c.isErroneous(true); });
    };
    Node.prototype.setNode = function (field, node, index) {
        if (index === void 0) { index = -1; }
        if (node) {
            node.attachTo(this, index);
            this[field] = node;
            return true;
        }
        return false;
    };
    Node.prototype.addChild = function (node) {
        if (node) {
            if (!this.children) {
                this.children = [];
            }
            node.attachTo(this);
            this.updateOffsetAndLength(node);
            return true;
        }
        return false;
    };
    Node.prototype.updateOffsetAndLength = function (node) {
        if (node.offset < this.offset || this.offset === -1) {
            this.offset = node.offset;
        }
        var nodeEnd = node.end;
        if ((nodeEnd > this.end) || this.length === -1) {
            this.length = nodeEnd - this.offset;
        }
    };
    Node.prototype.hasChildren = function () {
        return !!this.children && this.children.length > 0;
    };
    Node.prototype.getChildren = function () {
        return this.children ? this.children.slice(0) : [];
    };
    Node.prototype.getChild = function (index) {
        if (this.children && index < this.children.length) {
            return this.children[index];
        }
        return null;
    };
    Node.prototype.addChildren = function (nodes) {
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            this.addChild(node);
        }
    };
    Node.prototype.findFirstChildBeforeOffset = function (offset) {
        if (this.children) {
            var current = null;
            for (var i = this.children.length - 1; i >= 0; i--) {
                // iterate until we find a child that has a start offset smaller than the input offset
                current = this.children[i];
                if (current.offset <= offset) {
                    return current;
                }
            }
        }
        return null;
    };
    Node.prototype.findChildAtOffset = function (offset, goDeep) {
        var current = this.findFirstChildBeforeOffset(offset);
        if (current && current.end >= offset) {
            if (goDeep) {
                return current.findChildAtOffset(offset, true) || current;
            }
            return current;
        }
        return null;
    };
    Node.prototype.encloses = function (candidate) {
        return this.offset <= candidate.offset && this.offset + this.length >= candidate.offset + candidate.length;
    };
    Node.prototype.getParent = function () {
        var result = this.parent;
        while (result instanceof Nodelist) {
            result = result.parent;
        }
        return result;
    };
    Node.prototype.findParent = function (type) {
        var result = this;
        while (result && result.type !== type) {
            result = result.parent;
        }
        return result;
    };
    Node.prototype.findAParent = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        var result = this;
        while (result && !types.some(function (t) { return result.type === t; })) {
            result = result.parent;
        }
        return result;
    };
    Node.prototype.setData = function (key, value) {
        if (!this.options) {
            this.options = {};
        }
        this.options[key] = value;
    };
    Node.prototype.getData = function (key) {
        if (!this.options || !this.options.hasOwnProperty(key)) {
            return null;
        }
        return this.options[key];
    };
    return Node;
}());
export { Node };
var Indentation = /** @class */ (function (_super) {
    __extends(Indentation, _super);
    function Indentation(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.iType = IndentType.Spaces;
        _this.depth = 0;
        return _this;
    }
    Indentation.prototype.setIndentUnit = function (indentType) {
        this.iType = indentType;
    };
    Indentation.prototype.setIndentDepth = function (depth) {
        this.depth = depth;
    };
    Object.defineProperty(Indentation.prototype, "type", {
        get: function () {
            return NodeType.Indentation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Indentation.prototype, "indentDepth", {
        get: function () {
            return this.depth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Indentation.prototype, "indentType", {
        get: function () {
            return this.iType;
        },
        enumerable: false,
        configurable: true
    });
    return Indentation;
}(Node));
export { Indentation };
var Nodelist = /** @class */ (function (_super) {
    __extends(Nodelist, _super);
    function Nodelist(parent, index) {
        if (index === void 0) { index = -1; }
        var _this = _super.call(this, -1, -1) || this;
        _this.attachTo(parent, index);
        _this.offset = -1;
        _this.length = -1;
        return _this;
    }
    return Nodelist;
}(Node));
export { Nodelist };
var VariableReplacement = /** @class */ (function (_super) {
    __extends(VariableReplacement, _super);
    function VariableReplacement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(VariableReplacement.prototype, "type", {
        get: function () {
            return NodeType.VariableReplacement;
        },
        enumerable: false,
        configurable: true
    });
    return VariableReplacement;
}(Node));
export { VariableReplacement };
var ChoiceScriptStatement = /** @class */ (function (_super) {
    __extends(ChoiceScriptStatement, _super);
    function ChoiceScriptStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ChoiceScriptStatement.prototype, "type", {
        get: function () {
            return NodeType.ChoiceScriptStatement;
        },
        enumerable: false,
        configurable: true
    });
    return ChoiceScriptStatement;
}(Node));
export { ChoiceScriptStatement };
var ChoiceScriptComment = /** @class */ (function (_super) {
    __extends(ChoiceScriptComment, _super);
    function ChoiceScriptComment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ChoiceScriptComment.prototype, "type", {
        get: function () {
            return NodeType.ChoiceScriptComment;
        },
        enumerable: false,
        configurable: true
    });
    return ChoiceScriptComment;
}(Node));
export { ChoiceScriptComment };
var Identifier = /** @class */ (function (_super) {
    __extends(Identifier, _super);
    function Identifier(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.isCustomProperty = false;
        return _this;
    }
    Object.defineProperty(Identifier.prototype, "type", {
        get: function () {
            return NodeType.Identifier;
        },
        enumerable: false,
        configurable: true
    });
    Identifier.prototype.containsInterpolation = function () {
        return this.hasChildren();
    };
    return Identifier;
}(Node));
export { Identifier };
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Scene.prototype, "type", {
        get: function () {
            return NodeType.Scene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "name", {
        get: function () {
            return this.sceneName;
        },
        enumerable: false,
        configurable: true
    });
    Scene.prototype.setUri = function (uri) {
        this.uri = uri;
        this.sceneName = uri.slice(uri.lastIndexOf('/') + 1, -1 * (".txt".length));
    };
    Scene.prototype.getUri = function () {
        return this.uri;
    };
    Scene.prototype.isStartup = function () {
        if (!this.uri) {
            return false; // best guess
        }
        return /\/startup\.txt$/.test(this.uri);
    };
    Scene.prototype.isStats = function () {
        if (!this.uri) {
            return false; // best guess
        }
        return /\/choicescript_stats\.txt$/.test(this.uri);
    };
    return Scene;
}(Node));
export { Scene };
var SceneRef = /** @class */ (function (_super) {
    __extends(SceneRef, _super);
    function SceneRef(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(SceneRef.prototype, "type", {
        get: function () {
            return NodeType.SceneRef;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneRef.prototype, "name", {
        get: function () {
            return this.sceneName;
        },
        enumerable: false,
        configurable: true
    });
    SceneRef.prototype.getUri = function () {
        return this.uri;
    };
    SceneRef.prototype.isStartup = function () {
        if (!this.uri) {
            return false; // best guess
        }
        return /\/startup\.txt$/.test(this.uri);
    };
    return SceneRef;
}(Node));
export { SceneRef };
var Command = /** @class */ (function (_super) {
    __extends(Command, _super);
    // FIXME could we get a clever way of generic handling/modelling of params/args here?
    function Command(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Command.prototype, "type", {
        get: function () {
            return NodeType.Command;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "name", {
        // grab the unqualified name of the command
        get: function () {
            var match = this.getText().match(/^\*([A-Za-z_]+\b)/);
            return match ? match[1] : this.getText();
        },
        enumerable: false,
        configurable: true
    });
    return Command;
}(Node));
export { Command };
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Label.prototype, "type", {
        get: function () {
            return NodeType.Label;
        },
        enumerable: false,
        configurable: true
    });
    Label.prototype.getValue = function () {
        return this.labelName || this.getText();
    };
    return Label;
}(Command));
export { Label };
var LabelRef = /** @class */ (function (_super) {
    __extends(LabelRef, _super);
    function LabelRef(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        // if the label is in another scene
        _this.sceneRef = null;
        return _this;
    }
    Object.defineProperty(LabelRef.prototype, "type", {
        get: function () {
            return NodeType.LabelRef;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LabelRef.prototype, "scene", {
        get: function () {
            return this.sceneRef;
        },
        enumerable: false,
        configurable: true
    });
    LabelRef.prototype.setSceneRef = function (node) {
        if (node) {
            this.sceneRef = node;
            return true;
        }
        return false;
    };
    return LabelRef;
}(Node));
export { LabelRef };
var StandardCommand = /** @class */ (function (_super) {
    __extends(StandardCommand, _super);
    function StandardCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(StandardCommand.prototype, "type", {
        get: function () {
            return NodeType.StandardCommand;
        },
        enumerable: false,
        configurable: true
    });
    return StandardCommand;
}(Command));
export { StandardCommand };
var FlowCommand = /** @class */ (function (_super) {
    __extends(FlowCommand, _super);
    function FlowCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(FlowCommand.prototype, "type", {
        get: function () {
            return NodeType.FlowCommand;
        },
        enumerable: false,
        configurable: true
    });
    return FlowCommand;
}(Command));
export { FlowCommand };
var RandCommand = /** @class */ (function (_super) {
    __extends(RandCommand, _super);
    function RandCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(RandCommand.prototype, "type", {
        get: function () {
            return NodeType.Command;
        },
        enumerable: false,
        configurable: true
    });
    return RandCommand;
}(Command));
export { RandCommand };
var SetCommand = /** @class */ (function (_super) {
    __extends(SetCommand, _super);
    function SetCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    SetCommand.prototype.getExpr = function () {
        return this.expr;
    };
    SetCommand.prototype.getVariable = function () {
        return this.variable;
    };
    SetCommand.prototype.setVariable = function (node) {
        if (node) {
            node.attachTo(this);
            this.variable = node;
            return true;
        }
        return false;
    };
    SetCommand.prototype.setValue = function (node) {
        if (node) {
            node.attachTo(this);
            this.expr = node;
            return true;
        }
        return false;
    };
    Object.defineProperty(SetCommand.prototype, "type", {
        get: function () {
            return NodeType.Command;
        },
        enumerable: false,
        configurable: true
    });
    return SetCommand;
}(Command));
export { SetCommand };
var ChoiceCommand = /** @class */ (function (_super) {
    __extends(ChoiceCommand, _super);
    // FIXME member array for choice options?
    function ChoiceCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(ChoiceCommand.prototype, "type", {
        get: function () {
            return NodeType.ChoiceCommand;
        },
        enumerable: false,
        configurable: true
    });
    return ChoiceCommand;
}(StandardCommand));
export { ChoiceCommand };
var ChoiceOption = /** @class */ (function (_super) {
    __extends(ChoiceOption, _super);
    function ChoiceOption(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(ChoiceOption.prototype, "type", {
        get: function () {
            return NodeType.ChoiceOption;
        },
        enumerable: false,
        configurable: true
    });
    return ChoiceOption;
}(Node));
export { ChoiceOption };
var RealWord = /** @class */ (function (_super) {
    __extends(RealWord, _super);
    function RealWord(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(RealWord.prototype, "type", {
        get: function () {
            return NodeType.RealWord;
        },
        enumerable: false,
        configurable: true
    });
    return RealWord;
}(Node));
export { RealWord };
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.lineType = LineType.Text;
        _this.indentDepth = 0;
        return _this;
    }
    Line.prototype.getLineNum = function () {
        return this.lineNumber;
    };
    Line.prototype.setLineNum = function (lineNumber) {
        if (lineNumber > 0) {
            this.lineNumber = lineNumber;
            return true;
        }
        return false;
    };
    Object.defineProperty(Line.prototype, "type", {
        get: function () {
            return NodeType.Line;
        },
        enumerable: false,
        configurable: true
    });
    Line.prototype.setLineType = function (lineType) {
        this.lineType = lineType;
    };
    Line.prototype.getLineType = function () {
        return this.lineType;
    };
    Line.prototype.addIndent = function (node) {
        if (node) {
            node.attachTo(this);
            this.indentNode = node;
            this.indentDepth = node.indentDepth;
            return true;
        }
        return false;
    };
    Line.prototype.getIndentNode = function () {
        return this.indentNode;
    };
    Object.defineProperty(Line.prototype, "indent", {
        get: function () {
            return this.indentDepth;
        },
        enumerable: false,
        configurable: true
    });
    return Line;
}(Node));
export { Line };
var TextLine = /** @class */ (function (_super) {
    __extends(TextLine, _super);
    function TextLine(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(TextLine.prototype, "type", {
        get: function () {
            return NodeType.TextLine;
        },
        enumerable: false,
        configurable: true
    });
    return TextLine;
}(Line));
export { TextLine };
var ChoiceScriptLine = /** @class */ (function (_super) {
    __extends(ChoiceScriptLine, _super);
    function ChoiceScriptLine(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(ChoiceScriptLine.prototype, "type", {
        get: function () {
            return NodeType.ChoiceScriptLine;
        },
        enumerable: false,
        configurable: true
    });
    return ChoiceScriptLine;
}(Line));
export { ChoiceScriptLine };
var AtApplyRule = /** @class */ (function (_super) {
    __extends(AtApplyRule, _super);
    function AtApplyRule(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(AtApplyRule.prototype, "type", {
        get: function () {
            return NodeType.AtApplyRule;
        },
        enumerable: false,
        configurable: true
    });
    AtApplyRule.prototype.setIdentifier = function (node) {
        return this.setNode('identifier', node, 0);
    };
    AtApplyRule.prototype.getIdentifier = function () {
        return this.identifier;
    };
    AtApplyRule.prototype.getName = function () {
        return this.identifier ? this.identifier.getText() : '';
    };
    return AtApplyRule;
}(Node));
export { AtApplyRule };
var Invocation = /** @class */ (function (_super) {
    __extends(Invocation, _super);
    function Invocation(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Invocation.prototype, "type", {
        get: function () {
            return NodeType.Invocation;
        },
        enumerable: false,
        configurable: true
    });
    Invocation.prototype.getArguments = function () {
        if (!this.arguments) {
            this.arguments = new Nodelist(this);
        }
        return this.arguments;
    };
    return Invocation;
}(Node));
export { Invocation };
var FunctionParameter = /** @class */ (function (_super) {
    __extends(FunctionParameter, _super);
    function FunctionParameter(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(FunctionParameter.prototype, "type", {
        get: function () {
            return NodeType.FunctionParameter;
        },
        enumerable: false,
        configurable: true
    });
    FunctionParameter.prototype.setIdentifier = function (node) {
        return this.setNode('identifier', node, 0);
    };
    FunctionParameter.prototype.getIdentifier = function () {
        return this.identifier;
    };
    FunctionParameter.prototype.getName = function () {
        return this.identifier ? this.identifier.getText() : '';
    };
    FunctionParameter.prototype.setDefaultValue = function (node) {
        return this.setNode('defaultValue', node, 0);
    };
    FunctionParameter.prototype.getDefaultValue = function () {
        return this.defaultValue;
    };
    return FunctionParameter;
}(Node));
export { FunctionParameter };
var FunctionArgument = /** @class */ (function (_super) {
    __extends(FunctionArgument, _super);
    function FunctionArgument(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(FunctionArgument.prototype, "type", {
        get: function () {
            return NodeType.FunctionArgument;
        },
        enumerable: false,
        configurable: true
    });
    FunctionArgument.prototype.setIdentifier = function (node) {
        return this.setNode('identifier', node, 0);
    };
    FunctionArgument.prototype.getIdentifier = function () {
        return this.identifier;
    };
    FunctionArgument.prototype.getName = function () {
        return this.identifier ? this.identifier.getText() : '';
    };
    FunctionArgument.prototype.setValue = function (node) {
        return this.setNode('value', node, 0);
    };
    FunctionArgument.prototype.getValue = function () {
        return this.value;
    };
    return FunctionArgument;
}(Node));
export { FunctionArgument };
var Import = /** @class */ (function (_super) {
    __extends(Import, _super);
    function Import(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Import.prototype, "type", {
        get: function () {
            return NodeType.Import;
        },
        enumerable: false,
        configurable: true
    });
    Import.prototype.setMedialist = function (node) {
        if (node) {
            node.attachTo(this);
            return true;
        }
        return false;
    };
    return Import;
}(Node));
export { Import };
var Namespace = /** @class */ (function (_super) {
    __extends(Namespace, _super);
    function Namespace(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Namespace.prototype, "type", {
        get: function () {
            return NodeType.Namespace;
        },
        enumerable: false,
        configurable: true
    });
    return Namespace;
}(Node));
export { Namespace };
var MediaQuery = /** @class */ (function (_super) {
    __extends(MediaQuery, _super);
    function MediaQuery(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(MediaQuery.prototype, "type", {
        get: function () {
            return NodeType.MediaQuery;
        },
        enumerable: false,
        configurable: true
    });
    return MediaQuery;
}(Node));
export { MediaQuery };
var SupportsCondition = /** @class */ (function (_super) {
    __extends(SupportsCondition, _super);
    function SupportsCondition(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(SupportsCondition.prototype, "type", {
        get: function () {
            return NodeType.SupportsCondition;
        },
        enumerable: false,
        configurable: true
    });
    return SupportsCondition;
}(Node));
export { SupportsCondition };
var MultiReplaceOption = /** @class */ (function (_super) {
    __extends(MultiReplaceOption, _super);
    function MultiReplaceOption() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(MultiReplaceOption.prototype, "type", {
        get: function () {
            return NodeType.MultiReplaceOption;
        },
        enumerable: false,
        configurable: true
    });
    return MultiReplaceOption;
}(Node));
export { MultiReplaceOption };
var MultiReplace = /** @class */ (function (_super) {
    __extends(MultiReplace, _super);
    function MultiReplace(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.variants = [];
        return _this;
    }
    Object.defineProperty(MultiReplace.prototype, "type", {
        get: function () {
            return NodeType.MultiReplace;
        },
        enumerable: false,
        configurable: true
    });
    MultiReplace.prototype.addVariant = function (variant) {
        if (variant) {
            this.variants.push(variant);
            this.addChild(variant);
        }
        return this.variants.length;
    };
    MultiReplace.prototype.setExpression = function (value) {
        return this.setNode('expression', value);
    };
    MultiReplace.prototype.getExpression = function () {
        return this.expression;
    };
    MultiReplace.prototype.getOptions = function () {
        return this.variants;
    };
    return MultiReplace;
}(VariableReplacement));
export { MultiReplace };
var Expression = /** @class */ (function (_super) {
    __extends(Expression, _super);
    function Expression(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Expression.prototype, "type", {
        get: function () {
            return NodeType.Expression;
        },
        enumerable: false,
        configurable: true
    });
    Expression.prototype.setLeft = function (left) {
        return this.setNode('left', left);
    };
    Expression.prototype.getLeft = function () {
        return this.left;
    };
    Expression.prototype.setRight = function (right) {
        return this.setNode('right', right);
    };
    Expression.prototype.getRight = function () {
        return this.right;
    };
    Expression.prototype.setOperator = function (node) {
        var ret = this.setNode('operator', node);
        if (ret) {
            this.exprType = node.csType;
        }
        return ret;
    };
    Expression.prototype.getOperator = function () {
        return this.operator;
    };
    Expression.prototype.isSingleValue = function () {
        return (typeof this.getLeft() !== 'undefined' &&
            (!this.getRight() && !this.getOperator()));
    };
    Object.defineProperty(Expression.prototype, "csType", {
        get: function () {
            if (this.getLeft() && !this.getRight()) {
                switch (this.getLeft().type) {
                    case NodeType.NumericValue:
                        return ChoiceScriptType.Number;
                    case NodeType.StringLiteral:
                        return ChoiceScriptType.String;
                    case NodeType.BinaryExpression:
                    case NodeType.Boolean:
                        return ChoiceScriptType.Boolean;
                    case NodeType.Identifier:
                        return undefined; // FIXME
                    default:
                        return undefined;
                }
                var term = this.getLeft();
                return term.csType;
            }
            return this.exprType; // || this.getLeft().csType;
        },
        enumerable: false,
        configurable: true
    });
    return Expression;
}(Node));
export { Expression };
var BinaryExpression = /** @class */ (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(BinaryExpression.prototype, "type", {
        get: function () {
            return NodeType.BinaryExpression;
        },
        enumerable: false,
        configurable: true
    });
    return BinaryExpression;
}(Expression));
export { BinaryExpression };
var StringExpression = /** @class */ (function (_super) {
    __extends(StringExpression, _super);
    function StringExpression(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(StringExpression.prototype, "type", {
        get: function () {
            return NodeType.StringExpression;
        },
        enumerable: false,
        configurable: true
    });
    return StringExpression;
}(Expression));
export { StringExpression };
var Term = /** @class */ (function (_super) {
    __extends(Term, _super);
    function Term(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Term.prototype, "type", {
        get: function () {
            return NodeType.Term;
        },
        enumerable: false,
        configurable: true
    });
    Term.prototype.setValue = function (node) {
        if (!this.addChild(node)) {
            return false;
        }
        switch (node === null || node === void 0 ? void 0 : node.type) {
            case NodeType.StringExpression:
            case NodeType.BinaryExpression:
            case NodeType.Expression:
                var expr = node;
                this.valueType = expr.csType;
                break;
            case NodeType.NumericValue:
                this.valueType = ChoiceScriptType.Number;
                break;
            case NodeType.StringLiteral:
                this.valueType = ChoiceScriptType.String;
                break;
            case NodeType.Boolean:
                this.valueType = ChoiceScriptType.Boolean;
                break;
            case NodeType.Identifier:
                this.valueType = undefined; // FIXME
                break;
        }
        return true;
    };
    Object.defineProperty(Term.prototype, "csType", {
        get: function () {
            return this.valueType;
        },
        enumerable: false,
        configurable: true
    });
    return Term;
}(Node));
export { Term };
var Operator = /** @class */ (function (_super) {
    __extends(Operator, _super);
    function Operator(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Operator.prototype.setCSType = function (type) {
        this.operatorType = type;
    };
    Object.defineProperty(Operator.prototype, "type", {
        get: function () {
            return NodeType.Operator;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Operator.prototype, "csType", {
        get: function () {
            return this.operatorType;
        },
        enumerable: false,
        configurable: true
    });
    return Operator;
}(Node));
export { Operator };
var HexColorValue = /** @class */ (function (_super) {
    __extends(HexColorValue, _super);
    function HexColorValue(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(HexColorValue.prototype, "type", {
        get: function () {
            return NodeType.HexColorValue;
        },
        enumerable: false,
        configurable: true
    });
    return HexColorValue;
}(Node));
export { HexColorValue };
var _dot = '.'.charCodeAt(0), _0 = '0'.charCodeAt(0), _9 = '9'.charCodeAt(0);
var NumericValue = /** @class */ (function (_super) {
    __extends(NumericValue, _super);
    function NumericValue(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(NumericValue.prototype, "type", {
        get: function () {
            return NodeType.NumericValue;
        },
        enumerable: false,
        configurable: true
    });
    NumericValue.prototype.getValue = function () {
        var raw = this.getText();
        var unitIdx = 0;
        var code;
        for (var i = 0, len = raw.length; i < len; i++) {
            code = raw.charCodeAt(i);
            if (!(_0 <= code && code <= _9 || code === _dot)) {
                break;
            }
            unitIdx += 1;
        }
        return {
            value: raw.substring(0, unitIdx),
            unit: unitIdx < raw.length ? raw.substring(unitIdx) : undefined
        };
    };
    return NumericValue;
}(Node));
export { NumericValue };
var StringValue = /** @class */ (function (_super) {
    __extends(StringValue, _super);
    function StringValue(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(StringValue.prototype, "type", {
        get: function () {
            return NodeType.StringLiteral;
        },
        enumerable: false,
        configurable: true
    });
    StringValue.prototype.getValue = function () {
        return this.getText();
    };
    return StringValue;
}(Node));
export { StringValue };
var VariableDeclaration = /** @class */ (function (_super) {
    __extends(VariableDeclaration, _super);
    function VariableDeclaration(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.variable = null;
        _this.expr = null;
        return _this;
    }
    VariableDeclaration.prototype.setVariable = function (node) {
        if (node) {
            node.attachTo(this);
            this.variable = node;
            return true;
        }
        return false;
    };
    VariableDeclaration.prototype.setExpr = function (node) {
        if (node) {
            node.attachTo(this);
            this.expr = node;
            return true;
        }
        return false;
    };
    Object.defineProperty(VariableDeclaration.prototype, "csType", {
        // Getters
        get: function () {
            var _a;
            return (_a = this.expr) === null || _a === void 0 ? void 0 : _a.csType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VariableDeclaration.prototype, "type", {
        get: function () {
            return NodeType.VariableDeclaration;
        },
        enumerable: false,
        configurable: true
    });
    VariableDeclaration.prototype.isConstant = function () {
        return this.getName() === this.getName().toUpperCase();
    };
    VariableDeclaration.prototype.getVariable = function () {
        return this.variable;
    };
    VariableDeclaration.prototype.getName = function () {
        return this.variable ? this.variable.getName() : '';
    };
    VariableDeclaration.prototype.getExpr = function () {
        return this.expr;
    };
    return VariableDeclaration;
}(Command));
export { VariableDeclaration };
var LabelDeclaration = /** @class */ (function (_super) {
    __extends(LabelDeclaration, _super);
    function LabelDeclaration(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(LabelDeclaration.prototype, "type", {
        get: function () {
            return NodeType.LabelDeclaration;
        },
        enumerable: false,
        configurable: true
    });
    LabelDeclaration.prototype.setLabel = function (node) {
        if (node) {
            node.attachTo(this);
            this.label = node;
            return true;
        }
        return false;
    };
    LabelDeclaration.prototype.getLabel = function () {
        return this.label;
    };
    return LabelDeclaration;
}(Command));
export { LabelDeclaration };
var Variable = /** @class */ (function (_super) {
    __extends(Variable, _super);
    function Variable(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.varType = undefined;
        return _this;
    }
    Variable.prototype._setCSType = function (node) {
        switch (node.type) {
            case NodeType.BinaryExpression:
                this.varType = ChoiceScriptType.Boolean;
                break;
            case NodeType.NumericValue:
                this.varType = ChoiceScriptType.Number;
                break;
            case NodeType.StringLiteral:
                this.varType = ChoiceScriptType.String;
                break;
            default:
                break;
        }
    };
    Variable.prototype.setValue = function (node) {
        if (node) {
            node.attachTo(this);
            this.value = node;
            this._setCSType(node);
            return true;
        }
        return false;
    };
    Object.defineProperty(Variable.prototype, "csType", {
        get: function () {
            return this.varType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Variable.prototype, "const", {
        get: function () {
            return /^const_[\w0-9]+/.test(this.getText());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Variable.prototype, "type", {
        get: function () {
            return NodeType.Variable;
        },
        enumerable: false,
        configurable: true
    });
    Variable.prototype.getName = function () {
        return this.getText();
    };
    Variable.prototype.getValue = function () {
        return this.value;
    };
    return Variable;
}(Node));
export { Variable };
var ListEntry = /** @class */ (function (_super) {
    __extends(ListEntry, _super);
    function ListEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ListEntry.prototype, "type", {
        get: function () {
            return NodeType.ListEntry;
        },
        enumerable: false,
        configurable: true
    });
    ListEntry.prototype.setKey = function (node) {
        return this.setNode('key', node, 0);
    };
    ListEntry.prototype.setValue = function (node) {
        return this.setNode('value', node, 1);
    };
    return ListEntry;
}(Node));
export { ListEntry };
var LessGuard = /** @class */ (function (_super) {
    __extends(LessGuard, _super);
    function LessGuard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LessGuard.prototype.getConditions = function () {
        if (!this.conditions) {
            this.conditions = new Nodelist(this);
        }
        return this.conditions;
    };
    return LessGuard;
}(Node));
export { LessGuard };
var GuardCondition = /** @class */ (function (_super) {
    __extends(GuardCondition, _super);
    function GuardCondition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GuardCondition.prototype.setVariable = function (node) {
        return this.setNode('variable', node);
    };
    return GuardCondition;
}(Node));
export { GuardCondition };
export var Level;
(function (Level) {
    Level[Level["Ignore"] = 0] = "Ignore";
    Level[Level["Error"] = 1] = "Error";
    Level[Level["Warning"] = 2] = "Warning";
    Level[Level["Information"] = 3] = "Information";
    Level[Level["Hint"] = 4] = "Hint";
})(Level || (Level = {}));
var Marker = /** @class */ (function () {
    function Marker(node, rule, level, message, offset, length) {
        if (offset === void 0) { offset = node.offset; }
        if (length === void 0) { length = node.length; }
        this.node = node;
        this.rule = rule;
        this.level = level;
        this.message = message || rule.message;
        this.offset = offset;
        this.length = length;
    }
    Marker.prototype.getRule = function () {
        return this.rule;
    };
    Marker.prototype.getLevel = function () {
        return this.level;
    };
    Marker.prototype.getOffset = function () {
        return this.offset;
    };
    Marker.prototype.getLength = function () {
        return this.length;
    };
    Marker.prototype.getNode = function () {
        return this.node;
    };
    Marker.prototype.getMessage = function () {
        return this.message;
    };
    return Marker;
}());
export { Marker };
/*
export class DefaultVisitor implements IVisitor {

    public visitNode(node:Node):boolean {
        switch (node.type) {
            case NodeType.Stylesheet:
                return this.visitStylesheet(<Stylesheet> node);
            case NodeType.FontFace:
                return this.visitFontFace(<FontFace> node);
            case NodeType.Ruleset:
                return this.visitRuleSet(<RuleSet> node);
            case NodeType.Selector:
                return this.visitSelector(<Selector> node);
            case NodeType.SimpleSelector:
                return this.visitSimpleSelector(<SimpleSelector> node);
            case NodeType.Declaration:
                return this.visitDeclaration(<Declaration> node);
            case NodeType.Function:
                return this.visitFunction(<Function> node);
            case NodeType.FunctionDeclaration:
                return this.visitFunctionDeclaration(<FunctionDeclaration> node);
            case NodeType.FunctionParameter:
                return this.visitFunctionParameter(<FunctionParameter> node);
            case NodeType.FunctionArgument:
                return this.visitFunctionArgument(<FunctionArgument> node);
            case NodeType.Term:
                return this.visitTerm(<Term> node);
            case NodeType.Declaration:
                return this.visitExpression(<Expression> node);
            case NodeType.NumericValue:
                return this.visitNumericValue(<NumericValue> node);
            case NodeType.Page:
                return this.visitPage(<Page> node);
            case NodeType.PageBoxMarginBox:
                return this.visitPageBoxMarginBox(<PageBoxMarginBox> node);
            case NodeType.Property:
                return this.visitProperty(<Property> node);
            case NodeType.NumericValue:
                return this.visitNodelist(<Nodelist> node);
            case NodeType.Import:
                return this.visitImport(<Import> node);
            case NodeType.Namespace:
                return this.visitNamespace(<Namespace> node);
            case NodeType.Keyframe:
                return this.visitKeyframe(<Keyframe> node);
            case NodeType.KeyframeSelector:
                return this.visitKeyframeSelector(<KeyframeSelector> node);
            case NodeType.MixinDeclaration:
                return this.visitMixinDeclaration(<MixinDeclaration> node);
            case NodeType.MixinReference:
                return this.visitMixinReference(<MixinReference> node);
            case NodeType.Variable:
                return this.visitVariable(<Variable> node);
            case NodeType.VariableDeclaration:
                return this.visitVariableDeclaration(<VariableDeclaration> node);
        }
        return this.visitUnknownNode(node);
    }

    public visitFontFace(node:FontFace):boolean {
        return true;
    }

    public visitKeyframe(node:Keyframe):boolean {
        return true;
    }

    public visitKeyframeSelector(node:KeyframeSelector):boolean {
        return true;
    }

    public visitStylesheet(node:Stylesheet):boolean {
        return true;
    }

    public visitProperty(Node:Property):boolean {
        return true;
    }

    public visitRuleSet(node:RuleSet):boolean {
        return true;
    }

    public visitSelector(node:Selector):boolean {
        return true;
    }

    public visitSimpleSelector(node:SimpleSelector):boolean {
        return true;
    }

    public visitDeclaration(node:Declaration):boolean {
        return true;
    }

    public visitFunction(node:Function):boolean {
        return true;
    }

    public visitFunctionDeclaration(node:FunctionDeclaration):boolean {
        return true;
    }

    public visitInvocation(node:Invocation):boolean {
        return true;
    }

    public visitTerm(node:Term):boolean {
        return true;
    }

    public visitImport(node:Import):boolean {
        return true;
    }

    public visitNamespace(node:Namespace):boolean {
        return true;
    }

    public visitExpression(node:Expression):boolean {
        return true;
    }

    public visitNumericValue(node:NumericValue):boolean {
        return true;
    }

    public visitPage(node:Page):boolean {
        return true;
    }

    public visitPageBoxMarginBox(node:PageBoxMarginBox):boolean {
        return true;
    }

    public visitNodelist(node:Nodelist):boolean {
        return true;
    }

    public visitVariableDeclaration(node:VariableDeclaration):boolean {
        return true;
    }

    public visitVariable(node:Variable):boolean {
        return true;
    }

    public visitMixinDeclaration(node:MixinDeclaration):boolean {
        return true;
    }

    public visitMixinReference(node:MixinReference):boolean {
        return true;
    }

    public visitUnknownNode(node:Node):boolean {
        return true;
    }
}
*/
var ParseErrorCollector = /** @class */ (function () {
    function ParseErrorCollector() {
        this.entries = [];
    }
    ParseErrorCollector.entries = function (node) {
        var visitor = new ParseErrorCollector();
        node.acceptVisitor(visitor);
        return visitor.entries;
    };
    ParseErrorCollector.prototype.visitNode = function (node) {
        if (node.isErroneous()) {
            node.collectIssues(this.entries);
        }
        return true;
    };
    return ParseErrorCollector;
}());
export { ParseErrorCollector };
