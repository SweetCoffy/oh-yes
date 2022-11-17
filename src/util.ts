import { Message, User } from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { formats, formatsBigint } from "./formats.js";
import hotReloadable from "./hot-reloadable.js";
import { getHotReloadable } from "./loader.js";
import { Money, OptionalMoney, UserData } from "./types";

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
export function allMoneyFormat(m: OptionalMoney) {
    //@ts-ignore
    return Object.keys(m).filter((v) => v && m[v as CurrencyID]).map(el => moneyFormat(m[el as CurrencyID], el as CurrencyID)).join(" • ")
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


export function abs(number: bigint | number) {
    if (number < 0n) return -number
    return number
}
export function itemString(item: string, amount?: bigint, iconOnly?: boolean) {
    let { items } = getHotReloadable().eco
    let info = items.get(item)
    if (info) {
        if (typeof amount == "bigint" && amount != 1n)
            return `x${format(amount)} ${info.icon}` + (iconOnly ? "" : ` ${info.name}`)
        return `${info.icon}` + (iconOnly ? "" : ` ${info.name}`)
    } else {
        return "Unknown item"
    }
}
export function formatNumber(number: number) {
    let funi = null
    for (let f of formats) {
        if (Math.abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    let m = Math.floor(number / funi.min)
    let d = Math.floor(Math.abs((number % funi.min / funi.min) * 100))
    return `${m}.${d}${funi.suffix}`
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
export function format(number: bigint) {
    let funi = null
    for (let f of formatsBigint) {
        if (abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    let m = number / funi.min
    let d = abs((number % funi.min) / (funi.min / 100n))
    function yes(num: bigint) {
        let str = num.toString()
        let a = str.slice(0, 2)
        let count = str.length - 2
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
export type BigIntFraction = [bigint, bigint]
export type Fraction = [number, number]
export function resetStuff() {
    let e = eco()
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
export function splitCamelCase(str: string) {
    let regex = /(?<=[a-z])(?=[A-Z])/g
    return str.split(regex)
}
export function titleCase(str: string | string[]) {
    let words = Array.isArray(str) ? str : str.split(" ")
    return words.map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")
}
/**
 * Returns the GCD (Greatest Common Divisor) of `a` and `b`
 */
export function gcd(a: bigint, b: bigint) {
    while (b != 0n) {
        let t = b
        b = a % b
        a = t
    }
    return a
}
/**
 * Returns the LCM (Least Common Multiple) of `a` and `b`
 */
export function lcm(a: bigint, b: bigint) {
    return a * b / gcd(a, b)
}
export function simplifyFrac([a, b]: BigIntFraction): BigIntFraction {
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

export function getPartialValue(v: bigint[], a: bigint = 1n) {
    return v.reduce((prev, cur, i) => prev + (cur * a) / (2n ** BigInt(i)), 0n)
}

export function getPartialFrac(v: bigint[], am: bigint = 1n, scale: bigint = 64n): BigIntFraction {
    let a = 0n, b = 0n
    let value = getPartialValue(v, am * scale)
    a = value
    b = am * scale
    return simplifyFrac([a, b])
}
export function getFracValue([a, b]: BigIntFraction, x: bigint = 1n) {
    return a * x / b
}
export function xTimes(v: number | bigint) {
    if (v == 1) return "once"
    if (v == 2) return "twice"
    if (v == 3) return "twice"
    return `${v} times`
}
export function nth(v: number | bigint) {
    let str = v.toString();
    if (str.endsWith("1")) return `${str}st`
    if (str.endsWith("2")) return `${str}nd`
    if (str.endsWith("3")) return `${str}rd`
    return `${str}th`
}
export function addFracs(...fracs: BigIntFraction[]) {
    if (fracs.length == 1) return fracs[0]
    if (fracs.length == 2) {
        let [a, b] = fracs;
        return simplifyFrac([a[0] * b[1] + b[0] * a[1], a[1] * b[1]])
    }
    // If it works, it works.
    let fr = [0n, 1n] as BigIntFraction
    for (let frac of fracs) {
        fr = addFracs(fr, frac)
    }
    return simplifyFrac(fr);
}
export function clamp(x: bigint, min: bigint, max: bigint) {
    if (x < min) return min;
    if (x > max) return max;
    return x
}
export function getDiscount(tier: bigint) {
    return 5n + clamp(tier * 45n / 15n, 0n, 45n)
}
export function getUpgradeCost(tier: bigint) {
    return (50000n + (tier * 95000n)) - 1n
}
export const BooleanEnum = Object.freeze({
    yes: true,
    on: true,
    true: true,

    no: false,
    off: false,
    false: false,
})
export function max(...args: bigint[]) {
    if (args.length == 0) return 0n
    let highest: bigint | null = null
    for (let v of args) {
        if (highest == null || v > highest) highest = v
    }
    return highest as bigint;
}
export function min(...args: bigint[]) {
    if (args.length == 0) return 0n
    let lowest: bigint | null = null
    for (let v of args) {
        if (lowest == null || v < lowest) lowest = v
    }
    return lowest as bigint;
}
export function enumeration(...args: any[]) {
    if (args.length == 0) return ""
    if (args.length == 1) return args[0]
    let e = args.slice(0, -1).join(", ")
    return e + " and " + args[args.length - 1]
}
export function lcmArray(...args: bigint[]) {
    if (args.length < 2) return args[0] ?? 0n
    let v = lcm(args.shift() as bigint, args.shift() as bigint)
    for (let n of args) {
        v = lcm(v, n)
    }
    return v;
} 