import { createWriteStream } from "fs"
import { join } from "path"
import { getHotReloadable } from "./loader.js"
import { enumeration } from "./util.js"

const SourcePath = `src`

export function genItems() {
    let { items } = getHotReloadable().eco

    let s = createWriteStream(join(SourcePath, "gen-items.ts"), { encoding: "utf8" })
    s.write(`export const Item = {\n`)
    for (let [k, v] of items) {
        let indent = "\t"
        let propName = v.name.split(" ").join("")
        s.write(indent + `/**\n`)
        s.write(indent + `* ${v.icon} ${v.name}\n`)
        if (v.attributes.size > 0) {
            s.write(indent + `*\n`)
            s.write(indent + `* Attributes:\n`)
            for (let [_, attr] of v.attributes) {
                s.write(indent + `* * ${attr.name} = ${attr.toString(false)}\n`)
            }
        }
        if (v.onUse) {
            s.write(indent + `*\n`)
            s.write(indent + `* On Use: \`${v.onUse.name}\`\n`)
        }
        s.write(indent + `*\n`)
        s.write(indent + `* From ${enumeration(v.sourceFiles.map(el => `\`${el}\``)) || "Unknown"}\n`)
        s.write(indent + `*/\n`)
        s.write(indent + `${propName}: "${k}",\n`)
    }

    s.end(`}`)
}
