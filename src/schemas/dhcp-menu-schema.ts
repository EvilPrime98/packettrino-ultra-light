import { IUltraDHCPServerConfig, TDhcpServerProperties, TLayer3Config } from "@/types/TConfig";
import { getNetwork, ipToBinary, isValidIp } from "@/utils/network_lib";
import { ENV } from "@/context/env-context";

/**
 * Validator for the configuration of an ISC DHCP server.
 * @param serverAPI - The serverAPI object of the server.
 * @param newServerProperties - The new properties of the server.
 * @returns True if the configuration is valid, and throws an error if it is not.
 * @throws Error if the configuration is not valid.
 */
export function iscDhcpServerValidator(
    serverAPI : TLayer3Config & Record<'dhcpserver', IUltraDHCPServerConfig>,
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