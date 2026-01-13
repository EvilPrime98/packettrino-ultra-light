import { ultraState } from "@ultra-light";
import { getRandomMac } from "@/utils/network_lib";
import { createFilesystem } from "@/utils/component";
import { AlreadyExistsError, NoAvailableInterfaceError } from "@/errors";
import { TPcElementProperties, IUltraPcConfig, TConnection, iface } from "@/types/TConfig";
import { Packet } from "@/types/packets";
import { ENV } from "@/context/env";
import { packetProcessor } from "@/utils/processors";
import ultraRoutingConfig from "./ultraRoutingConfig";
import ultraAnimations from "./ultraAnimations";
import ultraARPConfig from "./ultraARPConfig";

export default function ultraPcConfig({ id }: { id: string }): IUltraPcConfig {

    const initialProperties: TPcElementProperties = {
        "elementId": `${id}`,
        "ifaces": {
            'enp0s3': { 
                ip: "", 
                netmask: "", 
                mac: getRandomMac(), 
                dhcp: false, 
                connection: { 
                    itemId: '', 
                    api: null 
                } 
            }
        },
        "resolved": true,
        "ipv4-forwarding": false,
        "filesystem": createFilesystem()
    }

    const [properties, setProperties, subscribeToProperties] = ultraState<TPcElementProperties>(initialProperties);
    const [buffer, setBuffer, subscribeToBuffer] = ultraState<Packet[]>([]);
    const [pendingReply, setPendingReply] = ultraState<boolean>(false);
    const { visualize } = ultraAnimations();

    const self: IUltraPcConfig = {
        ...ultraRoutingConfig(),
        ...ultraARPConfig(),
        properties,
        subscribeToProperties,
        updateInterface,
        updateInterfaceByIndex,
        addInterface,
        removeInterface,
        replaceProperties,
        sendPacket,
        addConnection,
        removeConnection,
        setPendingReply,
        currentBuffer: buffer,
        subscribeToBuffer,
        getDefaultGateway,
        getNewIfaceId
    }

    function updateProperty<K extends keyof TPcElementProperties>(
        key: K,
        value: TPcElementProperties[K]
    ) {
        setProperties({
            ...properties(),
            [key]: value
        });
    }

    function removeInterface(interfaceId: string) {
        const { [interfaceId]: _removed, ...remainingIfaces } = properties().ifaces;
        setProperties({
            ...properties(),
            ifaces: remainingIfaces
        });
    }

    function replaceProperties(newProperties: TPcElementProperties) {
        setProperties(newProperties);
    }

    function getAvailableIps() {
        const ifaces = properties().ifaces;
        const ips = [];
        for (const ifaceID of Object.keys(ifaces)) {
            ips.push(ifaces[ifaceID].ip);
        }
        return ips;
    }

    function getAvailableMACAddresses() {
        const ifaces = properties().ifaces;
        const macs = [];
        for (const ifaceID of Object.keys(ifaces)) {
            macs.push(ifaces[ifaceID].mac);
        }
        return macs;
    }

    function getAvailableInterface(): string {
        const ifaces = properties().ifaces;
        for (const ifaceId of Object.keys(ifaces)) {
            const ifaceProperties = ifaces[ifaceId];
            if (ifaceProperties.connection.itemId === '') return ifaceId;
        }
        return '';
    }

    function updateInterface(interfaceId: string, updates: Partial<iface>) {
        setProperties({
            ...properties(),
            ifaces: {
                ...properties().ifaces,
                [interfaceId]: {
                    ...properties().ifaces[interfaceId],
                    ...updates
                }
            }
        });
    }

    function updateInterfaceByIndex(index: number, updates: Partial<iface>) {
        const ifaceKeys = Object.keys(properties().ifaces);
        const interfaceId = ifaceKeys[index];
        if (interfaceId) {
            updateInterface(interfaceId, updates);
        }
    }

    function addInterface(interfaceId: string) {

        if (Object.keys(properties().ifaces).includes(interfaceId)) throw new AlreadyExistsError(`Interface ${interfaceId} already exists`);

        const newInterface = {
            ip: "",
            netmask: "",
            mac: getRandomMac(),
            dhcp: false,
            connection: {
                itemId: '',
                api: null
            }
        }

        setProperties({

            ...properties(),

            ifaces: {
                ...properties().ifaces,
                [interfaceId]: newInterface
            }

        });

    }

    function addConnection({ itemId, api }: TConnection): void {
        const availableIface = getAvailableInterface();
        if (!availableIface) throw new NoAvailableInterfaceError("The Element Does Not Have An Available Interface.")
        const newIfaces = properties().ifaces;
        newIfaces[availableIface].connection.itemId = itemId;
        newIfaces[availableIface].connection.api = api;
        updateProperty('ifaces', newIfaces);
    }

    function removeConnection(itemId: string) {
        const newIfaces = properties().ifaces;
        for (const ifaceId of Object.keys(newIfaces)) {
            const iface = newIfaces[ifaceId];
            const connection = iface.connection;
            if (connection.itemId !== itemId) continue;
            iface.connection.itemId = '';
            iface.connection.api = null;
        }
        updateProperty('ifaces', newIfaces)
    }

    async function sendPacket(packet: Packet, originId: string) {

        if (ENV.get().visualToggle) await visualize(originId, properties().elementId, packet);

        if (pendingReply()){
            await packetProcessor(packet, self);
            setBuffer([...buffer(), packet]);
            return;
        }

        if (![...getAvailableMACAddresses(), 'ff:ff:ff:ff:ff:ff']
        .includes(packet.destinationMac)) return;

        if (!getAvailableIps().includes(packet.destinationIp)) return;

        const replyPacket = await packetProcessor(packet, self);

        if (!replyPacket) return;

        await properties().ifaces['enp0s3'].connection.api
        ?.sendPacket(
            replyPacket,
            properties().elementId
        );

    }

    function getDefaultGateway() {
        const currRoutingRules = [...self.routingRules()];
        const gateway = currRoutingRules.find(rule =>
            rule.destinationIp === "0.0.0.0"
            && rule.destinationNetmask === "0.0.0.0"
        )?.gateway || "";
        return gateway;
    }

    function getNewIfaceId(){
    
        const maxIndex = Object.keys(properties().ifaces)
        .map(ifaceId => Number(ifaceId.split('enp0s')[1]))
        .sort((a, b) => b - a)[0];

        return `enp0s${maxIndex + 1}`;

    }

    return self;

}