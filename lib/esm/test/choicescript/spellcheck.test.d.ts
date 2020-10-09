import { Node, IRule } from '../../parser/ChoiceScriptNodes';
import { TextDocument } from 'vscode-languageserver-types';
import { UserDictionary } from '../../cssLanguageTypes';
export declare function assertEntries(node: Node, document: TextDocument, typo: any, userDics: UserDictionary, rules: IRule[]): void;
