import { Client, Collection } from "discord.js"
import { readdir, readFile } from "fs/promises"
import { join } from "path"
import hotReloadable from "./hot-reloadable"
import { reloadWorkers } from "./workers.js"
import { Command } from "./types"

const BuildPath = "build"
export const commands: Collection<string, Command> = new Collection();
export const lookup: Collection<string, string> = new Collection();
export async function loadFile(file: string): Promise<unknown> {
    // var cont = await readFile(join(BuildPath, file), "utf8")
    // var url = `data:text/javascript;base64,${btoa(cont)}`
    var url = "./" + file + `?t=${Date.now()}`
    //console.log(url)
    var d = await import(url)
    if ("default" in d) return d.default
    return d
}
export async function loadFiles(...files: string[]): Promise<unknown[]> {
    return await Promise.all(files.map(loadFile))
}

export async function loadCommands(client: Client, ...files: string[]) {
    var cmds = await loadFiles(...files.map(el => join("commands", el))) as Command[]
    commands.clear()
    lookup.clear()
    cmds.unshift({
        name: "reload",
        aliases: ["r"],
        devOnly: true,
        hidden: true,
        args: [],
        async run(msg) {
            var { saveAllUsers } = getHotReloadable().eco
            var m = await msg.reply("Saving users...")
            await saveAllUsers()
            await m.edit("Getting real...")
            await loadAll(msg.client);
            await m.edit("Reloaded commands & events")
        }
    })
    for (var c of cmds) {
        try {
            //console.log(c.name)
            commands.set(c.name, c)
            lookup.set(c.name, c.name)
            if ("aliases" in c) c.aliases?.forEach(alias => lookup.set(alias, c.name))
        } catch (er) {
            //console.log(`Error loading ${c.name}:`)
            console.error(er)
        }
    }
}

var addedListeners: Map<string, (...args: any) => any> = new Map()
export async function loadEvents(client: Client, ...files: string[]) {
    var events = await loadFiles(...files.map(el => join("events", el))) as ((...args: any) => any)[][]
    for (var [k, v] of addedListeners) {
        client.removeListener(k, v)
    }
    for (var eventList of events) {
        for (var event of eventList) {
            //console.log(event.name)
            client.on(event.name, event)
            addedListeners.set(event.name, event)
        }
    }
}

export async function loadAll(client: Client) {
    reloadWorkers()
    // hot reloadable must be loaded before everything else because reasons
    var hr = await loadFile("hot-reloadable.js") as any
    if ("loadfiles" in hr) {
        var data = await Promise.all(hr.loadfiles.map((lf: any) => loadFile(lf.file)))
        for (var i = 0; i < data.length; i++) {
            //console.log(data[i])
            //console.log(hr.loadfiles[i])
            hr[hr.loadfiles[i].name] = data[i]
        }
    }
    //@ts-ignore
    globalThis.hotReloadable = hr

    var r = await Promise.all(
        [
            loadEvents(client, "messages.js"),
            loadCommands(client, ...await readdir(join(BuildPath, "commands")))
        ])
}

export function getHotReloadable(): typeof hotReloadable {
    //@ts-ignore
    return globalThis.hotReloadable
}