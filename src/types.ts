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
type CommandCurrencyArg = CommandBaseArg & { type: "currency" }
type RestArg = CommandBaseArg & { name: `...${string}`, minCount?: number, maxCount?: number }
export type CommandArgTypes = CommandStringArg | CommandNumberArg | CommandUserArg | CommandBigintArg | CommandCurrencyArg
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
interface Component { type: string }
type CPU = Component
type GPU = Component
export interface Computer {
    cpu: CPU,
    slots: number,
    gpus: GPU[],
}
export interface Phone {

}
export enum Progression {
    None,
    VenezuelaMode,
}
export const MIN_TAX_PROGRESSION = Progression.VenezuelaMode
export const VZ_PRICEMUL = 14_999n
export interface UserData {
    money: Money,
    multipliers: bigint[],
    items: { [x: string]: bigint | undefined },
    workBonus: bigint,
    aliases: NodeJS.Dict<string>,
    phone?: Phone,
    computer?: Computer,
    vzMode: boolean,
    taxes: bigint,
    progression: Progression,
}
export type CurrencyID = "points" | "gold" | "sus"
export type Money = {
    [x in CurrencyID]: bigint
}
export type OptionalMoney = { [x in CurrencyID]?: bigint }