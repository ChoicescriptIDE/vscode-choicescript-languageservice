var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var CommandType;
(function (CommandType) {
    CommandType[CommandType["Deprecated"] = 0] = "Deprecated";
    CommandType[CommandType["Normal"] = 1] = "Normal";
    CommandType[CommandType["Initial"] = 2] = "Initial"; // only allowed at the top of startup.txt
})(CommandType || (CommandType = {}));
var CommandDescriptor = /** @class */ (function () {
    function CommandDescriptor(desc, state, indent) {
        this.indent = 0;
        this.desc = desc;
        this.type = state !== null && state !== void 0 ? state : CommandType.Normal;
        this.indent = indent !== null && indent !== void 0 ? indent : 0;
    }
    return CommandDescriptor;
}());
export { CommandDescriptor };
export var reservedWords = [
    "and",
    "or",
    "true",
    "false",
    "scene",
    "scenename"
];
export var standardCommands = {
    abort: new CommandDescriptor("", CommandType.Normal),
    achieve: new CommandDescriptor("*achieve my_unique_achievement_id", CommandType.Normal),
    achievement: new CommandDescriptor("*achievement unique_id true 100 Achievement Title\n\tPre-earned description.\n\tPost-earned description.", CommandType.Initial),
    advertisement: new CommandDescriptor("", CommandType.Normal),
    allow_reuse: new CommandDescriptor("*choice\n\t#Delete the file\n\t\t*gosub delete_file\n\t*allow_reuse #Log out\n\t\t*goto log_out", CommandType.Normal),
    author: new CommandDescriptor("*author Jane Doe", CommandType.Initial),
    bug: new CommandDescriptor("*bug Oops! Something broke. Please report this bug.", CommandType.Normal),
    check_achievements: new CommandDescriptor("", CommandType.Normal),
    check_purchase: new CommandDescriptor("", CommandType.Normal),
    check_registration: new CommandDescriptor("", CommandType.Normal),
    choice: new CommandDescriptor("*choice\n\t#Option 1\n\t\t*comment code here\n\t\t*goto label1\n\t#Option 2\n\t\t*comment code here\n\t\t*goto label2", CommandType.Normal, 1),
    comment: new CommandDescriptor("", CommandType.Initial),
    config: new CommandDescriptor("", CommandType.Normal),
    create: new CommandDescriptor("*create name \"Joe\"", CommandType.Initial),
    delay_break: new CommandDescriptor("", CommandType.Normal),
    delay_ending: new CommandDescriptor("", CommandType.Normal),
    delete: new CommandDescriptor("", CommandType.Normal),
    disable_reuse: new CommandDescriptor("*choice\n\t*disable_reuse #Delete the file\n\t\t*gosub delete_file\n\t#Log out\n\t\t*goto log_out", CommandType.Normal),
    else: new CommandDescriptor("*if (success)\n\t*goto_scene victory\n*else\n\t*goto_scene defeat", CommandType.Normal, 1),
    elseif: new CommandDescriptor("*if (class = \"wizard\")\n\tYou are a wise wizard!\n*elseif (class = \"warrior\")\n\tYou are a loyal warrior!\n*else\n\tYou must be a wily rouge!", CommandType.Normal, 1),
    elsif: new CommandDescriptor("*if (class = \"wizard\")\n\tYou are a wise wizard!\n*elsif (class = \"warrior\")\n\tYou are a loyal warrior!\n*else\n\tYou must be a wily rouge!", CommandType.Normal, 1),
    end_trial: new CommandDescriptor("", CommandType.Normal),
    ending: new CommandDescriptor("Thanks for playing!\n*ending", CommandType.Normal),
    fake_choice: new CommandDescriptor("What is your favorite colour?\n\n*fake_choice\n\t#Red\n\t#Green\n\t#Blue\n\nHow interesting! That's mine too!", CommandType.Normal, 1),
    feedback: new CommandDescriptor("", CommandType.Normal),
    finish: new CommandDescriptor("Thus ends the chapter!\n*finish", CommandType.Normal),
    hide_reuse: new CommandDescriptor("*choice\n\t*hide_reuse #Delete the file\n\t\t*gosub delete_file\n\t#Log out\n\t\t*goto log_out", CommandType.Normal),
    if: new CommandDescriptor("*if (is_warrior)\n\t*set strength (strength + 5)", CommandType.Normal, 1),
    image: new CommandDescriptor("*image myimage.png", CommandType.Normal),
    input_number: new CommandDescriptor("*input_number percentage 1 100", CommandType.Normal),
    input_text: new CommandDescriptor("*temp name \"\"\n*input_text name\nHello ${name}", CommandType.Normal),
    line_break: new CommandDescriptor("", CommandType.Normal),
    link: new CommandDescriptor("*link http://www.choiceofgames.com/", CommandType.Normal),
    link_button: new CommandDescriptor("", CommandType.Normal),
    login: new CommandDescriptor("", CommandType.Normal),
    looplimit: new CommandDescriptor("(Unimplemented)", CommandType.Normal),
    more_games: new CommandDescriptor("", CommandType.Normal),
    page_break: new CommandDescriptor("*page_break Optional Button Text", CommandType.Normal),
    params: new CommandDescriptor("*gosub sub_routine \"Jane\" \"Doe\"\n-----------\n*label sub_routine\n*params firstname lastname\nHi ${firstname} ${lastname}!\n*return", CommandType.Normal),
    print: new CommandDescriptor("This command is deprecated. Please use the ${var} notation.", CommandType.Deprecated),
    print_discount: new CommandDescriptor("", CommandType.Normal),
    product: new CommandDescriptor("", CommandType.Initial),
    purchase: new CommandDescriptor("", CommandType.Normal),
    purchase_discount: new CommandDescriptor("", CommandType.Normal),
    rand: new CommandDescriptor("*rand dice_roll 1 6", CommandType.Normal),
    reset: new CommandDescriptor("", CommandType.Normal),
    restart: new CommandDescriptor("", CommandType.Normal),
    restore_game: new CommandDescriptor("", CommandType.Normal),
    restore_purchases: new CommandDescriptor("", CommandType.Normal),
    save_game: new CommandDescriptor("", CommandType.Normal),
    scene_list: new CommandDescriptor("*scene_list\n\tscene_01\n\tscene_02\n\tscene_03", CommandType.Initial),
    script: new CommandDescriptor("(Unsupported)", CommandType.Normal),
    selectable_if: new CommandDescriptor("*choice\n\t*selectable_if (strength > 10) #Pump some iron\n\t\t...\n\t#Take a break\n\t\t...", CommandType.Normal),
    set: new CommandDescriptor("*set n 5", CommandType.Normal),
    setref: new CommandDescriptor("This command is deprecated.\nPlease use the *set {var} notation.", CommandType.Deprecated),
    share_this_game: new CommandDescriptor("", CommandType.Normal),
    show_password: new CommandDescriptor("", CommandType.Normal),
    sound: new CommandDescriptor("*sound mysoundfile.mp3", CommandType.Normal),
    stat_chart: new CommandDescriptor("", CommandType.Normal),
    subscribe: new CommandDescriptor("", CommandType.Normal),
    temp: new CommandDescriptor("*temp ", CommandType.Normal),
    text_image: new CommandDescriptor("", CommandType.Normal),
    timer: new CommandDescriptor("", CommandType.Normal),
    title: new CommandDescriptor("*title My Brand New Game", CommandType.Initial),
    track_event: new CommandDescriptor("", CommandType.Normal),
    youtube: new CommandDescriptor("", CommandType.Normal)
};
export var flowCommands = {
    gosub: new CommandDescriptor("*gosub my_label ?param1 ?param2 ?...", CommandType.Normal),
    gosub_scene: new CommandDescriptor("*gosub_scene my_scene ?my_label ", CommandType.Normal),
    goto: new CommandDescriptor("*goto my_label", CommandType.Normal, -1),
    goto_random_scene: new CommandDescriptor("", CommandType.Normal),
    goto_scene: new CommandDescriptor("*goto_scene my_scene ?my_label", CommandType.Normal, -1),
    gotoref: new CommandDescriptor("This command is deprecated.\nPlease use the *goto {var} notation.", CommandType.Deprecated),
    label: new CommandDescriptor("*label my_label", CommandType.Normal),
    redirect_scene: new CommandDescriptor("", CommandType.Normal),
    return: new CommandDescriptor("", CommandType.Normal)
};
export var allCommands = __assign(__assign({}, standardCommands), flowCommands);
export var standardCommandList = Object.keys(standardCommands);
export var flowCommandList = Object.keys(flowCommands);
export var fullCommandList = Object.keys(allCommands);
