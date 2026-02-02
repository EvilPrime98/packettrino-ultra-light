import { ArpReply, IcmpEchoReply, Packet } from "@/types/packets";
import { IUltraPcConfig, IUltraRouterConfig, TLayer3Config } from "@/types/TConfig";
import { getAvailableIps } from "@/utils/network_lib";
import { dhcpProcessor } from "@/kernel/dhcp-processor";

/**
 * General processor for packets. It routes the packet to the appropriate processor based on the protocol.
 * Returns a reply packet or null if no reply is needed.
 * @param packet Packet to be processed.
 * @param elementApi API of the network element.
 * @returns
 */
export async function packetProcessor(
    packet: Packet,
    elementApi: IUltraPcConfig | IUltraRouterConfig,
    receiverIfaceId: string
): Promise<[Packet | null, boolean]> { 

    const protocolMap: Record<string, () => Promise<[Packet | null, boolean]>> = {
        'arp': async () => arpProcessor(packet, elementApi),
        'icmp': async () => icmpProcessor(packet, elementApi),
        'dhcp': async () => dhcpProcessor(packet, elementApi, receiverIfaceId)
    }

    if (Object.hasOwn(protocolMap, packet.protocol)) {
        const [replyPacket, wasProcessed] = await protocolMap[packet.protocol]();
        return [replyPacket, wasProcessed];
    }

    return [null, false];

}

/**
 * General processor for ARP packets.
 * @param packet Packet to be processed.
 * @param addArpCache Function to add an ARP cache entry to the network element.
 * @param properties Function to get the properties of the network element.
 * @returns An array containing the reply packet and a boolean indicating whether the packet was processed.
 */
function arpProcessor(
    packet: Packet,
    elementApi: TLayer3Config
): [Packet | null, boolean] {

    if (packet.type === 'request') {

        if (!elementApi.getAvailableIps().includes(packet.destinationIp)) {
            return [null, false];
        }

        elementApi.addArpCache(
            packet.originIp,
            packet.originMac
        );

        const replyPacket = new ArpReply(
            '0.0.0.0',
            packet.originIp,
            'ff:ff:ff:ff:ff:ff',
            'ff:ff:ff:ff:ff:ff'
        )

        return [replyPacket, true];

    }

    if (packet.type === 'reply') {

        elementApi.addArpCache(
            packet.originIp,
            packet.originMac
        );

        return [null, true];

    }

    return [null, false];

}

/**
 * General processor for ICMP packets.
 * @param packet Packet to be processed.
 * @param properties Function to get the properties of the network element.
 * @returns An array containing the reply packet and a boolean indicating whether the packet was processed.
 */
function icmpProcessor(
    packet: Packet,
    elementApi: TLayer3Config
): [Packet | null, boolean] {

    const availableIps = getAvailableIps(elementApi);
    if (!availableIps.includes(packet.destinationIp)) return [null, false];

    if (packet.type === 'request') {

        const icmpReply = new IcmpEchoReply(
            '0.0.0.0',
            packet.originIp,
            'ff:ff:ff:ff:ff:ff',
            'ff:ff:ff:ff:ff:ff',
        );

        return [icmpReply, true];

    }

    if (packet.type === 'reply') {

        return [null, true];

    }

    return [null, false];

}