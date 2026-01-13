import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import { IcmpEchoRequest } from "@/types/packets";
import { IUltraPcConfig } from "@/types/TConfig";
import { ENV } from "@/context/env";
import { routing } from "@/kernel/routing";

/**
 * Sends a series of ICMP echo requests to a specified destination ipv4 address
 * and prints the response to the terminal.
 * @param destinationIp 
 * @param elementApi 
 * @returns 
 */
export async function ping(
    destinationIp: string,
    elementApi: IUltraPcConfig,
    count: number = 4 
) {

    const tCtx = TERMINAL_CONTEXT;

    tCtx.get()
    .write(
        `Pinging ${destinationIp} with 32 bytes of data:`
    );

    const results = {
        sent: 0,
        received: 0,
        lost: 0
    };

    for (let i = 0; i < count; i++) {

        const success = await sendSinglePing(
            destinationIp,
            elementApi,
        );

        results.sent++;

        if (success) {
            results.received++;
        } else {
            results.lost++;
        }

        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    }

    tCtx.get().write('');
    tCtx.get().write(`Ping statistics for ${destinationIp}:`);
    tCtx.get().write(
        `    Packets: Sent = ${results.sent}, Received = ${results.received}, Lost = ${results.lost} (${Math.round(results.lost / results.sent * 100)}% loss)`
    );

}

/**
 * Sends a single ICMP echo request to a specified destination ipv4 address
 * and returns a boolean indicating whether the request was successful.
 * @param destinationIp  
 * @param elementApi 
 * @returns 
 */
async function sendSinglePing(
    destinationIp: string,
    elementApi: IUltraPcConfig
): Promise<boolean> {

    elementApi
    .setPendingReply(true);

    return new Promise<boolean>((resolve) => {

        let unsubscribe: (() => void) | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let resolved = false;

        const cleanup = (success: boolean, message?: string) => {

            if (resolved) return;
            resolved = true;

            if (unsubscribe) {
                unsubscribe();
                unsubscribe = null;
            }

            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            elementApi.setPendingReply(false);

            if (message) {
                TERMINAL_CONTEXT.get().write(message);
            }

            resolve(success);

        };

        const icmpRequest = new IcmpEchoRequest(
            '0.0.0.0',
            destinationIp,
            'ff:ff:ff:ff:ff:ff',
            'ff:ff:ff:ff:ff:ff'
        );

        unsubscribe = elementApi.subscribeToBuffer(() => {

            const buffer = elementApi.currentBuffer();
            
            if (buffer.length === 0) return;

            const lastPacket = buffer[buffer.length - 1];

            if (
                lastPacket.protocol === "icmp" &&
                lastPacket.type === "reply" &&
                lastPacket.originIp === destinationIp
            ) {
                cleanup(
                    true,
                    `Reply from ${lastPacket.originIp}: bytes=32 time<1ms TTL=64`
                );
            }

        });

        timeoutId = setTimeout(() => {
            cleanup(false, `Request timed out.`);
        }, ENV.get().$REQUEST_TIMEOUT * 1000);

        routing(
            elementApi,
            icmpRequest
        ).catch(error => {
            console.error('Error routing request:', error);
            cleanup(false, `Error routing request: ${error}`);
        });
        
    });

}