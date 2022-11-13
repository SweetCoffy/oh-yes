import { getHotReloadable, lookup } from "../loader.js";
import { Command } from "../types.js";
let { subcommandGroup, addCommandToGroup } = getHotReloadable().commands

let group = subcommandGroup("alias")
group.description = "Commands for managing local command aliases."

addCommandToGroup(group, {
    name: "list",
    aliases: ["ls"],
    description: "Lists your local aliases.",
    args: [],
    async run(msg) {
        let { getUser } = getHotReloadable().eco
        let u = await getUser(msg.author)
        await msg.reply({
            content: `User aliases:\n${Object.keys(u.aliases).map(el => `\`${el}\` -> \`${u.aliases[el]}\``).join(", ") || "None"}`
        })
    }
}, true)

addCommandToGroup(group, {
    name: "set",
    aliases: ["add"],
    description: "Sets a local alias for a command.",
    args: [{ type: "string", name: "name", required: true }, { type: "string", name: "target", required: true }],
    async run(msg, name: string, target: string) {
        if (!lookup.get(target)) return await msg.reply(`Unknown command: \`${target}\``)
        target = lookup.get(target) as string
        let { getUser } = getHotReloadable().eco
        let u = await getUser(msg.author)
        u.aliases[name] = target
        await msg.reply(`Set alias: \`${name}\` -> \`${target}\``)
    }
})
addCommandToGroup(group, {
    name: "unset",
    aliases: ["remove", "delete", "rm"],
    description: "Unsets a local alias.",
    args: [{ type: "string", name: "name", required: true }],
    async run(msg, name: string) {
        let { getUser } = getHotReloadable().eco
        let u = await getUser(msg.author)
        if (delete u.aliases[name]) await msg.reply(`Removed alias \`${name}\``)
        else await msg.reply(`Alias \`${name}\` doesn't exist`)
    }
})

export default group