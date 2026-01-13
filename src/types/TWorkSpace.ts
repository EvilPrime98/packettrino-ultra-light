import { IUltraPcConfig, IUltraSwitchConfig } from "./TConfig";


export type TElementCoordinates = {
    x: number;
    y: number;
}

export type TElementFactory = (id: string) => HTMLElement;

export type TElementType = "pc" | "router" | "switch";

export interface TElementApi {
    config: IUltraPcConfig | IUltraSwitchConfig | null;
    originx: string;
    originy: string;
    state: 'undropped' | 'dropped';
    itemType: string;
}

export type TElementConnections = {
    item_1_id: string;
    item_2_id: string;
}

export type WorkSpaceContextInterface = {
    
    getWorkSpaceProperties: () => {
        boardHeight: number;
        boardWidth: number;
        boardRect: DOMRect | null;
    };

    elementAPI: TElementApi | null;

    getCoordinatesByElementId: (elementId: string) => TElementCoordinates | null;
}