/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */
export declare function findFirst<T>(array: T[], p: (x: T) => boolean): number;
export declare function includes<T>(array: T[], item: T): boolean;
export declare function union<T>(...arrays: T[][]): T[];
