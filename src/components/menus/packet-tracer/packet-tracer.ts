import { UltraActivity, UltraComponent, ultraEffect, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import { dragModal } from "@/utils/dragModal";
import styles from './packet-tracer.module.css'
import { TRACER_MENU_CTX as tmCtx } from "@/context/tracer-context";
import { Packet } from "@/types/packets";

interface PacketWithId extends Packet {
    originId?: string;
}

export default function PacketTracer() {

    const [getPackets, setPackets, subscribePackets] = ultraState<PacketWithId[]>([]);

    function onCleanup() {
        setPackets([]);
    }
    
    function onContextChange() {
        if (!tmCtx.get().isVisible) onCleanup();
    }

    function filterPacketTraffic() {
        console.log('filterPacketTraffic');
    }

    function cleanPacketTraffic() {
        setPackets([]);
    }

    function filterPacketTrafficbyDevice() {
        console.log('filterPacketTrafficbyDevice');
    }

    function onAddPacket(
        packet: Packet, 
        originId: string
    ) {
        const newPacket = { ...packet, originId };
        setPackets([...getPackets(), newPacket]);
    }

    ultraEffect(() => {
        
        tmCtx.set({
            ...tmCtx.get(),
            addPacket: onAddPacket
        });

    }, []);

    return UltraActivity({
        
        component: UltraComponent({

            component: `<article class="${styles['packet-traffic']} draggable-modal"></article>`,

            children: [

                UltraComponent({
                    component: `<div class="${styles['window-frame']}"><p>Rastreador de Paquetes</p></div>`,
                    eventHandler: { mousedown: dragModal }
                }),

                FilterTraffic({
                    onFilter: filterPacketTraffic,
                    onFilterbyDevice: filterPacketTrafficbyDevice,
                    onClean: cleanPacketTraffic
                }),

                PacketTrafficTable({
                    getPackets,
                    subscribePackets
                })

            ]

        }),

        mode: {
            state: () => tmCtx.get().isVisible,
            subscriber: tmCtx.subscribe
        },

        trigger: [
            { subscriber: tmCtx.subscribe, triggerFunction: onContextChange }
        ]
        
    })

}

function FilterTraffic({
    onFilter,
    onFilterbyDevice,
    onClean
}: {
    onFilter: () => void
    onFilterbyDevice: () => void
    onClean: () => void
}) {

    function onkeydown(event: Event) {
        const kEvent = event as KeyboardEvent;
        if (kEvent.key === "Enter") onFilter();
    }

    return UltraComponent({

        component: `<div class="${styles['filter-traffic']}"></div>`,

        children: [

            UltraComponent({
                component: '<input type="text">',
                eventHandler: {
                    'keydown': onkeydown
                }
            }),

            UltraComponent({
                component: '<button class="btn-blue" id="filter-traffic-button">Filtrar</button>',
                eventHandler: { click: onFilter }
            }),

            UltraComponent({
                component: '<button class="btn-blue" id="clean-traffic-button">Limpiar</button>',
                eventHandler: { click: onClean }
            }),

            UltraComponent({
                component: '<select id="filter-by-device"></select>',
                eventHandler: { change: onFilterbyDevice }
            })

        ]

    })

}

function PacketTrafficTable({
    getPackets,
    subscribePackets
}:{
    getPackets: () => Packet[];
    subscribePackets: (fn: (value: Packet[]) => void) => () => void;
}) {
    
    function onPacketsChange(self: UltraLightElement) {
        const $tbody = self as HTMLElement;
        $tbody.innerHTML = '';
        getPackets().forEach(packet => {
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
                        children: [...getPackets().map(packet => PacketTrafficTableRow({ packet }))],
                        trigger: [{ subscriber: subscribePackets, triggerFunction: onPacketsChange }]
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