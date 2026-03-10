import { TElementApi, TElementCoordinates } from "@/types/TWorkSpace";
import { UltraContext } from "ultra-light.js";

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
    
    /**
     * Updates the context with a new value. Short-hand
     * for using the setter but allows for partial updates.
     * @param updates
     */
    update(updates: Partial<WorkSpaceContextInterface>): void;

}

/**
 * This context is used to store the state of the WorkSpace component.
 * It contains the dimensions of the board, the coordinates of the elements,
 * and the API of the last element that was dragged over the board.
 * @returns {WorkSpaceContextInterface}
 */
export const WORK_SPACE_CONTEXT = UltraContext<WorkSpaceContextInterface>({
    
    measureBoard: () => {},

    boardProperties: {
        boardHeight: 0,
        boardWidth: 0,
        boardRect: null
    },

    elementAPI: null,

    getCoordinatesByElementId: () => null,

    update: (updates: Partial<WorkSpaceContextInterface>) => {
        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get(),
            ...updates
        });
    }

});