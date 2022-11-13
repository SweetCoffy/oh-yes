import { Message } from "discord.js";
import { getHotReloadable } from "../loader.js";
import { eco } from "../util.js";

const prefix = ";"

async function handleCommand(msg: Message) {
    var hr = getHotReloadable()
    var { parseCommand, convertArgs } = hr.commands
    var { getUser, progressionMessages } = hr.eco
    var u = await getUser(msg.author)
    let prevTaxes = u.taxes
    var progress = u.progression
    var d = parseCommand(msg.content.slice(prefix.length), u.aliases)
    if (!d) return msg.reply(`Bruh`)
    var { command: cmd, args } = d
    if (cmd.devOnly && msg.author.id != "602651056320675840") return await msg.reply("Bruh")
    var converted = await convertArgs(args, cmd.args, msg.client)
    console.log(converted)
    await cmd.run(msg, ...converted)
    if (u.progression > progress) {
        await msg.reply(progressionMessages[u.progression])
    }
    if (u.taxes > prevTaxes && u.taxes >= u.money.points / 4n) {
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