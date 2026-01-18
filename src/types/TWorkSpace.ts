import { TLayer3Config } from "./TConfig";

export type TElementCoordinates = {
    x: number;
    y: number;
}

export type TElementFactory = (id: string) => HTMLElement;

export type TElementType = "pc" | "router" | "switch";

export interface TElementApi {
    config: TLayer3Config | null;
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

    /**
     * Measures the board. Information is stored
     * in boardProperties.
     * @returns 
     */
    measureBoard: () => void;

    /**
     * Returns the properties of the board.
     */
    boardProperties: {
        boardHeight: number;
        boardWidth: number;
        boardRect: DOMRect | null;
    }

    /**
     * API of the element that is 
     * currently being dragged over the board.
     */
    elementAPI: TElementApi | null;

    /**
     * Returns the coordinates of an element by its ID.
     * @param elementId 
     * @returns 
     */
    getCoordinatesByElementId: (elementId: string) => TElementCoordinates | null;

}