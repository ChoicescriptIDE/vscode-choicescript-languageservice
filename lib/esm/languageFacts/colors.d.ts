import { Color } from '../cssLanguageService';
import * as nodes from '../parser/cssNodes';
export declare const colorFunctions: {
    func: string;
    desc: string;
}[];
export declare const colors: {
    [name: string]: string;
};
export declare const colorKeywords: {
    [name: string]: string;
};
export declare function isColorConstructor(node: nodes.Function): boolean;
/**
 * Returns true if the node is a color value - either
 * defined a hex number, as rgb or rgba function, or
 * as color name.
 */
export declare function isColorValue(node: nodes.Node): boolean;
export declare function hexDigit(charCode: number): number;
export declare function colorFromHex(text: string): Color | null;
export declare function colorFrom256RGB(red: number, green: number, blue: number, alpha?: number): Color;
export declare function colorFromHSL(hue: number, sat: number, light: number, alpha?: number): Color;
export interface HSLA {
    h: number;
    s: number;
    l: number;
    a: number;
}
export declare function hslFromColor(rgba: Color): HSLA;
export declare function getColorValue(node: nodes.Node): Color | null;
