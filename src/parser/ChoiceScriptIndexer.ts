import { Range, Position, DocumentUri, MarkupContent, MarkupKind, TextDocument } from 'vscode-languageserver-types';
import * as nodes from '../parser/ChoiceScriptNodes';
import { ChoiceScriptParser } from '../parser/ChoiceScriptParser';
import { NodeStringDecoder } from 'string_decoder';
import { URI } from 'vscode-uri';
import { Symbols } from './ChoiceScriptSymbolScope';
let parser = new ChoiceScriptParser();

function _getProjectPath(uri: DocumentUri): string {
	return uri.slice(0, uri.lastIndexOf('/') + 1);
}

function _getSceneName(uri: DocumentUri): string {
	return uri.slice(_getProjectPath(uri).length, -".txt".length);
}

interface SceneIndex {
	uri: DocumentUri;
	textDocument: TextDocument; // remember version
	node: nodes.Scene;
}

export class ChoiceScriptIndexer {

	private projectIndexes: { [key: string] : ChoiceScriptProjectIndex; } = {};
	private static singletonIndex: ChoiceScriptIndexer = new ChoiceScriptIndexer();

	private constructor() {

	}

	public static get index(): ChoiceScriptIndexer {
		return ChoiceScriptIndexer.singletonIndex;
	}

	private removeFromProjectIndex(resources: DocumentUri[]): void {
		let projectPath = _getProjectPath(resources[0]);
		let index = this.projectIndexes[projectPath];
		if (!index) {
			return;
		}
		for (let r of resources) {
			index.removeScene(r);
		}
	}

	private addToProjectIndex(resources: TextDocument[], force?: boolean): void {
		let projectPath = _getProjectPath(resources[0].uri);
		let index = this.projectIndexes[projectPath];
		if (!index) {
			this.projectIndexes[projectPath] = new ChoiceScriptProjectIndex(resources);
			return;
		}
		for (let r of resources) {
			index.updateScene(r, force);
		}
	}

	public sync(scenePath: DocumentUri, resources?: TextDocument[], forceUpdate?: boolean): ChoiceScriptProjectIndex | null {
		// update state
		if (resources) {
			this.addToProjectIndex(resources, forceUpdate);
		}
		let projectPath = _getProjectPath(scenePath);
		let projectIndex = this.projectIndexes[projectPath] || null;
		return projectIndex;
	}

	public purge(scenePath: DocumentUri, resources?: DocumentUri[]): ChoiceScriptProjectIndex | null {
		let projectPath = _getProjectPath(scenePath);
		if (!resources) {
			// delete everything in the project
			delete this.projectIndexes[projectPath];
		} else {
			// purge specific scenes
			this.removeFromProjectIndex(resources);
		}
		let projectIndex = this.projectIndexes[projectPath] || null;
		return projectIndex;
	}

	public getProjectIndexForScene(uri: DocumentUri): ChoiceScriptProjectIndex | null {
		return this.projectIndexes[_getProjectPath(uri)] || null;
	}

}
export class ChoiceScriptProjectIndex {
	private scenes: SceneIndex[] = [];
	private path: string;

	constructor(documents: TextDocument[]) {
		for (let doc of documents) {
			this.scenes.push({uri: doc.uri, textDocument: doc, node: parser.parseScene.bind(parser)(doc)});
		}
		this.path = this.scenes[0] ? _getProjectPath(this.scenes[0].uri) : "";
	}

	public getSceneIndex(uri: DocumentUri): SceneIndex | null {
		for (let scene of this.scenes) {
			if (scene.uri === uri) {
				return scene;
			}
		}
		return null;
	}

	public getStartupIndex(): SceneIndex | null {
		return this.getSceneIndex(this.path + "startup.txt");
	}

	public getSceneDocByName(name: string): TextDocument | null {
		return this.getSceneIndex(this.path + name + ".txt")?.textDocument ?? null;
	}

	public getSceneNodeByName(name: string): nodes.Scene | null {
		return this.getSceneNode(this.path + name + ".txt");
	}

	public getSceneNode(uri: DocumentUri): nodes.Scene | null {
		return this.getSceneIndex(uri)?.node ?? null;
	}

	public getSceneList(): string[] {
		return this.scenes.map((scene) => _getSceneName(scene.uri));
	}

	public getSceneSymbolsByName(name: string): Symbols | null {
		let node = this.getSceneNodeByName(name);
		if (!node) {
			return null;
		}
		return new Symbols(node);
	}

	public removeScene(uri: DocumentUri): boolean {
		let scene = this.getSceneIndex(uri);
		for (let s = 0; s < this.scenes.length; s++) {
			if (this.scenes[s].uri === uri) {
				this.scenes.splice(s, 1);
				return true;
			}
		}
		return false;
	}

	// returns true if updated/created
	public updateScene(doc: TextDocument, force?: boolean): boolean {
		let scene = this.getSceneIndex(doc.uri);
		if (!force && scene && (doc.version === scene.textDocument.version)) {
			return false;
		}
		if (!scene) {
			scene = {uri: doc.uri, textDocument: doc, node: parser.parseScene.bind(parser)(doc)};
			this.scenes.push(scene);
		} else {
			scene.uri = doc.uri;
			scene.textDocument = doc;
			scene.node = parser.parseScene.bind(parser)(doc);
		}
		return true;
	}

}