import { IUltraPcConfig, IUltraRouterConfig } from "@/types/TConfig";
import { ENV } from "@/context/env-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { ping } from "@/services/icmp_service";

/**
 * Sets up a quick ping process between two network elements.
 * @param elementAPI Network element API.
 * @param onFinish Function (can be asynchronous) to execute after the quick ping process is finished.
 * It's added to the queue if the process is already running.
 */
export const quick_ping = (() => {

    const onFinishFunctions = new Set<() => void | Promise<void>>();
    let isProcessing = false;

    async function executeOnFinishCallbacks() {

        for (const onFinishFunction of onFinishFunctions) {
            await onFinishFunction();
        }

        onFinishFunctions.clear();

    }

    async function onCleanup() {

        ENV.set({
            ...ENV.get(),
            quickPingObject: []
        });

        isProcessing = false;

        await executeOnFinishCallbacks();

    }

    return async function (
        elementAPI: IUltraPcConfig | IUltraRouterConfig,
        onFinish?: () => void | Promise<void>
    ) {
        
        if (onFinish) {
            onFinishFunctions.add(onFinish);
        }

        const currObjects = [...ENV.get().quickPingObject];

        if (currObjects.length === 0) {
            ENV.set({
                ...ENV.get(),
                quickPingObject: [elementAPI]
            });
            return;
        }

        if (isProcessing) {
            ENV.set({
                ...ENV.get(),
                quickPingObject: [...currObjects, elementAPI]
            });
            return;
        }

        isProcessing = true;

        ENV.set({
            ...ENV.get(),
            quickPingObject: [...currObjects, elementAPI]
        });

        try {

            const [firstElementAPI, secondElementAPI] = ENV.get().quickPingObject;
            const firstIfaceId = Object.keys(firstElementAPI.getIfaces())[0];
            const secondIfaceId = Object.keys(secondElementAPI.getIfaces())[0];
            const originIp = firstElementAPI.getIfaces()[firstIfaceId].ip;
            const destinationIp = secondElementAPI.getIfaces()[secondIfaceId].ip;

            if (!originIp || !destinationIp) {
                throw new Error('One of the elements is not configured.');
            }

            await ping(
                destinationIp, 
                firstElementAPI, 
                1
            );

            onCleanup();

        } catch (error) {

            onCleanup();

            toCtx.get().createNotification(
                (error instanceof Error) ? error.message : 'Unknown error', 
                'error'
            );

        }

    };

})();