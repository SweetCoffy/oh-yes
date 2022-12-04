import { commands, lookup } from "../loader.js";
import { ArgType, Command, CommandArg, SubcommandGroup } from "../types.js";
import { APIEmbed, Client, Collection, ColorResolvable, Colors, EmbedBuilder, EmbedData, JSONEncodable, Message } from "discord.js"
import { bigintAbbr, getUser } from "../util/util.js";
import { DiscordEmbed, Mapping } from "../util/types.js";

const Quotes = new Set(["\"", "\'"])

// No more shlex, get real
function lexer(str: string) {
    //return shlex.split(str)
    let args: string[] = []
    let acc = ""
    let quote = ""
    function resetAcc() {
        if (acc) args.push(acc)
        acc = ""
    }
    for (let i = 0; i < str.length; i++) {
        let char = str[i]
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
    let rest: any[] = []
    let ar: unknown[] = []
    let hasRest = false

    for (let i = 0; i < args.length; i++) {
        let v = args[i]
        let arg = cmdArgs[Math.min(i, cmdArgs.length - 1)]
        console.log(`#${i} ${v}`)
        let value: any = v + ""
        if (arg.type == "number") value = Number(v)
        else if (arg.type == "bigint") value = bigintAbbr(v)
        else if (arg.type == "user") {
            let regex = /^<@!?(\d+)>/g
            let matches = regex.exec(v)
            console.log(matches)
            value = matches?.[1] || v
        } else if (arg.type == "currency") {
            if (!["points", "gold", "sus"].includes(v)) value = null
        } else if (arg.type == "enum") {
            if (!Object.keys(arg.enum).includes(v)) value = null
        }
        if (arg.name.startsWith("...")) {
            hasRest = true
            rest.push(value)
        } else ar.push(value);
    }
    if (hasRest) ar.push(rest)
    return ar
}
function parseCommand(str: string, aliases: NodeJS.Dict<string> = {}, commandsCol = commands, lookupCol = lookup): { command: Command, args: unknown[] } | null {
    let space = str.split(" ")
    let name = space.shift()
    let args = lexer(space.join(" "))
    if (!name) return null;
    if (aliases[name]) name = aliases[name] as string
    if (!lookupCol.has(name)) return null;
    let cmd = commandsCol.get(lookupCol.get(name) as string) as Command
    if (cmd.lexer == false) args = space
    let required = cmd.args.reduce((prev, cur) => prev + ((cur.required && !cur.name.startsWith("...")) as unknown as number), 0)
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
        } else if (arg.type instanceof ArgType) {
            let value = await arg.type.convert(v, arg, client)
            if (!arg.type.validate(value)) throw new Error(`${arg.name}: ${arg.type.constructor.name}.validate() failed.`)
            return value
        }
        return v;
    }
    return await Promise.all(args.map(async (value, i) => {
        let arg = cmdArgs[i]
        if (!arg) return value
        if (Array.isArray(value)) {
            return await Promise.all(value.map(el => convert(el, arg)))
        }
        return await convert(value, arg)
    }))
}
function subcommandGroup(name: string, devOnly: boolean = false) {
    let command: SubcommandGroup = {
        name,
        devOnly,
        args: [{ name: "...", required: true, type: "string" }],
        lexer: false,
        isSubcommandGroup: true,
        commands: new Collection(),
        _lookup: new Collection(),
        async run(msg, a: string[]) {
            if (!a?.length) {
                if (this.default) return await this.default.run(msg)
                return CommandResponse.error({ message: `No subcommand provided.` })
            } else {
                let u = await getUser(msg.author)
                let str = a.join(" ")
                let d = parseCommand(str, u.aliases, this.commands, this._lookup)
                if (!d) return CommandResponse.error({ message: `Invalid subcommand usage.` })
                let cmd = d.command
                let converted = await convertArgs(d.args, cmd.args, msg.client)
                return await cmd.run(msg, ...converted)
            }
        },
    }
    return command;
}
function addCommandToGroup(group: SubcommandGroup, command: Command, defaultCommand = false) {
    group.commands.set(command.name, command);
    let names = [command.name, ...(command.aliases || [])]
    for (let name of names) {
        group._lookup.set(name, command.name);
    }
    console.log(`Added '${command.name}' to group '${group.name}'`)
    if (defaultCommand) group.default = command
    command._group = group;
}
interface CommandResponseInfo {
    readonly name?: string,
    readonly message: string
}
enum ResponseType {
    Info = 0,
    Warning = 1,
    Error = 2,
    Failure = 2,
    Success = 3,
}
class CommandResponse implements CommandResponseInfo {
    type = ResponseType.Info
    hasCooldownOverride?: boolean
    get hasCooldown() {
        return this.hasCooldownOverride ?? this.type == ResponseType.Error
    }
    isSendable: boolean = false
    info: CommandResponseInfo = { message: "e" }
    get message() {
        return this.info.message
    }
    get name() {
        return this.info.name
    }
    static colors: Mapping<ResponseType, ColorResolvable> = {
        [ResponseType.Info]: Colors.Aqua,
        [ResponseType.Warning]: Colors.Yellow,
        [ResponseType.Error]: Colors.Red,
        [ResponseType.Success]: Colors.Green,
    }
    async send(msg: Message) {
        if (!this.isSendable) throw new Error(`Cannot send a non-sendable response.`)
        let embed = new EmbedBuilder()
            .setDescription(this.info.message)
            .setColor(CommandResponse.colors[this.type])
        if (this.info.name != null) embed.setTitle(this.info.name)
        return await msg.reply({ embeds: [embed] })
    }
    setType(type: ResponseType) {
        this.type = type
        return this
    }
    setHasCooldown(hasCooldown: boolean) {
        this.hasCooldownOverride = hasCooldown
        return this
    }
    constructor(info?: CommandResponseInfo) {
        if (!info) return
        this.info = info
        this.isSendable = true
    }
    static error(info?: CommandResponseInfo) {
        return new CommandResponse(info).setType(ResponseType.Error)
    }
    static generic(info?: CommandResponseInfo) {
        return new CommandResponse(info).setType(ResponseType.Info)
    }
    static success(info?: CommandResponseInfo) {
        return new CommandResponse(info).setType(ResponseType.Success)
    }
}
export default {
    parseCommand,
    lexer,
    convertArgs,
    subcommandGroup,
    addCommandToGroup,
    CommandResponse,
}