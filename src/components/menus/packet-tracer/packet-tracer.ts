import { UltraActivity, UltraComponent, ultraEffect, ultraState } from "@/ultra-light/ultra-light";
import styles from './packet-tracer.module.css'
import { TRACER_MENU_CTX as tmCtx } from "@/context/tracer-context";
import { Packet } from "@/types/packets";
import MenuFrame from "@/components/menus/menu-frame";
import PacketTrafficTable from "./packet-tracer-table";
import FilterTraffic from "./packet-tracer-filter";

export interface PacketWithId extends Packet {
    originId?: string;
}

export default function PacketTracer() {

    const [
        getPackets,
        setPackets,
        subscribePackets
    ] = ultraState<PacketWithId[]>([]);

    const [
        getFilter,
        setFilter,
        subscribeToFilter
    ] = ultraState<string>('');

    function getFilteredPackets(): PacketWithId[] {
        const currPackets = [...getPackets()];
        const filteredPackets = currPackets.filter(packet => {
            if (packet.originId?.includes(getFilter())) return true;
            if (packet.protocol.includes(getFilter())) return true;
            if (packet.type.includes(getFilter())) return true;
            if (packet.originIp.includes(getFilter())) return true;
            if (packet.destinationIp.includes(getFilter())) return true;
            if (packet.originMac.includes(getFilter())) return true;
            if (packet.destinationMac.includes(getFilter())) return true;
            return false;
        });
        return filteredPackets;
    }

    function onContextChange() {
        if (!tmCtx.get().isVisible) {
            console.log('onContextChange');
        }
    }

    function onCleanTraffic() {
        setPackets([]);
    }

    function onFilterPacketTrafficbyDevice() {
        console.log('filterPacketTrafficbyDevice');
    }

    function onAddPacket(
        packet: Packet,
        originId: string
    ) {
        const newPacket = { ...packet, originId };
        setPackets([...getPackets(), newPacket]);
    }

    function onClose() {
        tmCtx.set({
            ...tmCtx.get(),
            isVisible: false
        })
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

                MenuFrame({
                    initTitle: 'Packet Tracer',
                    onClose
                }),

                FilterTraffic({
                    setFilter,
                    onFilterbyDevice: onFilterPacketTrafficbyDevice,
                    onClean: onCleanTraffic
                }),

                PacketTrafficTable({
                    getFilteredPackets,
                    subscribeToFilter,
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