export declare type EntryStatus = 'standard' | 'experimental' | 'nonstandard' | 'obsolete';
export interface IEntry {
    name: string;
    restrictions: string[];
    description: string;
    status: EntryStatus;
}
export declare function expandEntryStatus(status: string): EntryStatus;
export declare class EntryImpl implements IEntry {
    data: any;
    constructor(data: any);
    get name(): string;
    get description(): string;
    get restrictions(): string[];
    get status(): EntryStatus;
}
export declare function getCommands(): IEntry[];
export declare var fullCommandList: string[];
