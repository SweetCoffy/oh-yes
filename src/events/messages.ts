import { EmbedBuilder, Message } from "discord.js";
import { getHotReloadable } from "../loader.js";
import { eco, itemString } from "../util.js";

const prefix = ";"

async function handleCommand(msg: Message) {
    let hr = getHotReloadable()
    let { parseCommand, convertArgs } = hr.commands
    let { getUser, progressionInfo, getUnlockedItems } = hr.eco
    let u = await getUser(msg.author)
    let prevTaxes = u.taxes
    let progress = u.progression
    let d = parseCommand(msg.content.slice(prefix.length), u.aliases)
    if (!d) return msg.reply(`Bruh`)
    let { command: cmd, args } = d
    if (cmd.devOnly && msg.author.id != "602651056320675840") return await msg.reply("Bruh")
    if (cmd.precondition && !(await cmd.precondition(msg))) return
    let converted = await convertArgs(args, cmd.args, msg.client)
    console.log(converted)
    await cmd.run(msg, ...converted)
    if (u.progression > progress) {
        let unlocks = getUnlockedItems(progress, u.progression)
        let info = progressionInfo[u.progression]
        let embed = new EmbedBuilder()
            .setTitle(`Progression: ${info.title}`)
            .setDescription(info.description)
        if (unlocks.size > 0) {
            embed.addFields({ name: "Items Unlocked", value: unlocks.map((_, k) => itemString(k)).join("\n") })
        }
        await msg.reply({
            embeds: [embed]
        })
    }
    if (u.taxes > prevTaxes && u.taxes >= u.money.points / 8n) {
        await msg.reply(`Pay your taxes.`)
    }
}

export default [
    async function messageCreate(msg: Message) {
        try {
            if (msg.author.bot) return;
            if (!msg.content.startsWith(prefix)) return;
            await handleCommand(msg);

        } catch (err) {
            console.error(err)
        }
    },
    async function messageUpdate(oldMsg: Message, msg: Message) {
        try {
            if (msg.author.bot) return;
            if (!oldMsg.content.startsWith(prefix)) return;
            if (!msg.content.startsWith(prefix)) return;
            await handleCommand(msg);

        } catch (err) {
            console.error(err)
        }
    }
]