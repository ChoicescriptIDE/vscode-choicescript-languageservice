import { Position, SelectionRange, TextDocument } from '../cssLanguageTypes';
import { Stylesheet } from '../parser/cssNodes';
export declare function getSelectionRanges(document: TextDocument, positions: Position[], stylesheet: Stylesheet): SelectionRange[];
