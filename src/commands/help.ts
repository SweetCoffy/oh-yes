import { commands, lookup } from "../loader.js";
import { Command } from "../types";

export default {
    name: "help",
    description: "There is no help",
    args: [{ name: "command", type: "string", required: false }],
    aliases: ["command", "h", "cmd"],
    async run(msg, command?: string) {
        //console.log(command)
        if (command) {
            var realName = lookup.get(command)
            if (!realName) return await msg.reply("Unknown command")
            var cmd = commands.get(realName)
            if (!cmd) return await msg.reply("How")
            await msg.reply({
                embeds: [{
                    title: (command != cmd.name) ? `${command} -> ${cmd.name}` : `${cmd.name}`,
                    description: cmd.description ?? "N/A",
                    fields: [
                        {
                            name: "Usage",
                            value: `${command} ${cmd.args.map(el => {
                                if (el.required) return `<${el.name}>`
                                return `[${el.name}]`
                            }).join(" ")}`,
                            inline: true,
                        },
                        {
                            name: "Aliases",
                            value: cmd.aliases?.map(v => `\`${v}\``).join(", ") || "None",
                            inline: true,
                        }
                    ]
                }]
            })
        } else {
            await msg.reply({
                embeds: [{
                    title: 'List of commands',
                    description: commands.map((v, k) => `\`${v.name}\` (${v.aliases?.map(el => `\`${el}\``) || "no aliases"})`).join("\n")
                }]
            })
        }
    }
} as Command