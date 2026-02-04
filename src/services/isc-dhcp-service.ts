import { IUltraDHCPServerConfig, TDhcpServerProperties, TLayer3Config } from "@/types/TConfig";
import { isValidIp, ipToBinary, getNetwork } from "@/utils/network_lib";
import { DhcpDiscover, isDhcpAck } from "@/types/packets";
import { InterfaceDoesNotExistError } from "@/errors";
import { ENV } from "@/context/env-context";
import { hasDHCPClient } from "@/types/typeguards";

/**
 * Validator for the configuration of an ISC DHCP server.
 * @param serverAPI - The serverAPI object of the server.
 * @param newServerProperties - The new properties of the server.
 * @returns True if the configuration is valid, and throws an error if it is not.
 * @throws Error if the configuration is not valid.
 */
export function iscDhcpServerValidator(
    serverAPI : TLayer3Config & IUltraDHCPServerConfig,
    newServerProperties: TDhcpServerProperties
){

    if (typeof newServerProperties.state !== 'boolean') {
        throw new Error(`Error: The state property must be a boolean.`);
    }

    if (newServerProperties.listenOnIfaces.some(x => !Object.keys(serverAPI.getIfaces()).includes(x))) {
        throw new Error('Error: One or more interfaces are not available.');
    }

    if (!isValidIp(newServerProperties.offerRangeStart)) {
        throw new Error(`Error: "${newServerProperties.offerRangeStart}" is not a valid ipV4 address.`);
    }

    if (!isValidIp(newServerProperties.offerNetmask)) {
        throw new Error(`Error: "${newServerProperties.offerNetmask}" is not a valid ipV4 address.`);
    }

    if (!isValidIp(newServerProperties.offerRangeEnd)) {
        throw new Error(`Error: "${newServerProperties.offerRangeEnd}" is not a valid ipV4 address.`);
    }

    if (getNetwork(newServerProperties.offerRangeStart, newServerProperties.offerNetmask) 
        !== getNetwork(newServerProperties.offerRangeEnd, newServerProperties.offerNetmask)) {
        throw new Error(`Error: The range start address (${newServerProperties.offerRangeStart}) 
            and the range end address (${newServerProperties.offerRangeEnd}) are not in the same network.`);
    }
    
    if (ipToBinary(newServerProperties.offerRangeStart) 
        >= ipToBinary(newServerProperties.offerRangeEnd)) {
        throw new Error(`Error: The range start address (${newServerProperties.offerRangeStart}) 
            is greater than the range end address (${newServerProperties.offerRangeEnd}).`);
    }

    if (!isValidIp(newServerProperties.offerGateway)) {
        throw new Error(`Error: "${newServerProperties.offerGateway}" is not a valid ipV4 address.`);
    }

    if (getNetwork(newServerProperties.offerGateway, newServerProperties.offerNetmask) 
        !== getNetwork(newServerProperties.offerRangeStart, newServerProperties.offerNetmask)) {
        throw new Error(`Error: The gateway address (${newServerProperties.offerGateway}) 
            is not in the same network as the range start address (${newServerProperties.offerRangeStart}).`);
    }

    if (!isValidIp(newServerProperties.offerDns)) {
        throw new Error(`Error: "${newServerProperties.offerDns}" is not a valid ipV4 address.`);
    }

    if (Number.isInteger(newServerProperties.offerLeaseTime) === false) {
        throw new Error(`Error: "${newServerProperties.offerLeaseTime}" is not an integer.`);
    }

    if (Number(newServerProperties.offerLeaseTime) < ENV.get().dhcpMinLeaseTime 
    || Number(newServerProperties.offerLeaseTime) > ENV.get().dhcpMaxLeaseTime) {
        throw new Error(`Error: "${newServerProperties.offerLeaseTime}" is not a valid lease time. It must be between 120 and 86400 seconds.`);
    }

    return true;

}

/**
 * Sends a DHCP discover packet to the netowork.
 * @param elementAPI Network element API
 * @param ifaceId Interface ID
 * @returns 
 */
export async function sendDHCPDiscover(
    elementAPI: TLayer3Config,
    ifaceId: string
){

    if (!hasDHCPClient(elementAPI)){
        throw new Error('Error: DHCP client is not available.');
    }

    if (!Object.keys(elementAPI.getIfaces()).includes(ifaceId)) {
        throw new InterfaceDoesNotExistError(ifaceId);
    }
    
    if (!elementAPI.dhcpClient.getDhcpIfaces().includes(ifaceId)) {
        throw new Error(`Error: The interface "${ifaceId}" is not configured as a DHCP client.`);
    }

    const ifaces = elementAPI.getIfaces();
    const iface = ifaces[ifaceId];

    if (!iface) {
        throw new InterfaceDoesNotExistError(ifaceId);
    }

    const packet = new DhcpDiscover(
        iface.mac,
    );

    const connectionAPI = iface.connection.api;
    if (!connectionAPI) return;

    const unsubscribe = elementAPI.subscribeToBuffer( async () => {
        const buffer = elementAPI.currentBuffer();
        if (buffer.length === 0) return;
        const lastPacket = buffer[buffer.length - 1];
        if (!isDhcpAck(lastPacket)) return;
        unsubscribe();
    });

    await connectionAPI.sendPacket(
        packet, 
        elementAPI.properties().elementId
    );

}