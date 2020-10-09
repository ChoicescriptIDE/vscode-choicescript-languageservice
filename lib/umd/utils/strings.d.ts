export declare function startsWith(haystack: string, needle: string): boolean;
/**
 * Determines if haystack ends with needle.
 */
export declare function endsWith(haystack: string, needle: string): boolean;
/**
 * Computes the difference score for two strings. More similar strings have a higher score.
 * We use largest common subsequence dynamic programming approach but penalize in the end for length differences.
 * Strings that have a large length difference will get a bad default score 0.
 * Complexity - both time and space O(first.length * second.length)
 * Dynamic programming LCS computation http://en.wikipedia.org/wiki/Longest_common_subsequence_problem
 *
 * @param first a string
 * @param second a string
 */
export declare function difference(first: string, second: string, maxLenDelta?: number): number;
/**
 * Limit of string length.
 */
export declare function getLimitedString(str: string, ellipsis?: boolean): string;
/**
 * Limit of string length.
 */
export declare function trim(str: string, regexp: RegExp): string;
