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
import { command_mkdir } from "@/commands/mkdir";
import { command_rm } from "@/commands/rm";

/**
 * Compiles, interprets and executes a terminal command
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
        "apt": () => command_apt(),
        "mkdir": () => command_mkdir(),
        "rm": () => command_rm()
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