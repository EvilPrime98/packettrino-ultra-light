import { UltraComponent, UltraContext, ultraEffect, ultraState } from "@ultra-light";
import { checkObjectClip } from "@utils/checkObjectClip";
import { TElementCoordinates, TElementType, WorkSpaceContextInterface } from "@/types/TWorkSpace";
import { createElementMap, getNextElementId } from "@/utils/component";
import { SvgCanvas } from "./svg-canvas";

/**
 * This context is used to store the state of the WorkSpace component.
 * It contains the dimensions of the board, the coordinates of the elements,
 * and the API of the last element that was dragged over the board.
 * @returns {WorkSpaceContextInterface}
 */
const WORK_SPACE_CONTEXT = UltraContext<WorkSpaceContextInterface>({

    getWorkSpaceProperties: () => ({
        boardHeight: 0,
        boardWidth: 0,
        boardRect: null
    }),

    elementAPI: null,

    getCoordinatesByElementId: () => null,

});

export { WORK_SPACE_CONTEXT };

/**
 * Component that represents the WorkSpace.
 * @returns 
 */
export function WorkSpace() {

    const [elements, setElements,] = ultraState<Record<string, TElementCoordinates>>({});
    const [
        pendingUpdate, 
        setPendingUpdate, 
        subscribeToPendingUpdate
    ] = ultraState<string | null>(null);

    /**
     * Creates a new element of the specified type at the specified coordinates within
     * the WorkSpace.
     * @param itemType 
     * @param x 
     * @param y 
     * @param container 
     * @returns 
     */
    const createNewElement = (
        itemType: TElementType,
        x: number,
        y: number,
        container: HTMLElement
    ): void => {
        const elementMap = createElementMap(x, y);
        if (!(itemType in elementMap)) return;
        const newId = getNextElementId(itemType);
        const newElement = elementMap[itemType](newId);
        container.appendChild(newElement);
        const newElements = {
            ...elements(),
            [newId]: { x, y }
        };
        setElements(newElements);
    };

    /**
     * Moves an existing element to the specified coordinates within the WorkSpace.
     * @param elementId 
     * @param x 
     * @param y 
     */
    const moveExistingElement = (
        elementId: string,
        x: number,
        y: number
    ): void => {
        const newElements = { ...elements() };
        newElements[elementId] = { x, y };
        setElements(newElements);
        setPendingUpdate(elementId);
    };

    const dropItemOverBoard = (event: Event): void => {

        //type guard
        event.preventDefault();
        const dropEvent = event as DragEvent;
        const container = event.currentTarget as HTMLElement;
        if (!dropEvent.dataTransfer || !container) return;

        //handle data
        const itemData = WORK_SPACE_CONTEXT.get().elementAPI;
        const config = itemData?.config;
        const boardRect = container.getBoundingClientRect();
        let x = dropEvent.clientX - boardRect.left;
        let y = dropEvent.clientY - boardRect.top;
        [x, y] = checkObjectClip(x, y, container);

        //move element
        if (itemData?.state === 'dropped' && config) {
            moveExistingElement(config.properties().elementId, x, y);
            return;
        }

        //create new element
        if (itemData?.state === 'undropped') {
            const itemType = itemData?.itemType as TElementType;
            createNewElement(itemType, x, y, container);
        }

    };

    const handlePendingUpdate = (self: HTMLElement): void => {
        //type guard
        const elementId = pendingUpdate();
        if (!elementId) return;
        const coordinates = elements()[elementId];
        if (!coordinates) return;
        if (!self) return;
        const element: HTMLElement | null = self.querySelector(`#${elementId}`);
        if (!element) return;
        //update state
        element.style.left = `${coordinates.x}px`;
        element.style.top = `${coordinates.y}px`;
        setPendingUpdate(null);
    };

    const workSpace = UltraComponent({

        component: `<section class="board"></section>`,

        styles: {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
        },

        eventHandler: { 
            'dragover': (event: Event) => event.preventDefault(),
            'drop': dropItemOverBoard
        },

        children: [
            SvgCanvas()
        ],

        trigger: [
            { subscriber: subscribeToPendingUpdate, triggerFunction: handlePendingUpdate }
        ]

    });

    //API
    const getWorkSpaceProperties = () => {
        const workSpaceProperties = window.getComputedStyle(workSpace, null);
        const boardHeight = parseInt(workSpaceProperties.getPropertyValue("height"));
        const boardWidth = parseInt(workSpaceProperties.getPropertyValue("width"));
        const boardRect = workSpace.getBoundingClientRect();
        return { boardHeight, boardWidth, boardRect };
    };

    const getCoordinatesByElementId = (elementId: string) => {
        return elements()[elementId];
    }

    ultraEffect(() => {

        const { set, get } = WORK_SPACE_CONTEXT;

        set({
            ...get(),
            getWorkSpaceProperties,
            getCoordinatesByElementId
        });

    }, []);

    return workSpace;

}