import { ultraState } from "@ultra-light";
import { createFilesystem } from "@/utils/component";
import { IUltraPcConfig, TPackageConfigs, TPackageOptions, TPcElementProperties } from "@/types/TConfig";
import { Packet } from "@/types/Tpackets";
import { ENV } from "@/context/env-context";
import { TRACER_MENU_CTX as tmCtx } from "@/context/tracer-context";
import { packetProcessor } from "@/kernel/processors";
import { routing } from "@/kernel/routing";
import ultraRoutingConfig from "./ultraRoutingConfig";
import ultraAnimations from "./ultraAnimations";
import ultraARPConfig from "./ultraARPConfig";
import ultraIfaceConfig from "./ultraIfaceConfig";
import { dpkg } from "@/services/dpkg_service";

export default function ultraPcConfig({
    id,
    packageOptions
}: {
    /**
     * The unique identifier for the network element.
     */
    id: string,
    /** Optional parameter to indicate which packages should be included in the network element. */
    packageOptions?: TPackageOptions
}): IUltraPcConfig {

    const initialProperties: TPcElementProperties = {
        "elementId": `${id}`, 
        "filesystem": createFilesystem(),
        "ipv4-forwarding": false,
        "packageList": []
    }

    const [properties, setProperties, subscribeToProperties] = ultraState<TPcElementProperties>(initialProperties);
    const [buffer, setBuffer, subscribeToBuffer] = ultraState<Packet[]>([]);
    const { visualize } = ultraAnimations();
    const ifaceConfig = ultraIfaceConfig({ initialIfaces: 1 });
    const routingConfig = ultraRoutingConfig();
    const arpConfig = ultraARPConfig();

    const self: IUltraPcConfig = {
        properties,
        subscribeToProperties,
        replaceProperties,
        editProperty,
        sendPacket,
        currentBuffer: buffer,
        subscribeToBuffer,
        getDefaultGateway,
        ...ifaceConfig,
        ...routingConfig,
        ...arpConfig,
        install
    };

    function replaceProperties(newProperties: TPcElementProperties) {
        setProperties(newProperties);
    }

    function editProperty(
        property: keyof TPcElementProperties,
        value: TPcElementProperties[keyof TPcElementProperties]
    ) {
        setProperties({
            ...properties(),
            [property]: value
        })
    }

    function getAvailableMACAddresses() {
        const ifaces = self.getIfaces();
        const macs = [];
        for (const ifaceID of Object.keys(ifaces)) {
            macs.push(ifaces[ifaceID].mac);
        }
        return macs;
    }

    function findReceiverInterface(
        originId: string
    ): string | null {
        const ifaces = self.getIfaces();
        for (const ifaceId of Object.keys(ifaces)) {
            const iface = ifaces[ifaceId];
            if (iface.connection.itemId === originId) return ifaceId;
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

        if (ENV.get().trackTraffic === true) {
            tmCtx.get().addPacket(packet, originId);
        }

        const receiverIfaceId = findReceiverInterface(originId);
        if (!receiverIfaceId) return;

        if (!self.getIfaces()[receiverIfaceId].promiscuousMode) {
            const validMacs = [...getAvailableMACAddresses(), 'ff:ff:ff:ff:ff:ff'];
            if (!validMacs.includes(packet.destinationMac)) {
                return;
            }
        }

        const [replyPacket, wasProcessed] = await packetProcessor(
            packet, 
            self,
            receiverIfaceId
        );

        if (wasProcessed) {
            if (wasProcessed) setBuffer([...buffer(), packet]);
            if (replyPacket) {
                if (replyPacket.destinationIp === '255.255.255.255') {
                    await self.getIfaces()[receiverIfaceId].connection.api?.sendPacket(
                        replyPacket, 
                        self.properties().elementId
                    );
                }else {
                    await routing(self, replyPacket);
                }
            }
            return;
        }

        if (!wasProcessed
            && !self.getAvailableIps().includes(packet.destinationIp)
            && self.properties()['ipv4-forwarding'] === true
        ) {
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

    function install(
        packageConfig: TPackageConfigs 
    ) {
        Object.assign(self, packageConfig);
    }

    if (packageOptions) dpkg(self).install(packageOptions);

    return self;

}