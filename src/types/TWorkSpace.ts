import { UltraLightElement } from "ultra-light.js";
import { TLayer2Config, TLayer3Config } from "./TConfig";

export type TElementCoordinates = {
    x: number;
    y: number;
}

export type TElementFactory = (id: string) => UltraLightElement;

export type TCreatableElement = "pc" | "router" | "switch" | "note" | "dhcp-server";

export interface TElementApi {
    config: TLayer2Config | TLayer3Config | null;
    originx: string;
    originy: string;
    state: 'undropped' | 'dropped';
    itemType: string;
}

export type TElementConnections = {
    item_1_id: string;
    item_2_id: string;
}