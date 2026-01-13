import { Packet } from "@/types/packets";
import { IUltraPcConfig } from "@/types/TConfig";
import { getNetwork } from "@/utils/network_lib";
import arp from "@services/arp_service";

export async function routing(
    elementApi: IUltraPcConfig,
    packet: Packet
){
    
    const destinationIp = packet.destinationIp;
    const routingRules = [...elementApi.routingRules()];    
    const result = Object.groupBy(routingRules, rule =>
        (rule.destinationIp === '0.0.0.0' 
            && rule.destinationNetmask === '0.0.0.0')
        ? 'defaultRules'
        : (rule.nextHop === '0.0.0.0') ? 'directRules' : 'remoteRules'
    );
    
    const { directRules } = result;

    if (directRules){

        for (const rule of directRules){

            if (rule.destinationIp === getNetwork(destinationIp, rule.destinationNetmask)){
                
                const iface = elementApi.properties().ifaces[rule.iface]
                const connectionApi = iface.connection.api;
                
                if (connectionApi) {

                    const destinationMac = await arp(
                        destinationIp,
                        elementApi,
                        iface
                    );

                    if (!destinationMac) return;

                    packet.originIp = iface.ip;
                    packet.destinationMac = destinationMac;
                    packet.originMac = iface.mac;

                    await connectionApi
                    .sendPacket(
                        packet, 
                        elementApi.properties().elementId
                    );

                }

            }

        }
    }

 
}