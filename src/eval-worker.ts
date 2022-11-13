import { Console } from "console"
import { inspect } from "util"
import { VM } from "vm2"
import { Writable } from "stream"
import { parentPort, threadId } from "worker_threads"

let ansi = false
let out = new Writable()
out.write = function write(chunk, encoding) {
    log += chunk?.toString(encoding)
    return true
}
let con = new Console(out)

let log = ""

let vm = new VM({
    sandbox: {
        get threadId() { return threadId },
        get ansi() { return ansi },
        set ansi(v) { ansi = v },
        get console() { return con }
    },
    timeout: 1500,
})

parentPort?.on("message", async (v) => {
    try {
        log = ""
        let res = await vm.run(v.code)
        parentPort?.postMessage({ result: inspect(res), id: v.id, log })
    } catch (er) {
        parentPort?.postMessage({ error: er + "", id: v.id })
    }
})