import { ArpReply, IcmpEchoReply, Packet } from "@/types/packets";
import { IUltraPcConfig, TPcElementProperties } from "@/types/TConfig";

/**
 * General processor for packets. It routes the packet to the appropriate processor based on the protocol.
 * Returns a reply packet or null if no reply is needed.
 * @param packet Packet to be processed.
 * @param elementApi API of the network element.
 * @returns
 */
export async function packetProcessor(
    packet: Packet,
    elementApi: IUltraPcConfig
) {

    const protocolMap: Record<string, () => Promise<Packet | null>> = {
        'arp': async () => arpProcessor(packet, elementApi.addArpCache, elementApi.properties),
        'icmp': async () => icmpProcessor(packet, elementApi.properties)
    }

    if (Object.hasOwn(protocolMap, packet.protocol)) {
        const replyPacket = await protocolMap[packet.protocol]();
        if (replyPacket) return replyPacket;
    }

    return null;

}

/**
 * General processor for ARP packets.
 * @param packet Packet to be processed.
 * @param addArpCache Function to add an ARP cache entry to the network element.
 * @param properties Function to get the properties of the network element.
 * @returns 
 */
function arpProcessor(
    packet: Packet,
    addArpCache: (ip: string, mac: string) => void,
    properties: () => TPcElementProperties
): Packet | null {

    addArpCache(
        packet.originIp, 
        packet.originMac
    );

    if (packet.type === 'request') {
        
        const replyPacket = new ArpReply(
            properties().ifaces['enp0s3'].ip,
            packet.originIp,
            properties().ifaces['enp0s3'].mac,
            packet.originMac
        )

        return replyPacket;

    }

    return null;

}

/**
 * General processor for ICMP packets.
 * @param packet Packet to be processed.
 * @param properties Function to get the properties of the network element.
 * @returns 
 */
function icmpProcessor(
    packet: Packet,
    properties: () => TPcElementProperties
): Packet | null {

    if (packet.type === 'request') {

        const icmpReply = new IcmpEchoReply(
            properties().ifaces['enp0s3'].ip,
            packet.originIp,
            properties().ifaces['enp0s3'].mac,
            packet.originMac
        );

        return icmpReply;

    }

    return null;

}