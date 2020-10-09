import { CSSDataV1, ICSSDataProvider, IPropertyData, IAtDirectiveData, IPseudoClassData, IPseudoElementData } from '../cssLanguageTypes';
export declare class CSSDataProvider implements ICSSDataProvider {
    private _properties;
    private _atDirectives;
    private _pseudoClasses;
    private _pseudoElements;
    /**
     * Currently, unversioned data uses the V1 implementation
     * In the future when the provider handles multiple versions of HTML custom data,
     * use the latest implementation for unversioned data
     */
    constructor(data: CSSDataV1);
    provideProperties(): IPropertyData[];
    provideAtDirectives(): IAtDirectiveData[];
    providePseudoClasses(): IPseudoClassData[];
    providePseudoElements(): IPseudoElementData[];
    private addData;
}
