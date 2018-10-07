/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const data : any = {
	css: {
		builtins: [
			"abort", "achieve", "achievement", "advertisement", "allow_reuse",
			"author", "bug", "check_achievements", "check_purchase",
			"check_registration", "choice", "create", "delay_break",
			"delay_ending", "delete", "disable_reuse", "else", "elseif",
			"elsif", "end_trial", "ending", "fake_choice", "finish", "gosub",
			"gosub_scene", "goto", "goto_random_scene", "goto_scene", "gotoref",
			"hide_reuse", "if", "image", "input_number", "input_text", "label",
			"line_break", "link", "link_button", "login", "looplimit",
			"more_games", "page_break", "params", "print", "purchase", "rand",
			"redirect_scene", "reset", "restart", "restore_game",
			"restore_purchases", "return", "save_game", "scene_list", "script",
			"selectable_if", "set", "setref", "share_this_game", "show_password",
			"sound", "stat_chart", "subscribe", "temp", "title"
			].sort().map(function(cmd) { return { name: cmd, desc: "```choicescript\n*choice\n\t# Option 1\n\t\t*comment code here\n\t\t*goto label1\n\t# Option 2\n\t\t*comment code here\n\t\t*goto label2\n\n```\n\nRead more on the [wiki](https://www.google.com)" }; } ),
		flowCommands: ["gosub", "gosub_scene", "goto", "goto_random_scene", "goto_scene",
			"gotoref", "label", "redirect_scene", "return"].sort().map(function(cmd) { return { name: cmd, desc: "*choice\n\t# Option 1\n\t# Option 2" }; } ),
		indentCommands: [
			"achievement", "choice", "else", "elseif", "elsif", 
			"fake_choice", "if", "scene_list", "stat_chart"
			].sort().map(function(cmd) { return { name: cmd, desc: "aa" }; } ),
		dedentCommands: ["ending", "finish", "goto", "goto_scene", "redirect_scene"].sort().map(function(cmd) { return { name: cmd, desc: "unknown" }; } )
	}
};