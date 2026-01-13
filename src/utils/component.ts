import Pc from "@/components/network-elements/pc";
import Router from "@/components/network-elements/router";
import SwitchElement from "@/components/network-elements/switch";
import { ENV } from "@/context/env";
import { TLayer3Properties } from "@/types/TConfig";
import { TElementFactory, TElementType } from "@/types/TWorkSpace";

/**
 * Function that creates a filesystem object for any network element.
 * @returns 
 */
export function createFilesystem() {

    return {
        "/": {
            "bin": {},
            "boot": {
                "file.txt": "Hello World"
            },
            "dev": {},
            "etc": {
                "hosts": "127.0.0.1 localhost",
                "resolv.conf": "",
                "network": {
                    "interfaces": ""
                }
            },
            "home": {},
            "var": {}
        }
    };

};

/**
 * Returns the next available ID for a network element while incrementing
 * the current index.
 * @param itemType 
 * @returns 
 */
export function getNextElementId(itemType: string): string {
    const foo = ENV.get();
    const currentIndex = foo["itemIndex"];
    const newId = `${itemType}-${currentIndex}`;
    ENV.set({ 
        ...foo,
        itemIndex: currentIndex + 1
    });
    return newId;
};

/**
 * Creates a map of network element types to their respective factories.
 * @param x 
 * @param y 
 * @returns 
 */
export function createElementMap(x: number, y: number): Record<TElementType, TElementFactory> {
    return (
        {
            "pc": (id) => Pc({ x, y, id }),
            "router": (id) => Router({ x, y, id }),
            "switch": (id) => SwitchElement({ x, y, id })
        }
    );
}

/**
 * Returns true or false based on whether the provided interface ID 
 * is valid for the provided network API.
 * @param api 
 * @param iface 
 * @returns 
 */
export function isValidIface(api: TLayer3Properties, iface: string) {
    const availableIfaces = Object.keys(api.ifaces);
    return availableIfaces.includes(iface);
}

/**
 * Returns an array of IDs of the active interfaces in the provided network API.
 * @param api 
 * @returns 
 */
export function getActiveInterfaces(api: TLayer3Properties): string[] {
    const connections = api.ifaces;
    const activeInterfaces = [];
    for (const iface of Object.keys(connections)) {
        const ifaceProperties = connections[iface];
        const ifaceElementConnectionId = ifaceProperties.connection.itemId;
        if (ifaceElementConnectionId) activeInterfaces.push(iface);
    }
    return activeInterfaces;
}

/**
 * Returns the ID of the first available interface in the provided network API, 
 * or an empty string if no interface is available.
 * @param api 
 * @returns 
 */
export function getAvailableInterface(api: TLayer3Properties): string {
    const ifaces = api.ifaces;
    for (const ifaceId of Object.keys(ifaces)) {
        const ifaceProperties = ifaces[ifaceId];
        if (ifaceProperties.connection.itemId === '') return ifaceId;
    }
    return '';
}