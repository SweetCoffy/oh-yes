import { Client, Collection } from "discord.js"
import { dirname, join } from "path"
import hotReloadable from "./hot-reloadable"
import { reloadWorkers } from "./workers.js"
import { Command, SubcommandGroup } from "./types.js"
import { readdirR, resetStuff } from "./util/util.js"

const BuildPath = "out"
export const commands: Collection<string, Command> = new Collection();
export const categories: Collection<string, Collection<string, Command>> = new Collection();
export const lookup: Collection<string, string> = new Collection();
export async function loadFile(file: string): Promise<unknown> {
    // let cont = await readFile(join(BuildPath, file), "utf8")
    // let url = `data:text/javascript;base64,${btoa(cont)}`
    let url = "./" + file + `?t=${Date.now()}`
    //console.log(url)
    let d = await import(url)
    if ("default" in d) return d.default
    return d
}
export async function loadFiles(...files: string[]): Promise<unknown[]> {
    return await Promise.all(files.map(loadFile))
}

export async function loadCommands(client: Client, ...files: string[]) {
    let cmds = await loadFiles(...files.map(el => join("commands", el))) as Command[]
    let { addCommandToGroup } = getHotReloadable().commands
    commands.clear()
    lookup.clear()
    categories.clear()
    cmds.push({
        name: "reload",
        aliases: ["r"],
        devOnly: true,
        hidden: true,
        args: [{ type: "string", name: "...flags", required: true }],
        async run(msg, flags: string[] = []) {
            console.time("Reload")
            let { saveAllUsers } = getHotReloadable().eco
            let m = await msg.reply("Getting real...")
            await saveAllUsers()
            await loadAll(msg.client);
            console.timeEnd("Reload")
            await m.edit("Reloaded commands & events")
        }
    })
    let i = 0
    for (let c of cmds) {
        try {
            //console.log(c.name)
            if (!c.args) c.args = []
            if (files[i]) c.category = dirname(files[i])
            if (!c.category || c.category == ".") c.category = "no category"
            if (!categories.has(c.category)) categories.set(c.category, new Collection())
            if (c.groupName) continue
            categories.get(c.category)?.set(c.name, c)
            commands.set(c.name, c)
            lookup.set(c.name, c.name)
            if ("aliases" in c) c.aliases?.forEach(alias => lookup.set(alias, c.name))
        } catch (er) {
            //console.log(`Error loading ${c.name}:`)
            console.error(er)
        } finally {
            i++
        }
    }
    for (let c of cmds) {
        if (!c.groupName) continue
        let group = commands.get(c.groupName) as SubcommandGroup | undefined
        if (!group) {
            console.error(`Error loading '${c.name}': No group found with name '${c.groupName}'`)
            continue
        }
        addCommandToGroup(group, c)
    }
}

let addedListeners: Map<string, (...args: any) => any> = new Map()
export async function loadEvents(client: Client, ...files: string[]) {
    let events = await loadFiles(...files.map(el => join("events", el))) as ((...args: any) => any)[][]
    for (let [k, v] of addedListeners) {
        client.removeListener(k, v)
    }
    for (let eventList of events) {
        for (let event of eventList) {
            //console.log(event.name)
            client.on(event.name, event)
            addedListeners.set(event.name, event)
        }
    }
}
export async function loadAll(client?: Client) {
    reloadWorkers()
    // hot reloadable must be loaded before everything else because reasons
    let hr = await loadFile("hot-reloadable.js") as typeof hotReloadable
    //@ts-ignore
    globalThis.hotReloadable = hr
    if ("loadfiles" in hr) {
        for (let lf of hr.loadfiles) {
            //@ts-ignore
            hr[lf.name] = await loadFile(lf.file)
            if (lf.globalName) {
                //@ts-ignore
                globalThis[lf.globalName] = hr[lf.name]
            }
        }
    }
    resetStuff()

    try {
        await hr.yamlLoader.loadAll()
    } catch (er) {
        console.log(er)
    }

    if (client) {
        let r = await Promise.all(
            [
                loadEvents(client, "messages.js"),
                loadCommands(client, ...await readdirR(join(BuildPath, "commands")))
            ])
    }
}

export function getHotReloadable(): typeof hotReloadable {
    //@ts-ignore
    return globalThis.hotReloadable
}