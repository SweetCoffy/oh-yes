import { Message } from "discord.js"

interface CommandBaseArg {
    type: string,
    name: string,
    required: boolean,
}
type CommandStringArg = CommandBaseArg & { type: "string" }
type CommandNumberArg = CommandBaseArg & { type: "number" }
type RestArg = CommandBaseArg & { name: `...${string}`, minCount?: number, maxCount?: number }
export type CommandArgTypes = CommandStringArg | CommandNumberArg
export type CommandArg = (CommandArgTypes & RestArg) | CommandArgTypes
export interface Command {
    name: string,
    aliases?: string[],
    description?: string,
    args: CommandArg[],
    devOnly?: boolean,
    hidden?: boolean,
    run: (msg: Message, ...args: unknown[]) => Promise<any>
}