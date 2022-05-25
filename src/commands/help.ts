import { categories, commands, lookup } from "../loader.js";
import { Command } from "../types";

export default {
    name: "help",
    description: "Shows a list of commands or shows info about a command",
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
                    title: `${cmd.name}`,
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
            function shorten(string: string, maxLen: number) {
                var words = string.split(" ")
                var len = 0
                for (var i = 0; i < words.length; i++) {
                    len += words[i].length
                    if (len >= maxLen) break;
                }
                return words.slice(0, i + 1).join(" ") + (len > maxLen ? "..." : "")
            }
            await msg.reply({
                embeds: [{
                    title: 'List of commands',
                    description: categories.map((commands, name) =>
                        `**${name}**\n` + commands
                            .map((v, k) => `\`${v.name}\` ${shorten(v.description || "N/A", 50)}`)
                            .join("\n"))
                        .join("\n\n")
                }]
            })
        }
    }
} as Command