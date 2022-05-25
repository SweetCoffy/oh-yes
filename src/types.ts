import { Message, User } from "discord.js"

interface CommandBaseArg {
    type: string,
    name: string,
    required: boolean,
}
type CommandStringArg = CommandBaseArg & { type: "string" }
type CommandNumberArg = CommandBaseArg & { type: "number" }
type CommandUserArg = CommandBaseArg & { type: "user", errorIfMissing?: boolean }
type CommandBigintArg = CommandBaseArg & { type: "bigint" }
type RestArg = CommandBaseArg & { name: `...${string}`, minCount?: number, maxCount?: number }
export type CommandArgTypes = CommandStringArg | CommandNumberArg | CommandUserArg | CommandBigintArg
export type CommandArg = (CommandArgTypes & RestArg) | CommandArgTypes
export interface Command {
    name: string,
    aliases?: string[],
    description?: string,
    args: CommandArg[],
    devOnly?: boolean,
    hidden?: boolean,
    category?: string,
    run: (msg: Message, ...args: unknown[]) => Promise<any>,
    lexer?: boolean,
}
export interface UserData {
    money: Money,
    multipliers: bigint[],
    items: { [x: string]: bigint | undefined },
    workBonus: bigint,
    aliases: NodeJS.Dict<string>
}
export type CurrencyID = "points" | "gold"
export type Money = {
    [x in CurrencyID]: bigint
}
export type OptionalMoney = { [x in CurrencyID]?: bigint }