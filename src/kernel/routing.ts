import { Packet } from "@/types/Tpackets";
import { TLayer3Config } from "@/types/TConfig";
import { getNetwork } from "@/utils/network_lib";
import type { WritableKeys } from "@/types/types";
import arp from "@services/arp_service";

/**
 * Finds the next hop for a packet based on the routing rules configured on the element.
 * @param elementApi 
 * @param packet 
 * @returns if the packet was routed or discarded
 */
export async function routing(
    elementApi: TLayer3Config,
    packet: Packet
): Promise<boolean> {

    const destinationIp = packet.destinationIp;
    const routingRules = [...elementApi.routingRules()];
    
    const result = Object.groupBy(routingRules, rule =>
        (rule.destinationIp === '0.0.0.0' && rule.destinationNetmask === '0.0.0.0')
            ? 'defaultRules'
            : (rule.nextHop === '0.0.0.0') ? 'directRules' : 'remoteRules'
    );

    const { directRules = [], remoteRules = [], defaultRules = [] } = result;

    function alterPacketProperty(
        property: WritableKeys<typeof packet>,
        value: string
    ) {
        packet[property] = value;
    }

    async function sendPacket(
        rule: typeof routingRules[0], 
        nextHopIp: string
    ) {
        
        const iface = elementApi.getIfaces()[rule.iface];
        const connectionApi = iface.connection.api;
        if (!connectionApi) return false;

        const destinationMac = await arp(nextHopIp, elementApi, iface);
        if (!destinationMac) return false;

        alterPacketProperty('destinationMac', destinationMac);
        alterPacketProperty('originMac', iface.mac);
        
        if (packet.originIp === '0.0.0.0') {
            alterPacketProperty('originIp', iface.ip);
        }
        
        await connectionApi.sendPacket(
            packet, 
            elementApi.properties().elementId
        );        

        return true;

    }

    for (const rule of directRules) {
        if (rule.destinationIp === getNetwork(destinationIp, rule.destinationNetmask)) {
            if (await sendPacket(rule, destinationIp)) return true;
        }
    }

    for (const rule of remoteRules) {
        if (rule.destinationIp === getNetwork(destinationIp, rule.destinationNetmask)) {
            if (await sendPacket(rule, rule.nextHop)) return true;
        }
    }

    if (defaultRules.length > 0) {
        const rule = defaultRules[0];
        if (await sendPacket(rule, rule.nextHop)) return true;
    }

    return false;

}