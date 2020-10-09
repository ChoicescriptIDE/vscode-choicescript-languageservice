import { Color } from 'vscode-languageserver-types';
export declare let colors: {
    [name: string]: string;
};
export declare let colorKeywords: {
    [name: string]: string;
};
export declare let positionKeywords: {
    [name: string]: string;
};
export declare let repeatStyleKeywords: {
    [name: string]: string;
};
export declare let lineStyleKeywords: {
    [name: string]: string;
};
export declare let lineWidthKeywords: string[];
export declare let boxKeywords: {
    [name: string]: string;
};
export declare let geometryBoxKeywords: {
    [name: string]: string;
};
export declare let cssWideKeywords: {
    [name: string]: string;
};
export declare let colorFunctions: {
    func: string;
    desc: string;
}[];
export declare let imageFunctions: {
    [name: string]: string;
};
export declare let transitionTimingFunctions: {
    [name: string]: string;
};
export declare let basicShapeFunctions: {
    [name: string]: string;
};
export declare let units: {
    [unitName: string]: string[];
};
export declare let html5Tags: string[];
export declare let svgElements: string[];
export declare function colorFrom256RGB(red: number, green: number, blue: number, alpha?: number): Color;
export interface HSLA {
    h: number;
    s: number;
    l: number;
    a: number;
}
export declare function hslFromColor(rgba: Color): HSLA;
export declare function isCommonValue(entry: Value): boolean;
export declare function getPageBoxDirectives(): string[];
export declare function expandEntryStatus(status: string): EntryStatus;
export interface Browsers {
    E?: string;
    FF?: string;
    IE?: string;
    O?: string;
    C?: string;
    S?: string;
    count: number;
    all: boolean;
    onCodeComplete: boolean;
}
export interface Value {
    name: string;
    description: string;
    browsers: Browsers;
}
export interface IEntry {
    name: string;
    restrictions: string[];
    description: string;
    status: EntryStatus;
}
export declare type EntryStatus = 'standard' | 'experimental' | 'nonstandard' | 'obsolete';
export declare function getCommands(): IEntry[];
