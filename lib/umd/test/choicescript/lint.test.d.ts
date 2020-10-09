import { Node, IRule } from '../../parser/ChoiceScriptNodes';
import { LintConfigurationSettings } from '../../services/ChoiceScriptLintRules';
import { TextDocument } from '../../cssLanguageTypes';
export declare function assertEntries(node: Node, document: TextDocument, expectedRules: IRule[], expectedMessages?: string[] | undefined, settings?: LintConfigurationSettings): void;
