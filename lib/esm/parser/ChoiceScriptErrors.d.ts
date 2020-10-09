import * as nodes from './cssNodes';
export declare class CSIssueType implements nodes.IRule {
    id: string;
    message: string;
    constructor(id: string, message: string);
}
export declare let ParseError: {
    ExpectedScene: CSIssueType;
    ExpectedLabel: CSIssueType;
    GenericSyntaxError: CSIssueType;
    WrongIndentationUnit: CSIssueType;
    IndentationError: CSIssueType;
    MixedIndentation: CSIssueType;
    ExpectedChoiceOption: CSIssueType;
    UnknownCommand: CSIssueType;
    NoChoiceOption: CSIssueType;
    NotEnoughMultiReplaceOptions: CSIssueType;
    NumberExpected: CSIssueType;
    ConditionExpected: CSIssueType;
    RuleOrSelectorExpected: CSIssueType;
    InvalidVariableFormatOption: CSIssueType;
    DotExpected: CSIssueType;
    ColonExpected: CSIssueType;
    NoCloseQuote: CSIssueType;
    SemiColonExpected: CSIssueType;
    TermExpected: CSIssueType;
    ExpressionExpected: CSIssueType;
    OperatorExpected: CSIssueType;
    IdentifierExpected: CSIssueType;
    PercentageExpected: CSIssueType;
    URIOrStringExpected: CSIssueType;
    URIExpected: CSIssueType;
    LabelNameExpected: CSIssueType;
    VariableNameExpected: CSIssueType;
    VariableValueExpected: CSIssueType;
    PropertyValueExpected: CSIssueType;
    LeftCurlyExpected: CSIssueType;
    UnbalancedBrackets: CSIssueType;
    RightCurlyExpected: CSIssueType;
    LeftSquareBracketExpected: CSIssueType;
    RightSquareBracketExpected: CSIssueType;
    LeftParenthesisExpected: CSIssueType;
    RightParenthesisExpected: CSIssueType;
    CommaExpected: CSIssueType;
    PageDirectiveOrDeclarationExpected: CSIssueType;
    UnknownAtRule: CSIssueType;
    SelectorExpected: CSIssueType;
    StringLiteralExpected: CSIssueType;
    WhitespaceExpected: CSIssueType;
    MediaQueryExpected: CSIssueType;
    IdentifierOrWildcardExpected: CSIssueType;
    WildcardExpected: CSIssueType;
    IdentifierOrVariableExpected: CSIssueType;
};
