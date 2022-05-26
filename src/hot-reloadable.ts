import commands from "./hot-reloadable/commands.js";
import economy from "./hot-reloadable/economy.js";

export default {
    commands: {} as typeof commands,
    eco: {} as typeof economy,
    loadfiles: [{ file: "hot-reloadable/commands.js", name: "commands" }, { file: "hot-reloadable/economy.js", name: "eco" }]
}