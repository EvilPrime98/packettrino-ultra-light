import { Packet } from "@/types/Tpackets";
import { UltraLightElement } from "@/ultra-light/types";
import { UltraComponent } from "@/ultra-light/ultra-light";
import styles from './packet-tracer.module.css'
import type { PacketWithId } from "./packet-tracer";

export default function PacketTrafficTable({
    getFilteredPackets,
    subscribePackets,
    subscribeToFilter
}:{
    getFilteredPackets: () => PacketWithId[];
    subscribePackets: (fn: (value: Packet[]) => void) => () => void;
    subscribeToFilter: (fn: (value: string) => void) => () => void;
}) {
    
    function onChange(self: UltraLightElement) {
        const $tbody = self as HTMLElement;
        $tbody.innerHTML = '';
        getFilteredPackets().forEach(packet => {
            $tbody.appendChild(PacketTrafficTableRow({ packet }));
        });
    }

    return UltraComponent({

        component: `<div class="${styles['table-wrapper']}"></div>`,

        children: [

            UltraComponent({

                component: '<table></table>',

                children: [

                    UltraComponent({
                        component: (`
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>XID</th>
                                    <th>Protocol</th>
                                    <th>Type</th>
                                    <th>Origin IP</th>
                                    <th>Destination IP</th>
                                    <th>Origin MAC</th>
                                    <th>Destination MAC</th>
                                    <th>TTL</th>
                                </tr>
                            </thead>
                        `)
                    }),

                    UltraComponent({
                        
                        component: '<tbody></tbody>',
                        
                        children: [...getFilteredPackets().map(packet => PacketTrafficTableRow({ packet }))],

                        trigger: [

                            { 
                                subscriber: subscribePackets, 
                                triggerFunction: onChange 
                            },

                            {
                                subscriber: subscribeToFilter, 
                                triggerFunction: onChange
                            }

                        ]
                        
                    })

                ]

            })

        ]

    })

}

function PacketTrafficTableRow({
    packet
}: {
    packet: PacketWithId;
}) {

    return UltraComponent({
        component: (`
            <tr>
                <td>${packet.originId}</td>
                <td>${packet.xid}</td>
                <td>${packet.protocol}</td>
                <td>${packet.type}</td>
                <td>${packet.originIp}</td>
                <td>${packet.destinationIp}</td>
                <td>${packet.originMac}</td>
                <td>${packet.destinationMac}</td>
                <td>${'N/A'}</td>
            </tr>
        `)
    })

}