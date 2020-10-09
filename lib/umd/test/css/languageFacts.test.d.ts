import { Parser } from '../../parser/cssParser';
import { Color } from '../../cssLanguageTypes';
export declare function assertColor(parser: Parser, text: string, selection: string, expected: Color | null, isColor?: boolean): void;
