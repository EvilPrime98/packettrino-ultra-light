import { ultraState } from "@ultra-light";
import { iface, NetworkElementProperties, UltraRouterConfig } from "@/types/types";
import { getRandomMac } from "@/utils/network_lib";
import { createFilesystem } from "@/utils/component";

type Props = {
    itemIndex: string;
}

export default function ultraRouterConfig({ itemIndex }: Props): UltraRouterConfig {

    const initialProperties: NetworkElementProperties = {
        "elementId": `${itemIndex}`,
        "ifaces": {
            'enp0s3': { ip: "", netmask: "", mac: getRandomMac(), dhcp: false },
            'enp0s8': { ip: "", netmask: "", mac: getRandomMac(), dhcp: false },
            'enp0s9': { ip: "", netmask: "", mac: getRandomMac(), dhcp: false }
        },
        "resolved": true,
        "ipv4-forwarding": true,
        "filesystem": createFilesystem(),
        "gateway": ""
    }

    const [properties, setProperties, propertiesSubscriber] = ultraState<NetworkElementProperties>(initialProperties);

    const updateInterface = (interfaceId: string, updates: Partial<iface>) => {
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

    const updateInterfaceByIndex = (index: number, updates: Partial<iface>) => {
        const ifaceKeys = Object.keys(properties().ifaces);
        const interfaceId = ifaceKeys[index];
        if (interfaceId) {
            updateInterface(interfaceId, updates);
        }
    }

    const addInterface = (interfaceId: string, newInterface: iface) => {
        setProperties({
            ...properties(),
            ifaces: {
                ...properties().ifaces,
                [interfaceId]: newInterface
            }
        });
    }

    const removeInterface = (interfaceId: string) => {
        const { [interfaceId]: removed, ...remainingIfaces } = properties().ifaces;
        setProperties({
            ...properties(),
            ifaces: remainingIfaces
        });
    }

    const updateProperty = <K extends keyof NetworkElementProperties>(
        key: K, 
        value: NetworkElementProperties[K]
    ) => {
        setProperties({
            ...properties(),
            [key]: value
        });
    }

    const replaceProperties = (newProperties: NetworkElementProperties) => {
        setProperties(newProperties);
    }

    return {
        properties,
        propertiesSubscriber,
        updateInterface,
        updateInterfaceByIndex,
        addInterface,
        removeInterface,
        updateProperty,
        replaceProperties
    }

}