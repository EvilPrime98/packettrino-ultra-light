import Pc from "@/components/network-elements/pc";
import Router from "@/components/network-elements/router";
import SwitchElement from "@/components/network-elements/switch";
import DhcpServer from "@/components/network-elements/dhcp-server";
import TextObject from "@/components/tools/notes/note";
import { ENV } from "@/context/env-context";
import { TElementFactory, TCreatableElement } from "@/types/TWorkSpace";
import { IPTTFolder } from "./pttFileSystem";
import { UltraLightElement } from "@/ultra-light/types";
import { TLayer2Config, TLayer3Config } from "@/types/TConfig";
import { isLayer3 } from "@/types/typeguards";
import { TOASTER_CONTEXT } from "@/context/toaster-context";

/**
 * Creates a basic filesystem object for any network element.
 * @returns a filesystem object.
 */
export function createFilesystem(): Record<string, IPTTFolder> {

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
export function createElementMap(
    x: number,
    y: number
): Record<TCreatableElement, TElementFactory> {
    return (
        {
            "pc": (id) => Pc({ x, y, id }),
            "router": (id) => Router({ x, y, id }),
            "switch": (id) => SwitchElement({ x, y, id }),
            "note": (id) => TextObject({ id, x, y }),
            "dhcp-server": (id) => DhcpServer({ x, y, id })
        }
    );
}

/**
 * Cleans up and deletes a network element.
 * @param element UltraLight Element representing the network element.
 * @param elementAPI Element API of the network element.
 * @param notification Whether to show an error notification or not.
 */
export function deleteElement(
    element: UltraLightElement,
    elementAPI: TLayer2Config | TLayer3Config,
    notification: boolean = false
) {

    try {

        if (isLayer3(elementAPI)) {
            const ifaces = elementAPI.getIfaces();
            for (const ifaceId of Object.keys(ifaces)) {
                const iface = ifaces[ifaceId];
                if (iface.connection.api !== null) {
                    throw new Error("Cannot delete an element that is connected to another element.");
                }
            }
        } else {
            const connections = elementAPI.properties().connections;
            for (const connection of connections) {
                if (connection.api !== null) {
                    throw new Error("Cannot delete an element that is connected to another element.");
                }
            }
        }

        element._cleanup?.();
        element.remove();

    }catch (error) {

        if (notification) {
            TOASTER_CONTEXT.get().createNotification(
                (error instanceof Error) ? error.message : 'Unknown error',
                'error'
            )
        }

    }

}