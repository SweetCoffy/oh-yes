import { Formatters } from "discord.js";
import { Command } from "../../types.js";

import { evalWorkers } from "../../workers.js"
export default {
    name: "eval",
    description: "Runs some JavaScript code in a sandbox",
    aliases: ["ev"],
    args: [{ name: "...code", required: true, type: "string" }],
    lexer: false,
    async run(msg, cod: string[]) {
        let code = cod.join(" ")
        try {
            let workerInfo = evalWorkers.find((v) => v.busy <= 0) || evalWorkers[Math.floor(Math.random() * evalWorkers.length)]
            workerInfo.busy++
            let worker = workerInfo.worker
            let id = Date.now()
            worker.postMessage({ code, id })
            let ansi = false
            let result = "undefined"
            let listener = async (v: any) => {
                if (v.id == id) {
                    worker.removeListener("message", listener)
                    ansi = v.ansi
                    result = v.result
                    if (v.log) {
                        await msg.reply(Formatters.codeBlock(v.log.slice(0, 2000)))
                    }
                    if (v.error) {
                        msg.reply(Formatters.codeBlock(v.error + ""))
                    } else {
                        msg.reply(Formatters.codeBlock(ansi ? "ansi" : "js", result))
                    }
                    workerInfo.busy--
                }
            }
            worker.on("message", listener)
        } catch (er) {
        } finally {

        }
    }
} as Command