import { TERMINAL_CONTEXT as tCtxt } from "@/context/terminal-context";
import { dpkg } from "@/services/dpkg_service";
import { catchopts } from "@/utils/network_lib";

export function command_apt(){
    
    const elementApi = tCtxt.get().elementAPI;
    if (!elementApi) return;

    const tokens = tCtxt.get().input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ");

    const $OPTS = catchopts(
        ['show', 'install:'],
        tokens
    );

    if (Object.hasOwn($OPTS, 'show')) {
        tCtxt.get().write(
            'List of Available Packages:\n' + 
            elementApi.properties().packageList.join("\n")
        );
        return;
    }

    if (Object.hasOwn($OPTS, 'install')) {
        try {
            if (!$OPTS['install']) throw new Error('Package name is required');
            dpkg(elementApi).install(
                { [$OPTS['install']]: true },
                { verbose: true }
            );
        }catch(error){
            tCtxt.get().write(
                (error instanceof Error) 
                ? `apt: ${error.message}`
                : 'apt: Error while installing package'
            );
        }
        return;
    }

}