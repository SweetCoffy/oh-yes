import { commands, lookup } from "../loader.js";
import { Command, CommandArg } from "../types";
import { Client } from "discord.js"

const Quotes = new Set(["\"", "\'"])

// No more shlex, get real
function lexer(str: string) {
    //return shlex.split(str)
    var args: string[] = []
    var acc = ""
    var quote = ""
    function resetAcc() {
        if (acc) args.push(acc)
        acc = ""
    }
    for (var i = 0; i < str.length; i++) {
        var char = str[i]
        if (char == "\\") {
            acc += str[i + 1]
            continue
        }
        if (!quote) {
            if (Quotes.has(char)) {
                quote = char
                continue
            }
            if (char == " ") {
                resetAcc()
                continue
            }
            acc += char
        } else {
            if (Quotes.has(char)) {
                quote = ""
                continue
            }
            acc += char
        }
    }
    resetAcc()
    return args
}

function parseArgs(args: string[], cmdArgs: CommandArg[]): unknown[] {
    if (!cmdArgs) return []
    var rest: any[] = []
    var ar: unknown[] = []
    var hasRest = false

    for (var i = 0; i < args.length; i++) {
        var v = args[i]
        var arg = cmdArgs[Math.min(i, cmdArgs.length - 1)]
        console.log(`#${i} ${v}`)
        var value: any = v + ""
        if (arg.type == "number") value = Number(v)
        else if (arg.type == "bigint") value = BigInt(v)
        else if (arg.type == "user") {
            var regex = /^<@!?(\d+)>/g
            var matches = regex.exec(v)
            console.log(matches)
            value = matches?.[1] || v
        }
        if (arg.name.startsWith("...")) {
            hasRest = true
            rest.push(value)
        } else ar.push(value);
    }
    if (hasRest) ar.push(rest)
    return ar
}
function parseCommand(str: string, aliases: NodeJS.Dict<string> = {}): { command: Command, args: unknown[] } | null {
    var space = str.split(" ")
    var name = space.shift()
    var args = lexer(space.join(" "))
    if (!name) return null;
    if (aliases[name]) name = aliases[name] as string
    if (!lookup.has(name)) return null;
    var cmd = commands.get(lookup.get(name) as string) as Command
    if (cmd.lexer == false) args = space
    var required = cmd.args.reduce((prev, cur) => prev + ((cur.required && !cur.name.startsWith("...")) as unknown as number), 0)
    if (args.length < required) return null;

    return { command: cmd, args: parseArgs(args, cmd.args) }
}
async function convertArgs(args: any[], cmdArgs: CommandArg[], client: Client): Promise<any[]> {
    async function convert(v: any, arg: CommandArg) {
        if (arg.type == "user") {
            try {
                return await client.users.fetch(v)
            } catch (err) {
                if (arg.errorIfMissing) throw err
                return null
            }
        }
        return v;
    }
    return await Promise.all(args.map(async (value, i) => {
        var arg = cmdArgs[i]
        if (!arg) return value
        if (Array.isArray(value)) {
            return await Promise.all(value.map(el => convert(el, arg)))
        }
        return await convert(value, arg)
    }))
}
export default {
    parseCommand,
    lexer,
    convertArgs,
}