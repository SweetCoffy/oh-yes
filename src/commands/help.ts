import { categories, commands, getHotReloadable, lookup } from "../loader.js";
import { ArgType, Command, SubcommandGroup } from "../types.js";

const { CommandResponse } = cmd

export default {
    name: "help",
    description: "Shows a list of commands or shows info about a command",
    args: [{ name: "...command", type: "string", required: false }],
    aliases: ["command", "h", "cmd"],
    async run(msg, commandSegments?: string[]) {
        //console.log(command)
        if (commandSegments && commandSegments.length > 0) {
            let c = commands
            let lu = lookup
            let cmd: Command | undefined = undefined
            for (let segment of commandSegments) {
                let st = lu.get(segment) ?? segment
                cmd = c.get(st)
                if (!cmd?.isSubcommandGroup) break;
                let group = cmd as SubcommandGroup
                c = group.commands
                lu = group._lookup
            }
            if (!cmd) return CommandResponse.error({ message: `Unknown command.` })
            await msg.reply({
                embeds: [{
                    title: `${cmd.name}`,
                    description: cmd.description ?? "N/A",
                    fields: [
                        {
                            name: "Usage",
                            value: `${cmd.name} ${cmd.isSubcommandGroup ?
                                `<one of: ${(cmd as SubcommandGroup).commands.map((_, k) => k).join("\u2014")}>` :
                                cmd.args.map(el => {
                                    let inner = el.name
                                    if (el.type == "enum") inner = `${el.name}, one of: ${Object.keys(el.enum).join("\u2014")}`
                                    else if (el.type instanceof ArgType && el.type.customDisplay) inner = el.type.customDisplay(el)
                                    if (el.required) return `<${inner}>`
                                    return `[${inner}]`
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
                let words = string.split(" ")
                let len = 0
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