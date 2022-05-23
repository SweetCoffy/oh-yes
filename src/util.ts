import { formats, formatsBigint } from "./formats.js";
import { getHotReloadable } from "./loader.js";
import { CurrencyID, Money, OptionalMoney, UserData } from "./types";

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
    for (var k in price) {
        //@ts-ignore
        money[k] -= price[k] || 0n
    }
}
export function multiplyMoney(money: OptionalMoney, amount: bigint): OptionalMoney {
    //@ts-ignore
    return Object.fromEntries(Object.entries(money).filter(([k, v]) => typeof v == "bigint").map(([k, v]) => [k, v * amount]))
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
export function itemString(item: string, amount?: bigint) {
    var { items } = getHotReloadable().eco
    var info = items.get(item)
    if (info) {
        if (typeof amount == "bigint" && amount != 1n) return `x${format(amount)} ${info.icon} ${info.name}`
        return `${info.icon} ${info.name}`
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
export function format(number: bigint) {
    var funi = null
    for (var f of formatsBigint) {
        if (abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    var m = number / funi.min
    var d = abs((number % funi.min) / (funi.min / 10n))
    function yes(num: bigint) {
        var str = num.toString()
        var a = str.slice(0, 4)
        var count = str.length - 4
        return `${a}e${count}`
    }
    if (abs(number) > funi.min * 1000n) return `${yes(number)}`
    return `${m}.${d}${funi.suffix}`
}
export function moneyFormat(number: bigint, currency: CurrencyID = "points", message: boolean = false) {
    var icon = "ᵢₚ"
    if (currency == "gold") icon = "¤"
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
        var epicVal = Math.min(chars - c, 1)
        if (epicVal < 1) f = things[0]
        if (epicVal < 7 / 8) f = things[1]
        if (epicVal < 3 / 4) f = things[2]
        if (epicVal < 5 / 8) f = things[3]
        if (epicVal < 1 / 2) f = things[4]
        if (epicVal < 3 / 8) f = things[5]
        if (epicVal < 1 / 4) f = things[6]
        c++
        str += f
    }
    while (c < width) {
        c++
        str += bg
    }
    return str
}
