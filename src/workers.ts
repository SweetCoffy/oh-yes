import { Worker } from "worker_threads";
let evalWorkerCount = 4
export let evalWorkers: { busy: number, worker: Worker }[] = []
export function reloadWorkers() {
    for (let w of evalWorkers) {
        w.worker.terminate()
    }
    evalWorkers = []
    for (let i = 0; i < evalWorkerCount; i++) {
        let worker = new Worker("./out/eval-worker.js")
        evalWorkers.push({ busy: 0, worker });
        worker.on("error", (er) => {
            evalWorkers[i].busy = 0
            console.error(er)
        })
    }
}