import { TextDocument, FoldingRange } from '../cssLanguageTypes';
export declare function getFoldingRanges(document: TextDocument, context: {
    rangeLimit?: number;
}): FoldingRange[];
