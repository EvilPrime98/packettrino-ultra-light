import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import { command_pwd } from "@/commands/pwd";
import { command_ls } from "@/commands/ls";
import { command_cd } from "@/commands/cd";
import { command_ip }from "@/commands/ip";
import { command_ping } from "@/commands/ping";
import { command_history } from "@/commands/history";
import { command_nano } from "@/commands/nano";
import { command_dhcp } from "@/commands/dhcp";
import { command_apt } from "@/commands/apt";

/**
 * Compiles, interprets and executes a terminal command
 * @returns
 */
export default async function unix() {

    const tCtx = TERMINAL_CONTEXT;
    const input = (TERMINAL_CONTEXT.get().input).trim(); //TODO: sanitize input
    const keyWord = input.split(" ")[0];

    const unixMap: Record<string, () => void | Promise<void>> =  {
        "pwd": () => command_pwd(),
        "ls": () => command_ls(),
        "cd": () => command_cd(),
        "ip": () => command_ip(),
        "ping": () => command_ping(),
        "history": () => command_history(),
        "nano": () => command_nano(),
        "dhcp": () => command_dhcp(),
        "apt": () => command_apt()
    }

    try {

        if (!Object.hasOwn(unixMap, keyWord)) {
            throw new Error(`Unknown command: ${keyWord}`);
        }

        await unixMap[keyWord]();

    }catch(error){

        tCtx.get().write(
            (error instanceof Error)
            ? error.message
            : `Error while executing command: ${keyWord}`
        );

    }

}

// window.clearInterval(window.pingInterval); //limpiamos todos los procesos de terminal en funcionamiento
// document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
// terminalBuffer.push(input); //añadimos el comando en el buffer
// currentCommandIndex++; //actualizamos el indice del cursor de comandos
// $terminal.querySelector("input").value = ""; //limpiamos la entrada
// commandFunctions[command] ? commandFunctions[command]() : terminalMessage(`Error: comando ${command} desconocido.`, networkObjectId); //ejecutamos la función correspondiente