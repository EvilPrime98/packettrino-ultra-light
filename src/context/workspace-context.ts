import { WorkSpaceContextInterface } from "@/types/TWorkSpace";
import { UltraContext } from "@/ultra-light/ultra-light";

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

});