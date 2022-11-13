import { Message, User } from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { formats, formatsBigint } from "./formats.js";
import hotReloadable from "./hot-reloadable.js";
import { getHotReloadable } from "./loader.js";
import { CurrencyID, Money, OptionalMoney, UserData } from "./types";

export function getMul(user: UserData) {
    return user.multipliers.reduce((prev, cur) => prev * cur, 1n)
}
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
export function allMoneyFormat(m: OptionalMoney) {
    //@ts-ignore
    return Object.keys(m).filter((v) => v && m[v as CurrencyID]).map(el => moneyFormat(m[el as CurrencyID], el as CurrencyID)).join(" • ")
}
export function moneyLeft(money: Money, price: OptionalMoney): Money {
    //@ts-ignore
    return Object.fromEntries(Object.entries(money).map(([k, v]) => [k, v - (price[k] || 0n)]))
}
export function subtractMoney(money: Money, price: OptionalMoney): void {
    for (var k in price) {
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


export function abs(number: bigint | number) {
    if (number < 0n) return -number
    return number
}
export function itemString(item: string, amount?: bigint, iconOnly?: boolean) {
    var { items } = getHotReloadable().eco
    var info = items.get(item)
    if (info) {
        if (typeof amount == "bigint" && amount != 1n)
            return `x${format(amount)} ${info.icon}` + (iconOnly ? "" : ` ${info.name}`)
        return `${info.icon}` + (iconOnly ? "" : ` ${info.name}`)
    } else {
        return "Unknown item"
    }
}
export function formatNumber(number: number) {
    var funi = null
    for (var f of formats) {
        if (Math.abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    var m = Math.floor(number / funi.min)
    var d = Math.floor(Math.abs((number % funi.min / funi.min) * 100))
    return `${m}.${d}${funi.suffix}`
}
export async function readdirR(path: string, ...append: string[]): Promise<string[]> {
    var p = join(path, ...append)
    var entries = await readdir(p, { withFileTypes: true })
    var files = []
    for (var e of entries) {
        if (e.isDirectory()) {
            files.push(...(await readdirR(path, ...append, e.name)))
            continue
        }
        files.push(join(...append, e.name))
    }
    return files
}
export function format(number: bigint) {
    var funi = null
    for (var f of formatsBigint) {
        if (abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    var m = number / funi.min
    var d = abs((number % funi.min) / (funi.min / 100n))
    function yes(num: bigint) {
        var str = num.toString()
        var a = str.slice(0, 2)
        var count = str.length - 2
        return `${a[0]}.${a[1]}e+${count}`
    }
    if (abs(number) > funi.min * 1000n) return `${yes(number)}`
    return `${m}.${d}${funi.suffix}`
}
export function moneyFormat(number: bigint, currency: CurrencyID = "points", message: boolean = false) {
    let icon = CurrencyIcons[currency]
    return icon + " " + format(number)
}
export function bar(num: number, max: number, width: number = 25) {
    var c = 0
    var fill = "█"
    var bg = " "

    var things = ["▉", "▊", "▋", "▌", "▍", "▎", "▏"]

    var str = ""
    str += "+".repeat(Math.min(Math.max(Math.floor((num - 0.01) / max), 0), width - 1))
    width -= str.length;
    var chars = Math.ceil((((num - 0.01) / max) * width) % (width))
    while (c < chars) {
        var f = fill
        var epicVal = 1
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
export var rarities: typeof hotReloadable.eco.rarities = []
export var Rarity: typeof hotReloadable.eco.Rarity
export type BigIntFraction = [bigint, bigint]
export type Fraction = [number, number]
export function resetStuff() {
    var e = eco()
    rarities = e.rarities
    Rarity = e.Rarity
}
/**
 * Easier of calling `getHotReloadable().eco.getUser`
 */
export function getUser(user: User) {
    return getHotReloadable().eco.getUser(user)
}
/**
 * Easier way of doing `getHotReloadable().eco`
 */
export function eco(): typeof hotReloadable.eco {
    return getHotReloadable().eco
}
var numberRegex = /^(\d+)(.\d+)?([a-zA-Z]*)/
export function bigintAbbr(str: string): bigint | null {
    var match = str.match(numberRegex)
    if (!match?.[1]) return null
    var base = BigInt(match[1]) * 1000n
    var decimal = 0n
    if (match?.[2]) decimal = BigInt(match[2].slice(1, 4).padEnd(3, "0"))
    var mul = 1n
    if (match[3]) mul = formatsBigint.find(v => v.suffix.trim() == match?.[3])?.min || 1n
    return (base + decimal) * mul / 1000n
}
export function phoneOnly(fn: (m: Message, ...args: any[]) => any) {
    return async function (m: Message, ...args: any[]): Promise<any> {
        var info = await getUser(m.author)
        if (!info.items.phone) return await m.reply(`You need a phone in order to use this command`)
        return fn(m, ...args)
    }
}
export function splitCamelCase(str: string) {
    let regex = /(?<= [a - z])(?=[A - Z])/g
    return str.split(regex)
}
export function titleCase(str: string | string[]) {
    let words = Array.isArray(str) ? str : str.split(" ")
    return words.map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")
}
export function gcd(a: bigint, b: bigint) {
    while (b != 0n) {
        var t = b
        b = a % b
        a = t
    }
    return a
}
export function simplifyFrac([a, b]: BigIntFraction) {
    let g = gcd(a, b)
    return [a / g, b / g]
}
export function formatFraction(frac: BigIntFraction) {
    let [a, b] = simplifyFrac(frac);
    let c = a / b;
    if (c > 0) {
        a -= c * b;
        return `${c} + ${a}\u2044${b}`
    }
    return `${a}\u2044${b}`
}
