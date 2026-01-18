import type { iface, IUltraRouterConfig } from "@/types/TConfig";
import { IUltraPcConfig } from "@/types/TConfig";
import { ArpRequest } from "@/types/packets";
import { ENV } from "@/context/env-context";

/**
 * Sends an ARP request to a specified destination ipv4 address and returns a valid 48-bit MAC address 
 * if the request was successful, or null if the request timed out without a response.
 * @param destinationIp Destination IP address
 * @param elementApi Element API
 * @param iface Interface to use
 * @returns
 */
export default async function arp(
    destinationIp: string,
    elementApi: IUltraPcConfig | IUltraRouterConfig,
    iface: iface
): Promise<string|null> {

    const cachedMac = getARPRecord(destinationIp, elementApi);

    if (cachedMac) {
        return cachedMac;
    }

    const arpRequest = new ArpRequest(
        iface.ip,
        destinationIp,
        iface.mac
    );

    return new Promise<string|null>((resolve) => {

        let unsubscribe: (() => void) | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let resolved = false;

        const cleanup = (result: string | null) => {

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

            resolve(result);

        };

        unsubscribe = elementApi.subscribeToBuffer(() => {

            const buffer = elementApi.currentBuffer();
            if (buffer.length === 0) return;
            const lastPacket = buffer[buffer.length - 1];

            if (
                lastPacket.protocol === "arp" &&
                lastPacket.type === "reply" &&
                lastPacket.originIp === destinationIp
            ) {
                cleanup(lastPacket.originMac);
            }

        });

        timeoutId = setTimeout(() => {
            cleanup(null);
        }, ENV.get().$REQUEST_TIMEOUT * 1000);

        iface.connection.api
        ?.sendPacket(
            arpRequest, 
            elementApi.properties().elementId
        )

    });

}

/**
 * Returns a 48-bit MAC address for a specified ipv4 address within the ARP cache of a device, or null if the IP address is not found.
 * @param ip Ipv4 address
 * @param elementApi Network element API
 * @returns 
 */
function getARPRecord(
    ip: string, 
    elementApi: IUltraPcConfig | IUltraRouterConfig
) {

    const arpTable = elementApi.getARPCache();
    const arpRecord = arpTable[ip];

    return (arpRecord) 
    ? arpRecord.mac
    : null;

}