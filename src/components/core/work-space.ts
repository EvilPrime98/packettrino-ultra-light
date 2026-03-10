import { UltraComponent, UltraLightElement, ultraState } from "ultra-light.js";
import { checkObjectClip } from "@utils/checkObjectClip";
import { TElementCoordinates, TCreatableElement } from "@/types/TWorkSpace";
import { createElementMap, getNextElementId } from "@/utils/component";
import { SvgCanvas } from "./svg-canvas";
import { WORK_SPACE_CONTEXT as wCtx, WORK_SPACE_CONTEXT } from "@/context/workspace-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import styles from './work-space.module.css';
import { TLayer2Config, TLayer3Config } from "@/types/TConfig";
import { isLayer3 } from "@/types/typeguards";

/**
 * Component that represents the WorkSpace.
 * @returns 
 */
export function WorkSpace() {

    const [ elements, setElements, ] = ultraState<Record<string, TElementCoordinates>>({});
    const [ pendingUpdate, setPendingUpdate, subscribeToPendingUpdate] = ultraState<string | null>(null);
    const [, setIsMeasuring, subscribeToIsMeasuring ] = ultraState<boolean>(false);

    /**
     * Checks whether an element within the board can be moved or not.
     * @param elementAPI 
     * @returns 
     */
    function canMove(
        elementAPI: TLayer2Config | TLayer3Config,
    ){
        if (isLayer3(elementAPI)) {
            const ifaces = elementAPI.getIfaces();
            const numofConnections = Object.keys(ifaces).filter(ifaceId => 
                ifaces[ifaceId].connection.api !== null
            ).length;
            return numofConnections === 0;
        }
        const activeConnections = elementAPI.properties().connections
        .filter(connection => connection.api !== null);
        return activeConnections.length === 0;
    }

    /**
     * Handles the creation of a new network element.
     * @param itemType 
     * @param x 
     * @param y 
     * @param container 
     * @returns 
     */
    function onCreateItem(
        itemType: TCreatableElement,
        x: number,
        y: number,
        container: HTMLElement
    ): void {
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

    function onMoveItem(
        elementId: string,
        x: number,
        y: number
    ): void {
        const newElements = { ...elements() };
        newElements[elementId] = { x, y };
        setElements(newElements);
        setPendingUpdate(elementId);
    };

    function onDropItem(
        event: Event
    ): void {

        event.preventDefault();
        const dropEvent = event as DragEvent;
        const container = event.currentTarget as HTMLElement;

        if (!dropEvent.dataTransfer || !container) return;

        const itemData = wCtx.get()!.elementAPI;
        const config = itemData?.config;
        const boardRect = container.getBoundingClientRect();
        let x = dropEvent.clientX - boardRect.left;
        let y = dropEvent.clientY - boardRect.top;
        [x, y] = checkObjectClip(x, y, container);

        if (itemData?.state === 'dropped' && config) {
            
            if (!canMove(config)) {
                
                toCtx.get()!.createNotification(
                    "Cannot move an element while it has active connections.",
                    'error'
                );

                return;

            }

            onMoveItem(config.properties().elementId, x, y);
            return;

        }

        if (itemData?.state === 'undropped') {
            const itemType = itemData?.itemType as TCreatableElement;
            onCreateItem(itemType, x, y, container);
        }

    };

    function onPendingUpdate(
        self: HTMLElement
    ): void {
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

    function onMeasure(
        self: UltraLightElement
    ) {

        const $workSpace = self as HTMLElement;
        const computedStyles = window.getComputedStyle($workSpace, null);
        const boardHeight = parseInt(computedStyles.getPropertyValue("height"));
        const boardWidth = parseInt(computedStyles.getPropertyValue("width"));
        const boardRect = $workSpace.getBoundingClientRect();

        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get()!,
            boardProperties: {
                boardHeight,
                boardWidth,
                boardRect
            }
        });

    };

    function getCoordinatesByElementId(
        elementId: string
    ) {
        return elements()[elementId] || null;
    };

    function onMount(){
        
        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get()!,
            measureBoard: () => setIsMeasuring(true),
            getCoordinatesByElementId
        });

    }        

    return UltraComponent({

        component: `<section class="${styles['board']}"></section>`,

        styles: {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
        },

        eventHandler: {
            'dragover': (event: Event) => event.preventDefault(),
            'drop': onDropItem
        },

        children: [
            SvgCanvas()
        ],

        trigger: [

            {
                subscriber: subscribeToPendingUpdate,
                triggerFunction: onPendingUpdate
            },

            {
                subscriber: subscribeToIsMeasuring,
                triggerFunction: onMeasure
            }

        ],

        onMount: [onMount]

    });

}