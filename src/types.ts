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
interface BaseCommand {
    name: string,
    aliases?: string[],
    description?: string,
    args: CommandArg[],
    devOnly?: boolean,
    hidden?: boolean,
    category?: string,
    lexer?: boolean,
    run: (msg: Message, ...args: any[]) => Promise<any>
}
export type Command = BaseCommand
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
    taxevasion: number,
}
export type CurrencyID = "points" | "gold" | "sus"
export type Money = {
    [x in CurrencyID]: bigint
}
export type OptionalMoney = { [x in CurrencyID]?: bigint }