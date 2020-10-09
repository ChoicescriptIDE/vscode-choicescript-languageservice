import { TokenType, Scanner, IToken } from './cssScanner';
export declare const VariableName: number;
export declare const InterpolationFunction: TokenType;
export declare const Default: TokenType;
export declare const EqualsOperator: TokenType;
export declare const NotEqualsOperator: TokenType;
export declare const GreaterEqualsOperator: TokenType;
export declare const SmallerEqualsOperator: TokenType;
export declare const Ellipsis: TokenType;
export declare const Module: TokenType;
export declare class SCSSScanner extends Scanner {
    protected scanNext(offset: number): IToken;
    protected comment(): boolean;
}
