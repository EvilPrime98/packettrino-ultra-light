import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import command_pwd from "@/commands/pwd";
import { command_ls, command_cd } from "@/commands/filesystem";
import { command_ip }from "@/commands/ip";
import { command_ping } from "@/commands/ping";
import { command_history } from "@/commands/history";

/**
 * Compiles, interprets and executes a terminal command
 * @returns 
 */
export default function unix() {
    
    const tCtx = TERMINAL_CONTEXT;
    const input = (TERMINAL_CONTEXT.get().input).trim(); //TODO: sanitize input
    const keyWord = input.split(" ")[0];

    const unixMap: Record<string, () => void> =  {
        "pwd": () => command_pwd(),
        "ls": () => command_ls(),
        "cd": () => command_cd(),
        "ip": () => command_ip(),
        "ping": () => command_ping(),
        "history": () => command_history()
    }

    if (Object.hasOwn(unixMap, keyWord)) {

        unixMap[keyWord]()
        
    } else {

        tCtx.get().write(
            `Unknown command: ${keyWord}`
        );

    }

}

// window.clearInterval(window.pingInterval); //limpiamos todos los procesos de terminal en funcionamiento
// document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
// terminalBuffer.push(input); //añadimos el comando en el buffer
// currentCommandIndex++; //actualizamos el indice del cursor de comandos
// $terminal.querySelector("input").value = ""; //limpiamos la entrada
// commandFunctions[command] ? commandFunctions[command]() : terminalMessage(`Error: comando ${command} desconocido.`, networkObjectId); //ejecutamos la función correspondiente