import { DocumentUri, TextDocument } from 'vscode-languageserver-types';
import * as nodes from '../parser/ChoiceScriptNodes';
import { Symbols } from './ChoiceScriptSymbolScope';
interface SceneIndex {
    uri: DocumentUri;
    textDocument: TextDocument;
    node: nodes.Scene;
}
export declare class ChoiceScriptIndexer {
    private projectIndexes;
    private static singletonIndex;
    private constructor();
    static get index(): ChoiceScriptIndexer;
    private removeFromProjectIndex;
    private addToProjectIndex;
    sync(scenePath: DocumentUri, resources?: TextDocument[], forceUpdate?: boolean): ChoiceScriptProjectIndex | null;
    purge(scenePath: DocumentUri, resources?: DocumentUri[]): ChoiceScriptProjectIndex | null;
    getProjectIndexForScene(uri: DocumentUri): ChoiceScriptProjectIndex | null;
}
export declare class ChoiceScriptProjectIndex {
    private scenes;
    private path;
    constructor(documents: TextDocument[]);
    getSceneIndex(uri: DocumentUri): SceneIndex | null;
    getStartupIndex(): SceneIndex | null;
    getSceneDocByName(name: string): TextDocument | null;
    getSceneNodeByName(name: string): nodes.Scene | null;
    getSceneNode(uri: DocumentUri): nodes.Scene | null;
    getSceneList(): string[];
    getSceneSymbolsByName(name: string): Symbols | null;
    removeScene(uri: DocumentUri): boolean;
    updateScene(doc: TextDocument, force?: boolean): boolean;
}
export {};
