import { formats } from "./formats.js";
import { CurrencyID, Money, UserData } from "./types";

export function getMul(user: UserData) {
    return user.multipliers.reduce((prev, cur) => prev * cur, 1)
}
export function allMoneyFormat(m: Money) {
    return Object.keys(m).map(el => moneyFormat(m[el as CurrencyID], el as CurrencyID)).join(" ")
}
export function format(number: number) {
    var funi = null
    for (var f of formats) {
        if (Math.abs(number) >= f.min) funi = f
    }
    if (!funi) return `${number}`
    var m = Math.floor(number / funi.min)
    var d = Math.floor(Math.abs((number % funi.min / funi.min) * 100))
    return `${m}.${d}${funi.suffix}`
}
export function moneyFormat(number: number, currency: CurrencyID = "points", message: boolean = false) {
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
