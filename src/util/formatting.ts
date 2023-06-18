import { Format, formatsBigint, formats } from "../formats.js";
import { getHotReloadable } from "../loader.js";
import { OptionalMoney } from "../types.js";
import { BigIntFraction, simplifyFrac } from "./math/fraction.js";
import { abs } from "./math/general.js";
import { CurrencyID, CurrencyIcons } from "./util.js";

export function formatFraction(frac: BigIntFraction) {
    let [a, b] = simplifyFrac(frac);
    let c = a / b;
    if (c > 0) {
        a -= c * b;
        return `${c} + ${a}\u2044${b}`
    }
    return `${a}\u2044${b}`
}
export function splitCamelCase(str: string) {
    let regex = /(?<=[a-z])(?=[A-Z])/g
    return str.split(regex)
}
export function titleCase(str: string | string[]) {
    let words = Array.isArray(str) ? str : str.split(" ")
    return words.map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")
}
export function xTimes(v: number | bigint) {
    if (v == 1) return "once"
    if (v == 2) return "twice"
    if (v == 3) return "twice"
    return `${v} times`
}
export function nth(v: number | bigint) {
    let str = v.toString();
    if (v > 19) {
        if (str.endsWith("1")) return `${str}st`
        if (str.endsWith("2")) return `${str}nd`
        if (str.endsWith("3")) return `${str}rd`
    }
    return `${str}th`
}
export function format(number: bigint, format: Format[] = formatsBigint) {
    let funi = null
    for (let f of format) {
        if (abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    let m = number / funi.min
    let d = funi.min < 100n ? 0n : abs((number % funi.min) / (funi.min / 100n))
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
export function allMoneyFormat(m: OptionalMoney) {
    //@ts-ignore
    return Object.keys(m).filter((v) => v && m[v as CurrencyID]).map(el => moneyFormat(m[el as CurrencyID], el as CurrencyID)).join(" • ")
}
export function itemString(item: string, amount?: bigint, iconOnly?: boolean) {
    let { items } = eco
    let info = items.get(item)
    if (info) {
        if (typeof amount == "bigint" && amount != 1n)
            return `x${format(amount)} ${info.icon}` + (iconOnly ? "" : ` ${info.name}`)
        return `${info.icon}` + (iconOnly ? "" : ` ${info.name}`)
    } else {
        return "Unknown item"
    }
}
export function formatNumber(number: number, format: Format<number>[] = formats) {
    let funi = null
    for (let f of format) {
        if (Math.abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    let m = Math.floor(number / funi.min)
    let d = Math.floor(Math.abs((number % funi.min / funi.min) * 100))
    return `${m}.${d}${funi.suffix}`
}
export function percent(n: number) {
    return Math.floor(n * 100) + "%"
}
export function percentBigint(n: bigint, max: bigint) {
    return (n * 100n) / max + "%"
}
export function formatTime(seconds: number) {
    let cs = Math.floor(seconds % 1 * 100)
    let s = Math.floor(seconds % 60)
    let m = Math.floor(seconds / 60) % 60
    let h = Math.floor(seconds / 60 / 60)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`
}