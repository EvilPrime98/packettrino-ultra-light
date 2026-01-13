import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import {
    AlignmentError,
    EmptyArgumentError,
    InvalidIpAddressError
} from "@/errors";
import { ping } from '@services/icmp_service'
import { isValidIp } from "@utils/network_lib";
import { catchopts } from "@utils/network_lib";
import { IUltraPcConfig } from "@/types/TConfig";
import { ENV } from "@/context/env";
import { TOASTER_CONTEXT as toCtx } from "@/components/core/toaster";

export async function command_ping() {

    try {

        const args = tCtx.get().input
            .trim()
            .split(" ");

        const OPTS = catchopts(
            ["-c:"],
            args
        );

        const count = Number(OPTS["-c"]) || undefined;
        const destinationIp = args[OPTS.IND + 1];

        if (!destinationIp) {
            throw new EmptyArgumentError("No destination IP provided.");
        }

        if (!isValidIp(destinationIp)) {
            throw new InvalidIpAddressError(
                `"${destinationIp}" is not a valid ipv4 address.`
            );
        }

        const elementApi = tCtx.get().elementAPI;

        if (!elementApi) {
            throw new AlignmentError(
                "No element properties detected. Was the component recently deleted?"
            );
        }

        await ping(
            destinationIp,
            elementApi,
            count
        );

    } catch (error: unknown) {

        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";

        tCtx.get()
            .write(`ping: ${errorMessage}`);

    }

}

/**
 * Sets up a quick ping process between two network elements.
 * @param elementAPI Network element API.
 * @param onFinish Function (can be asynchronous) to execute after the quick ping process is finished.
 * It's added to the queue if the process is already running.
 * @returns
 */
export const quick_ping = (() => {

    const onFinishFunctions = new Set<() => void | Promise<void>>();

    return async function(
        elementAPI: IUltraPcConfig,
        onFinish?: () => void | Promise<void>
    ) {
        const currObjects = [...ENV.get().quickPingObject];

        if (currObjects.length === 0) {

            ENV.set({
                ...ENV.get(),
                quickPingObject: [elementAPI]
            });

            if (onFinish) onFinishFunctions.add(onFinish);

            return;

        } else {

            if (onFinish) onFinishFunctions.add(onFinish);

            ENV.set({
                ...ENV.get(),
                quickPingObject: [...currObjects, elementAPI]
            });

            try {

                const [firstElementAPI, secondElementAPI] = ENV.get().quickPingObject;
                const firstIfaceId = Object.keys(firstElementAPI.properties().ifaces)[0];
                const secondIfaceId = Object.keys(secondElementAPI.properties().ifaces)[0];
                const originIp = firstElementAPI.properties().ifaces[firstIfaceId].ip;
                const destinationIp = secondElementAPI.properties().ifaces[secondIfaceId].ip;

                if (originIp === "" || destinationIp === "") {
                    throw new Error('One of the elements is not configured');
                }

                await ping(
                    destinationIp,
                    firstElementAPI,
                    1
                )

            } catch (error) {

                toCtx.get().createNotification(
                    (error instanceof Error) ? error.message : 'Unknown error',
                    'error'
                );

            } finally {

                ENV.set({
                    ...ENV.get(),
                    quickPingObject: []
                });

                for (const onFinishFunction of onFinishFunctions) {
                    await onFinishFunction();
                }

                onFinishFunctions.clear();

            }

        }
    };
    
})();