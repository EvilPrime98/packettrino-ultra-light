import { ultraState } from "@ultra-light";
import { createFilesystem } from "@/utils/component";
import type { IUltraRouterConfig, IRouterElementProperties } from "@/types/TConfig";
import ultraIfaceConfig from "./ultraIfaceConfig";
import ultraARPConfig from "./ultraARPConfig";
import ultraRoutingConfig from "./ultraRoutingConfig";
import { Packet } from "@/types/packets";
import { ENV } from "@/context/env";
import { TRACER_MENU_CTX as tmCtx } from "@/context/tracer-context";
import { packetProcessor } from "@/kernel/processors";
import ultraAnimations from "./ultraAnimations";
import { routing } from "@/kernel/routing";

export default function ultraRouterConfig({ itemIndex }: { itemIndex: string }): IUltraRouterConfig {

    const initialProperties: IRouterElementProperties = {
        "elementId": `${itemIndex}`,
        "resolved": true,
        "ipv4-forwarding": true,
        "filesystem": createFilesystem()
    }

    const [properties, setProperties, subscribeToProperties] = ultraState<IRouterElementProperties>(initialProperties);
    const [buffer, setBuffer, subscribeToBuffer] = ultraState<Packet[]>([]);
    const { visualize } = ultraAnimations();

    const self: IUltraRouterConfig = {
        ...ultraIfaceConfig({ initialIfaces: 3 }),
        ...ultraARPConfig(),
        ...ultraRoutingConfig(),
        properties,
        subscribeToProperties,
        replaceProperties,
        editProperty,
        sendPacket,
        getDefaultGateway,
        currentBuffer: buffer,
        subscribeToBuffer,
    }

    function getAvailableMACAddresses() {
        const ifaces = self.getIfaces();
        const macs = [];
        for (const ifaceID of Object.keys(ifaces)) {
            macs.push(ifaces[ifaceID].mac);
        }
        return macs;
    }

    function getAvailableIps() {
        const ifaces = self.getIfaces();
        const ips = [];
        for (const ifaceID of Object.keys(ifaces)) {
            ips.push(ifaces[ifaceID].ip);
        }
        return ips;
    }
    
    function replaceProperties(newProperties: IRouterElementProperties) {
        setProperties(newProperties);
    }

    function editProperty(
        property: keyof IRouterElementProperties, 
        value: IRouterElementProperties[keyof IRouterElementProperties]
    ) {
        setProperties({
            ...properties(),
            [property]: value
        })
    }

    function findReceiverInterface(originId: string) {
        const ifaces = self.getIfaces();
        for (const ifaceId of Object.keys(ifaces)) {
            const iface = ifaces[ifaceId];
            if (iface.connection.itemId === originId) return iface;
        }
        return null;
    }

    async function sendPacket(
        packet: Packet, 
        originId: string
    ) {

        if (ENV.get().visualToggle) {
            await visualize(originId, properties().elementId, packet);
        }

        if (ENV.get().trackTraffic === true){
            tmCtx.get().addPacket(packet, originId);
        }
        
        const iface = findReceiverInterface(originId);
        if (!iface) return;

        if (!iface.promiscuousMode) {

            const validMacs = [...getAvailableMACAddresses(), 'ff:ff:ff:ff:ff:ff'];
            if (!validMacs.includes(packet.destinationMac)) {
                return;
            }

        }

        setBuffer([...buffer(), packet]);

        const [replyPacket, wasProcessed] = await packetProcessor(packet, self);
        if (wasProcessed && replyPacket) {
            await routing(self, replyPacket);
            return;
        }

        if ( !wasProcessed
            && !getAvailableIps().includes(packet.destinationIp)
            && self.properties()['ipv4-forwarding'] === true
        ){
            if (packet.destinationMac === 'ff:ff:ff:ff:ff:ff' || packet.destinationIp === '255.255.255.255') return;
            await routing(self, packet);
        }
        
    }

    function getDefaultGateway() {
        const currRoutingRules = [...self.routingRules()];
        const gateway = currRoutingRules.find(rule =>
            rule.destinationIp === "0.0.0.0"
            && rule.destinationNetmask === "0.0.0.0"
        )?.gateway || "";
        return gateway;
    }

    return self;

}