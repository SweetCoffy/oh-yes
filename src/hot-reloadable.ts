import commands from "./hot-reloadable/commands.js"
import economy from "./hot-reloadable/economy.js"
import yamlLoader from "./hot-reloadable/yaml-loader.js"
import yamlFuncs from "./hot-reloadable/yaml-funcs.js"

export default {
    commands: {} as typeof commands,
    eco: {} as typeof economy,
    yamlLoader: {} as typeof yamlLoader,
    yamlFuncs: {} as typeof yamlFuncs,
    loadfiles: [
        { globalName: "cmd", file: "hot-reloadable/commands.js", name: "commands" },
        { globalName: "eco", file: "hot-reloadable/economy.js", name: "eco" },
        { file: "hot-reloadable/yaml-funcs.js", name: "yamlFuncs" },
        { file: "hot-reloadable/yaml-loader.js", name: "yamlLoader" },
    ]
}