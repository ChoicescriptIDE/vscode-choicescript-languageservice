import { Location, Position, SymbolInformation, TextDocument } from 'vscode-languageserver-types';
import * as nodes from '../parser/ChoiceScriptNodes';
export declare class ChoiceScriptNavigation {
    findSceneDefinition(document: TextDocument, scene: nodes.Node): Location | null;
    findSceneLabelDefinition(document: TextDocument, label: nodes.Node): Location | null;
    findDefinitionGlobal(localDocument: TextDocument, position: Position, localScene: nodes.Node): Location | null;
    findDefinition(document: TextDocument, position: Position, scene: nodes.Node): Location | null;
    findReferences(document: TextDocument, position: Position, localScene: nodes.Scene): Location[];
    findDocumentSymbols(document: TextDocument, scene: nodes.Scene, includeGlobals?: boolean): SymbolInformation[];
}
