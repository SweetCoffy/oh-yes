import { Worker } from "worker_threads";
var evalWorkerCount = 4
export var evalWorkers: { busy: number, worker: Worker }[] = []
export function reloadWorkers() {
    for (var w of evalWorkers) {
        w.worker.terminate()
    }
    evalWorkers = []
    for (let i = 0; i < evalWorkerCount; i++) {
        var worker = new Worker("./build/eval-worker.js")
        evalWorkers.push({ busy: 0, worker });
        worker.on("error", (er) => {
            evalWorkers[i].busy = 0
            console.error(er)
        })
    }
}