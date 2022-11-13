import { Collection, Message, User } from "discord.js"

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
type CommandChoiceArg = CommandBaseArg & { type: "enum", enum: object }
type RestArg = CommandBaseArg & { name: `...${string}`, minCount?: number, maxCount?: number }
export type CommandArgTypes = CommandStringArg | CommandNumberArg | CommandUserArg | CommandBigintArg | CommandCurrencyArg | CommandChoiceArg
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
    isSubcommandGroup?: boolean,
    _group?: SubcommandGroup,
    groupName?: string,
    run: (msg: Message, ...args: any[]) => Promise<any>
}
export type SubcommandGroup = BaseCommand & { isSubcommandGroup: true, default?: Command, commands: Collection<string, Command>, _lookup: Collection<string, string> }
export type Command = SubcommandGroup | BaseCommand
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
export const MinTaxProgression = Progression.VenezuelaMode
export const VzPriceMul = 14_999n
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
    evadedTaxes: number,
}
export type CurrencyID = "points" | "gold" | "sus"
export type Money = {
    [x in CurrencyID]: bigint
}
export type OptionalMoney<T = bigint> = { [x in CurrencyID]?: T }