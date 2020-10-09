import * as nodes from '../parser/cssNodes';
import { MarkedString } from '../cssLanguageTypes';
import { CSSDataManager } from '../languageFacts/dataManager';
export declare class Element {
    parent: Element | null;
    children: Element[] | null;
    attributes: {
        name: string;
        value: string;
    }[] | null;
    findAttribute(name: string): string | null;
    addChild(child: Element): void;
    append(text: string): void;
    prepend(text: string): void;
    findRoot(): Element;
    removeChild(child: Element): boolean;
    addAttr(name: string, value: string): void;
    clone(cloneChildren?: boolean): Element;
    cloneWithParent(): Element;
}
export declare class RootElement extends Element {
}
export declare class LabelElement extends Element {
    constructor(label: string);
}
export declare function toElement(node: nodes.SimpleSelector, parentElement?: Element | null): Element;
export declare class SelectorPrinting {
    private cssDataManager;
    constructor(cssDataManager: CSSDataManager);
    selectorToMarkedString(node: nodes.Selector): MarkedString[];
    simpleSelectorToMarkedString(node: nodes.SimpleSelector): MarkedString[];
    private isPseudoElementIdentifier;
    private selectorToSpecificityMarkedString;
}
export declare function selectorToElement(node: nodes.Selector): Element | null;
