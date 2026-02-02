import { DhcpAck, DhcpRequest, isDhcpAck, isDhcpDiscover, isDhcpOffer, isDhcpRequest, type Packet } from "@/types/packets";
import { DhcpOffer } from "@/types/packets";
import { hasDHCPServer, type TLayer3Config } from "@/types/TConfig";
import { ip_addr } from "@/services/ifaces_service";
import { encodeCidr } from "@/utils/network_lib";

export function dhcpProcessor(
    packet: Packet,
    elementAPI: TLayer3Config,
    receiverIfaceId: string
): [Packet | null, boolean] {

    if (isDhcpDiscover(packet)) {
        
        if (!hasDHCPServer(elementAPI)) {
            return [null, false];
        }

        const serverProperties = elementAPI.getDHCPServerProperties();

        if (!serverProperties.listenOnIfaces.includes(receiverIfaceId)) {
            return [null, false];
        }

        const iface = elementAPI.getIfaces()[receiverIfaceId];
        const offerIp = elementAPI.assignIp(packet.originMac);
        
        if (offerIp === null) return [null, true];

        const replyPacket = new DhcpOffer({
            originIp: iface.ip,
            originMac: iface.mac,
            destinationMac: packet.originMac, //this depends on the sofware
            serverIp: iface.ip,
            offerIp: offerIp,
            chaddr: packet.originMac,
            options: {
                gateway: serverProperties.offerGateway,
                netmask: serverProperties.offerNetmask,
                dns: serverProperties.offerDns,
                leasetime: serverProperties.offerLeaseTime
            }
        });

        return [replyPacket, true];

    }

    if (isDhcpOffer(packet)) {
        
        const iface = elementAPI.getIfaces()[receiverIfaceId];
        if (packet.chaddr !== iface.mac) return [null, false];

        const replyPacket = new DhcpRequest({
            originMac: iface.mac,
            serverIp: packet.siaddr,
            requestedIp: packet.yiaddr
        });

        return [replyPacket, true];

    }

    if (isDhcpRequest(packet)) {

        if (!hasDHCPServer(elementAPI)) return [null, false];
        if (packet.siaddr !== elementAPI.getIfaces()[receiverIfaceId].ip) return [null, false];
        const serverProperties = elementAPI.getDHCPServerProperties();
        
        const replyPacket = new DhcpAck({
            clientMac: packet.chaddr,
            assignedIp: packet.requestedIp,
            serverIp: elementAPI.getIfaces()[receiverIfaceId].ip,
            options: {
                gateway: serverProperties.offerGateway,
                netmask: serverProperties.offerNetmask,
                dns: serverProperties.offerDns,
                leasetime: serverProperties.offerLeaseTime,
                hostname: 'test'
            }
        });

        return [replyPacket, true];

    }

    if (isDhcpAck(packet)) {
        
        if (packet.chaddr !== elementAPI.getIfaces()[receiverIfaceId].mac) return [null, false];
        
        ip_addr(elementAPI,{
            'add': encodeCidr(packet.yiaddr, packet.netmask),
            'dev': receiverIfaceId
        })

        return [null, true];

    }

    return [null, false];

}