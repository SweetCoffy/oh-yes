import { commands, lookup } from "../loader.js";
import { Command, CommandArg } from "../types";

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

        var value: any = v + ""
        if (arg.type == "number") value = Number(v)
        if (arg.name.startsWith("...")) {
            hasRest = true
            rest.push(value)
        } else ar.push(v);
    }
    if (hasRest) ar.push(rest)
    return ar
}
function parseCommand(str: string): { command: Command, args: unknown[] } | null {
    var args = lexer(str)
    var name = args.shift()
    if (!name) return null;
    if (!lookup.has(name)) return null;
    var cmd = commands.get(lookup.get(name) as string) as Command
    var required = cmd.args.reduce((prev, cur) => prev + ((cur.required && !cur.name.startsWith("...")) as unknown as number), 0)
    if (args.length < required) return null;

    return { command: cmd, args: parseArgs(args, cmd.args) }
}
export default {
    parseCommand,
    lexer,
}