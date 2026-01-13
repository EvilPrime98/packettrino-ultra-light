import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import { AlignmentError } from "@/errors";
import { catchopts, } from "@/utils/network_lib";
import { ip_route } from "@/services/routing_service";
import { ip_addr } from "@/services/ifaces_service";

export function command_ip() {

    const legalOptions = [
        'addr',
        'route',
        'add:',
        'del:',
        'dev:',
        'via:'
    ]

    try {

        const elementApi = tCtx.get()
        .elementAPI;

        if (!elementApi) {
            throw new AlignmentError("no element properties");
        }

        const args = tCtx.get().input.trim().split(/\s+/);
        const $OPTS = catchopts(legalOptions, args);

        if (Object.keys($OPTS).length === 1) {
            tCtx.get().write(ipHelp());
            return;
        }

        const actions = <Record<string, () => string | undefined>>{
            "addr": () => ip_addr(elementApi, $OPTS),
            "route": () => ip_route(elementApi, $OPTS)
        };

        for (const optionKey of Object.keys($OPTS)) {

            if (optionKey === "IND") continue;

            if (Object.hasOwn(actions, optionKey)) {
                const response = actions[optionKey]();
                if (response) tCtx.get().write(response);
                break;
            }

        }

    } catch (error: unknown) {

        const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';

        tCtx.get()
        .write(`ip: ${errorMessage}`)

    }

}

function ipHelp() {
    return 'ip: usage: ip [addr|route]';
}