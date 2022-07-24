import { Message } from "discord.js";
import { getHotReloadable } from "../loader.js";

const prefix = ";"

export default [
    async function messageCreate(msg: Message) {
        try {
            //console.log(`${msg.author.username}: ${msg.content}`)
            if (msg.author.bot) return;
            if (msg.content.startsWith(prefix)) {
                var hr = getHotReloadable()
                var { parseCommand, convertArgs } = hr.commands
                var { getUser, progressionMessages } = hr.eco
                var u = await getUser(msg.author)
                var progress = u.progression
                let prevTaxes = u.taxes
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
        } catch (err) {
            console.error(err)
        }
    }
]