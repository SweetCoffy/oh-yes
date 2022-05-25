import { getHotReloadable } from "../loader.js";
import { Command } from "../types";
import { getMul, moneyFormat } from "../util.js";

export default {
    name: "work",
    aliases: ["freemone"],
    args: [],
    description: "...",
    async run(msg) {
        var { getUser } = getHotReloadable().eco
        var u = await getUser(msg.author)
        var mul = getMul(u)
        var points = (BigInt(Math.floor(Math.random() * 25)) + u.workBonus) * mul
        var gold = (BigInt(Math.floor(Math.random() * 3)) + u.workBonus / 8n) * mul
        u.money.points += points
        u.money.gold += gold
        await msg.reply(`Earned ${moneyFormat(points)} and ${moneyFormat(gold, "gold")}`)
    }
} as Command