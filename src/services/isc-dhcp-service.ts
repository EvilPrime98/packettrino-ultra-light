import type { TLayer3Config, IUltraDhcpClientConfig, TDhcpClientActions } from "@/types/TConfig";
import { DhcpDiscover, isDhcpAck } from "@/types/Tpackets";
import { InterfaceDoesNotExistError } from "@/errors";
import { hasDHCPClient } from "@/types/typeguards";
import { ENV } from "@/context/env-context";

/** 
 * Executes a DHCP cliente service action on a network element.
 * @param elementAPI Network element API.
 * @param ifaceId Interface ID.
 * @param action Action to execute. Can be 'discover', 'release' or 'request'.
 * @returns
 * @throws Error if the DHCP client is not available.
 * @throws Error if the interface does not exist.
 * @throws Error if the interface is not configured as a DHCP client.
 */
export async function dhcp_service(
    elementAPI: TLayer3Config,
    ifaceId: string,
    action: TDhcpClientActions
) {

    if (!hasDHCPClient(elementAPI)) {
        throw new Error('Error: DHCP client is not available.');
    }

    if (!Object.keys(elementAPI.getIfaces()).includes(ifaceId)) {
        throw new InterfaceDoesNotExistError(ifaceId);
    }

    if (!elementAPI.dhcpClient.getDhcpIfaces().includes(ifaceId)) {
        throw new Error(`Error: The interface "${ifaceId}" is not configured as a DHCP client.`);
    }

    if (action === 'discover') {
        await sendDHCPDiscover(
            elementAPI, 
            ifaceId
        );
    }

}

/**
 * Sends a DHCP discover packet to the netowork.
 * @param elementAPI Network element API
 * @param ifaceId Interface ID
 * @returns
 * @throws Error if the interface does not exist.
 * @throws Error if the interface is not connected.
 */
export async function sendDHCPDiscover(
    elementAPI: TLayer3Config & Record<'dhcpClient', IUltraDhcpClientConfig>,
    ifaceId: string
): Promise<void> {

    const ifaces = elementAPI.getIfaces();
    const iface = ifaces[ifaceId];
    
    if (!iface) {
        throw new InterfaceDoesNotExistError(ifaceId);
    }

    const packet = new DhcpDiscover(iface.mac);
    const connectionAPI = iface.connection.api;
    
    if (!connectionAPI) {
        throw new Error('Error: No connection detected.');
    }

    return new Promise((resolve, reject) => {

        const unsubscribe = elementAPI.subscribeToBuffer(async () => {
            const buffer = elementAPI.currentBuffer();
            if (buffer.length === 0) return;
            const lastPacket = buffer[buffer.length - 1];
            if (!isDhcpAck(lastPacket)) return;    
            clearTimeout(timeoutId);
            unsubscribe();
            resolve();
        });

        const timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error('DHCP discover timed out'));
        }, ENV.get().$REQUEST_TIMEOUT * 1000);

        connectionAPI.sendPacket(
            packet, 
            elementAPI.properties().elementId
        );

    });

}