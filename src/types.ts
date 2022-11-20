import { Client, Collection, Message, User } from "discord.js"
import { Item } from "./gen-items.js"
import { CurrencyID, isItem } from "./util.js"

interface CommandBaseArg {
    name: string,
    required: boolean,
}
type CommandDefaultArg = CommandBaseArg & { type: "string" | "number" | "bigint" | "currency" | "boolean" }
type CommandUserArg = CommandBaseArg & { type: "user", errorIfMissing?: boolean }
type CommandChoiceArg = CommandBaseArg & { type: "enum", enum: object }
type CommandCustomArg = CommandBaseArg & { type: ArgType }
export type CommandArgTypes = CommandDefaultArg | CommandUserArg | CommandChoiceArg | CommandCustomArg
export type CommandArg = CommandArgTypes
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
    precondition?: (msg: Message) => Promise<boolean>
    run: (msg: Message, ...args: any[]) => Promise<any>
}
export type SubcommandGroup = BaseCommand & { isSubcommandGroup: true, default?: Command, commands: Collection<string, Command>, _lookup: Collection<string, string> }
export type Command = SubcommandGroup | BaseCommand
export interface Phone {
    orderQueue: { item: string, amount: bigint }[],
    orderPaused: boolean,
    tier: bigint,
}
export enum Progression {
    None = 0,
    VenezuelaMode = 1,
    PostVenezuela = 2,
    TheEnd = 9999,
}
export const MinTaxProgression = Progression.VenezuelaMode
export const VzPriceMul = 16n
export const PhoneMaxBonusDiscount = 90n
export const PhoneMaxTier = 50n
export interface UserData {
    money: Money,
    multipliers: bigint[],
    items: { [x: string]: bigint | undefined },
    workBonus: bigint,
    aliases: NodeJS.Dict<string>,
    phone: Phone,
    vzMode: boolean,
    taxes: bigint,
    progression: Progression,
    taxEvasion: number,
    evadedTaxes: number,
}
export type Money = {
    [x in CurrencyID]: bigint
}
export type OptionalMoney<T = bigint> = { [x in CurrencyID]?: T }

type ValidateFn = (v: any) => boolean
type CustomDisplayFn = (v: CommandArg) => string

export class ArgType<T = any> {
    name: string
    _parse: (v: any, arg: CommandArg) => T = (v) => v as T
    _convert?: (v: any, arg: CommandArg, client: Client) => Promise<T>
    customDisplay?: CustomDisplayFn
    constructor(name: string, parse?: typeof ArgType.prototype._parse, convert?: typeof ArgType.prototype._convert, validate?: ValidateFn, customDisplay?: CustomDisplayFn) {
        this.name = name;
        if (!parse && !convert) throw new Error(`Type '${name}' must have at least a 'parse' or 'convert' method.`)
        if (parse) this._parse = parse
        if (validate) this.validate = validate
        this._convert = convert
        this.customDisplay = customDisplay
    }
    parse(v: any, arg: CommandArg) {
        return this._parse(v, arg)
    }
    async convert(v: any, arg: CommandArg, client: Client): Promise<T> {
        if (!this._convert) return v;
        return await this._convert(v, arg, client)
    }
    validate(v: any): boolean {
        return true
    }
    static ItemType: ArgType<Item> = new ArgType("Item Type", undefined, async (v) => {
        return Item[v as keyof typeof Item] ?? v
    }, (v: string) => {
        return isItem(v)
    })
}