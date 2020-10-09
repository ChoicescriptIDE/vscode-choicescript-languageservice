import * as nodes from '../parser/cssNodes';
export declare class Element {
    readonly fullPropertyName: string;
    readonly node: nodes.Declaration;
    constructor(decl: nodes.Declaration);
}
interface SideState {
    value: boolean;
    properties: Element[];
}
interface BoxModel {
    width?: Element;
    height?: Element;
    top: SideState;
    right: SideState;
    bottom: SideState;
    left: SideState;
}
export default function calculateBoxModel(propertyTable: Element[]): BoxModel;
export {};
