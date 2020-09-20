import * as commands from '../data/commands';

export type EntryStatus = 'standard' | 'experimental' | 'nonstandard' | 'obsolete';

export interface IEntry {
	name: string;
	restrictions: string[];
	description: string;
	status: EntryStatus;
}

export function expandEntryStatus(status: string): EntryStatus {
	switch (status) {
		case 'e':
			return 'experimental';
		case 'n':
			return 'nonstandard';
		case 'o':
			return 'obsolete';
		default:
			return 'standard';
	}
}
function getEntryStatus(status: string) {
	switch (status) {
		case 'e':
			return '⚠️ Property is experimental. Be cautious when using it.️\n\n';
		case 'n':
			return '🚨️ Property is nonstandard. Avoid using it.\n\n';
		case 'o':
			return '🚨️️️ Property is obsolete. Avoid using it.\n\n';
		default:
			return '';
	}
}


export class EntryImpl implements IEntry {

	constructor(public data: any) {
	}

	get name(): string {
		return this.data.name;
	}

	get description(): string {
		return this.data.desc;
	}

	get restrictions(): string[] {
		if (this.data.restriction) {
			return this.data.restriction.split(',').map(function (s: string) { return s.trim(); });
		} else {
			return [];
		}
	}

	get status(): EntryStatus {
		return expandEntryStatus(this.data.status);
	}
}

let commandsArray = commands.fullCommandList;
let descCommandList: IEntry[];
export function getCommands(): IEntry[] {
	if (!descCommandList) {
		descCommandList = [];
		for (var i = 0; i < commandsArray.length; i++) {
			var rawEntry = { 
				name: commandsArray[i],
				desc: [
					"**Command**: " + commandsArray[i],
				]
			};
			if (typeof commands.standardCommands[commandsArray[i]] !== "undefined"
				&& commands.standardCommands[commandsArray[i]].desc) {
				rawEntry.desc.push("```choicescript\n" + commands.standardCommands[commandsArray[i]].desc + "\n```");
			} else if (typeof commands.flowCommands[commandsArray[i]] !== "undefined"
						&&  commands.flowCommands[commandsArray[i]].desc) {
				rawEntry.desc.push("```choicescript\n" + commands.flowCommands[commandsArray[i]].desc + "\n```");
			}
			rawEntry.desc.push("Read more on the [wiki](https://choicescriptdev.wikia.com/wiki/" + commandsArray[i] + ")");
			descCommandList.push(new EntryImpl(rawEntry));
		}
	}
	return descCommandList;
}

export var fullCommandList = commands.fullCommandList;