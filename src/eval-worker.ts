import { inspect } from "util"
import { VM } from "vm2"
import { parentPort, threadId } from "worker_threads"

var ansi = false

var vm = new VM({
    sandbox: {
        get threadId() { return threadId },
        get ansi() { return ansi },
        set ansi(v) { ansi = v },
    },
    timeout: 1500,
})

parentPort?.on("message", async (v) => {
    try {
        var res = await vm.run(v.code)
        parentPort?.postMessage({ result: inspect(res), id: v.id })
    } catch (er) {
        parentPort?.postMessage({ error: er + "", id: v.id })
    }
})