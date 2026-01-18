import Pc from "@/components/network-elements/pc";
import Router from "@/components/network-elements/router";
import SwitchElement from "@/components/network-elements/switch";
import TextObject from "@/components/tools/notes/note";
import { ENV } from "@/context/env-context";
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
            "switch": (id) => SwitchElement({ x, y, id }),
            "note": (id) => TextObject({ id, x, y })
        }
    );
}