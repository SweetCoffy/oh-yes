import { getHotReloadable } from "../loader.js";
let { subcommandGroup, addCommandToGroup } = getHotReloadable().commands

let group = subcommandGroup("subcommand-test");
addCommandToGroup(group, {
    name: "test",
    args: [],
    async run(msg) {
        await msg.reply("test")
    },
})

addCommandToGroup(group, {
    name: "test2",
    args: [],
    async run(msg) {
        await msg.reply("test2")
    },
})

addCommandToGroup(group, {
    name: "test3",
    args: [],
    async run(msg) {
        await msg.reply("test3")
    },
})

let nestedGroup = subcommandGroup("nested")

addCommandToGroup(nestedGroup, {
    name: "test",
    args: [{ name: "test", type: "string", required: true }],
    async run(msg, arg: string) {
        await msg.reply(`nested test ${arg}`)
    }
})

addCommandToGroup(group, nestedGroup)



export default group