import { ChoiceScriptParser } from '../parser/ChoiceScriptParser';
import { Symbols } from './ChoiceScriptSymbolScope';
var parser = new ChoiceScriptParser();
function _getProjectPath(uri) {
    return uri.slice(0, uri.lastIndexOf('/') + 1);
}
function _getSceneName(uri) {
    return uri.slice(_getProjectPath(uri).length, -".txt".length);
}
var ChoiceScriptIndexer = /** @class */ (function () {
    function ChoiceScriptIndexer() {
        this.projectIndexes = {};
    }
    Object.defineProperty(ChoiceScriptIndexer, "index", {
        get: function () {
            return ChoiceScriptIndexer.singletonIndex;
        },
        enumerable: false,
        configurable: true
    });
    ChoiceScriptIndexer.prototype.removeFromProjectIndex = function (resources) {
        var projectPath = _getProjectPath(resources[0]);
        var index = this.projectIndexes[projectPath];
        if (!index) {
            return;
        }
        for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
            var r = resources_1[_i];
            index.removeScene(r);
        }
    };
    ChoiceScriptIndexer.prototype.addToProjectIndex = function (resources, force) {
        var projectPath = _getProjectPath(resources[0].uri);
        var index = this.projectIndexes[projectPath];
        if (!index) {
            this.projectIndexes[projectPath] = new ChoiceScriptProjectIndex(resources);
            return;
        }
        for (var _i = 0, resources_2 = resources; _i < resources_2.length; _i++) {
            var r = resources_2[_i];
            index.updateScene(r, force);
        }
    };
    ChoiceScriptIndexer.prototype.sync = function (scenePath, resources, forceUpdate) {
        // update state
        if (resources) {
            this.addToProjectIndex(resources, forceUpdate);
        }
        var projectPath = _getProjectPath(scenePath);
        var projectIndex = this.projectIndexes[projectPath] || null;
        return projectIndex;
    };
    ChoiceScriptIndexer.prototype.purge = function (scenePath, resources) {
        var projectPath = _getProjectPath(scenePath);
        if (!resources) {
            // delete everything in the project
            delete this.projectIndexes[projectPath];
        }
        else {
            // purge specific scenes
            this.removeFromProjectIndex(resources);
        }
        var projectIndex = this.projectIndexes[projectPath] || null;
        return projectIndex;
    };
    ChoiceScriptIndexer.prototype.getProjectIndexForScene = function (uri) {
        return this.projectIndexes[_getProjectPath(uri)] || null;
    };
    ChoiceScriptIndexer.singletonIndex = new ChoiceScriptIndexer();
    return ChoiceScriptIndexer;
}());
export { ChoiceScriptIndexer };
var ChoiceScriptProjectIndex = /** @class */ (function () {
    function ChoiceScriptProjectIndex(documents) {
        this.scenes = [];
        for (var _i = 0, documents_1 = documents; _i < documents_1.length; _i++) {
            var doc = documents_1[_i];
            this.scenes.push({ uri: doc.uri, textDocument: doc, node: parser.parseScene.bind(parser)(doc) });
        }
        this.path = this.scenes[0] ? _getProjectPath(this.scenes[0].uri) : "";
    }
    ChoiceScriptProjectIndex.prototype.getSceneIndex = function (uri) {
        for (var _i = 0, _a = this.scenes; _i < _a.length; _i++) {
            var scene = _a[_i];
            if (scene.uri === uri) {
                return scene;
            }
        }
        return null;
    };
    ChoiceScriptProjectIndex.prototype.getStartupIndex = function () {
        return this.getSceneIndex(this.path + "startup.txt");
    };
    ChoiceScriptProjectIndex.prototype.getSceneDocByName = function (name) {
        var _a, _b;
        return (_b = (_a = this.getSceneIndex(this.path + name + ".txt")) === null || _a === void 0 ? void 0 : _a.textDocument) !== null && _b !== void 0 ? _b : null;
    };
    ChoiceScriptProjectIndex.prototype.getSceneNodeByName = function (name) {
        return this.getSceneNode(this.path + name + ".txt");
    };
    ChoiceScriptProjectIndex.prototype.getSceneNode = function (uri) {
        var _a, _b;
        return (_b = (_a = this.getSceneIndex(uri)) === null || _a === void 0 ? void 0 : _a.node) !== null && _b !== void 0 ? _b : null;
    };
    ChoiceScriptProjectIndex.prototype.getSceneList = function () {
        return this.scenes.map(function (scene) { return _getSceneName(scene.uri); });
    };
    ChoiceScriptProjectIndex.prototype.getSceneSymbolsByName = function (name) {
        var node = this.getSceneNodeByName(name);
        if (!node) {
            return null;
        }
        return new Symbols(node);
    };
    ChoiceScriptProjectIndex.prototype.removeScene = function (uri) {
        var scene = this.getSceneIndex(uri);
        for (var s = 0; s < this.scenes.length; s++) {
            if (this.scenes[s].uri === uri) {
                this.scenes.splice(s, 1);
                return true;
            }
        }
        return false;
    };
    // returns true if updated/created
    ChoiceScriptProjectIndex.prototype.updateScene = function (doc, force) {
        var scene = this.getSceneIndex(doc.uri);
        if (!force && scene && (doc.version === scene.textDocument.version)) {
            return false;
        }
        if (!scene) {
            scene = { uri: doc.uri, textDocument: doc, node: parser.parseScene.bind(parser)(doc) };
            this.scenes.push(scene);
        }
        else {
            scene.uri = doc.uri;
            scene.textDocument = doc;
            scene.node = parser.parseScene.bind(parser)(doc);
        }
        return true;
    };
    return ChoiceScriptProjectIndex;
}());
export { ChoiceScriptProjectIndex };
