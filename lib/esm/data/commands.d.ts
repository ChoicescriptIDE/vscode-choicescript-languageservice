export declare enum CommandType {
    Deprecated = 0,
    Normal = 1,
    Initial = 2
}
export declare class CommandDescriptor {
    desc: string;
    type: CommandType;
    indent: number;
    constructor(desc: string, state?: CommandType, indent?: number);
}
export declare const reservedWords: string[];
export declare const standardCommands: {
    [id: string]: CommandDescriptor;
};
export declare const flowCommands: {
    [id: string]: CommandDescriptor;
};
export declare const allCommands: {
    [x: string]: CommandDescriptor;
};
export declare const standardCommandList: string[];
export declare const flowCommandList: string[];
export declare const fullCommandList: string[];
