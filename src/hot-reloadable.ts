import commands from "./hot-reloadable/commands.js";
import economy from "./hot-reloadable/economy.js";
import yamlLoader from "./hot-reloadable/yaml-loader.js"

export default {
    commands: {} as typeof commands,
    eco: {} as typeof economy,
    yamlLoader: {} as typeof yamlLoader,
    loadfiles: [{ file: "hot-reloadable/commands.js", name: "commands" },
    { file: "hot-reloadable/economy.js", name: "eco" }, { file: "hot-reloadable/yaml-loader.js", name: "yamlLoader" }]
}