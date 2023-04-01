import { User } from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { Format, formats, formatsBigint } from "../formats.js";
import { Item } from "../gen-items.js";
import hotReloadable from "../hot-reloadable.js";
import { getHotReloadable } from "../loader.js";
import { Money, OptionalMoney, UserData } from "../types.js";
import { clamp } from "./math/bigint.js";

export const CurrencyIcons: { [x in CurrencyID]: string } = {
    points: "ᵢₚ",
    gold: "¤",
    sus: "ₛᵤₛ",
}
export enum Currency {
    points = "points",
    gold = "gold",
    sus = "sus",
}
export type CurrencyID = keyof typeof Currency

export function getMul(user: UserData) {
    return user.multipliers.reduce((prev, cur) => prev * cur, 1n)
}
export function moneyLeft(money: Money, price: OptionalMoney): Money {
    //@ts-ignore
    return Object.fromEntries(Object.entries(money).map(([k, v]) => [k, v - (price[k] || 0n)]))
}
export function subtractMoney(money: Money, price: OptionalMoney): void {
    for (let k in price) {
        //@ts-ignore
        money[k] -= price[k] || 0n
    }
}
export function multiplyMoney(money: OptionalMoney, amount: bigint): OptionalMoney {
    //@ts-ignore
    return Object.fromEntries(Object.entries(money).filter(([k, v]) => typeof v == "bigint").map(([k, v]) => [k, v * amount]))
}
export function divideMoney(money: OptionalMoney, amount: bigint): OptionalMoney {
    //@ts-ignore
    return Object.fromEntries(Object.entries(money).filter(([k, v]) => typeof v == "bigint").map(([k, v]) => [k, v / amount]))
}
export function divideMoneyAll(money: OptionalMoney, money2: OptionalMoney): OptionalMoney {
    //@ts-ignore
    return Object.fromEntries(Object.entries(money).filter(([k, v]) => typeof v == "bigint").map(([k, v]) => [k, v / (money2[k] ?? 1n)]))
}
export function hasMoney(money: Money) {
    return Object.values(money).every(v => v >= 0n)
}


export function getItem(u: UserData, id: string): bigint {
    return u.items[id] || 0n
}
export function addItem(u: UserData, id: string, amt: bigint) {
    return u.items[id] = getItem(u, id) + amt
}
export async function readdirR(path: string, ...append: string[]): Promise<string[]> {
    let p = join(path, ...append)
    let entries = await readdir(p, { withFileTypes: true })
    let files = []
    for (let e of entries) {
        if (e.isDirectory()) {
            files.push(...(await readdirR(path, ...append, e.name)))
            continue
        }
        files.push(join(...append, e.name))
    }
    return files
}
export function bar(num: number, max: number, width: number = 25) {
    let c = 0
    let fill = "█"
    let bg = " "

    let things = ["▉", "▊", "▋", "▌", "▍", "▎", "▏"]

    let str = ""
    str += "+".repeat(Math.min(Math.max(Math.floor((num - 0.01) / max), 0), width - 1))
    width -= str.length;
    let chars = Math.ceil((((num - 0.01) / max) * width) % (width))
    while (c < chars) {
        let f = fill
        let epicVal = 1
        if (c + 1 >= chars && num % max != 0) epicVal = num / max * width % 1
        if (epicVal < 1) f = things[0]
        if (epicVal < 7 / 8) f = things[1]
        if (epicVal < 3 / 4) f = things[2]
        if (epicVal < 5 / 8) f = things[3]
        if (epicVal < 1 / 2) f = things[4]
        if (epicVal < 3 / 8) f = things[5]
        if (epicVal < 1 / 4) f = things[6]
        console.log(epicVal)
        c++
        str += f
    }
    while (c < width) {
        c++
        str += bg
    }
    return str
}
export let rarities: typeof hotReloadable.eco.rarities = []
export let Rarity: typeof hotReloadable.eco.Rarity
export function resetStuff() {
    rarities = eco.rarities
    Rarity = eco.Rarity
}
/**
 * Easier of calling `eco.getUser`
 */
export function getUser(user: User) {
    return eco.getUser(user)
}
let numberRegex = /^(\d+)(.\d+)?([a-zA-Z]*)/
export function bigintAbbr(str: string): bigint | null {
    let mul = 1n
    if (str.startsWith("-")) {
        mul = -1n
        str = str.slice(1)
    }
    let match = str.match(numberRegex)
    if (!match?.[1]) return null
    let base = BigInt(match[1]) * 1000n
    let decimal = 0n
    if (match?.[2]) decimal = BigInt(match[2].slice(1, 4).padEnd(3, "0"))
    if (match[3]) mul = formatsBigint.find(v => v.suffix.trim() == match?.[3])?.min || 1n
    return (base + decimal) * mul / 1000n
}
export function getDiscount(tier: bigint) {
    return 5n + clamp(tier * 45n / 15n, 0n, 45n)
}
export function getUpgradeCost(tier: bigint) {
    return (100000n + ((8n ** tier) * 10000n)) - 1n
}
export const BooleanEnum = Object.freeze({
    yes: true,
    on: true,
    true: true,

    no: false,
    off: false,
    false: false,
})
export function enumeration(...args: any[]) {
    if (args.length == 0) return ""
    if (args.length == 1) return args[0]
    let e = args.slice(0, -1).join(", ")
    return e + " and " + args[args.length - 1]
}
class UserDataWrapper {
    data: UserData
    get items(): { [x in Item]?: bigint } {
        return this.data.items
    }
    constructor(data: UserData) {
        this.data = data;
    }
    toJSON() {
        return this.data
    }
    getMul() {
        return getMul(this.data)
    }
    has(item: Item) {
        return this.get(item) > 0n
    }
    add(item: Item, amount: bigint) {
        this.set(item, this.get(item) + amount)
    }
    set(item: Item, amount: bigint) {
        this.items[item] = amount
    }
    get(item: Item) {
        return this.items[item] ?? 0n
    }
    hasPhone() {
        return this.has(Item.Phone)
    }
}
export function wrapUserData(data: UserData): WrappedUserData {
    let w = new UserDataWrapper(data)
    return new Proxy(w, {
        get(target, p, receiver) {
            if (p in target) return Reflect.get(target, p, target)
            if (p in target.data) return Reflect.get(target.data, p, target.data)
        },
        set(target, p, v, receiver) {
            if (p in target) return Reflect.set(target, p, v, target)
            if (p in target.data) return Reflect.set(target.data, p, v, target.data)
            return false
        },
        deleteProperty(target, p) {
            return false
        },
        defineProperty(target, property, attributes) {
            return false
        },
    }) as any
}
export function isItem(id: string): id is Item {
    if (eco.items.has(id)) return true
    return false
}
export function isProduction() {
    return process.env.NODE_ENV == "production"
}
export type WrappedUserData = UserData & UserDataWrapper
