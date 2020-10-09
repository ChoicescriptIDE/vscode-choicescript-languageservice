import { Node, IRule } from '../../parser/cssNodes';
import { LintConfigurationSettings } from '../../services/lintRules';
import { TextDocument } from '../../cssLanguageTypes';
export declare function assertEntries(node: Node, document: TextDocument, expectedRules: IRule[], expectedMessages?: string[] | undefined, settings?: LintConfigurationSettings): void;
