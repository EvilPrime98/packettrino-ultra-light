import { UltraComponent, ultraEffect, UltraLightElement, ultraState } from "@ultra-light";
import { checkObjectClip } from "@utils/checkObjectClip";
import { TElementCoordinates, TElementType } from "@/types/TWorkSpace";
import { createElementMap, getNextElementId } from "@/utils/component";
import { SvgCanvas } from "./svg-canvas";
import { WORK_SPACE_CONTEXT as wCtx, WORK_SPACE_CONTEXT } from "@/context/workspace-context";
import styles from './work-space.module.css';

/**
 * Component that represents the WorkSpace.
 * @returns 
 */
export function WorkSpace() {

    const [ elements, setElements, ] = ultraState<Record<string, TElementCoordinates>>({});
    const [ pendingUpdate, setPendingUpdate, subscribeToPendingUpdate] = ultraState<string | null>(null);
    const [, setIsMeasuring, subscribeToIsMeasuring ] = ultraState<boolean>(false);

    const onCreateItem = (
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

    const onMoveItem = (
        elementId: string,
        x: number,
        y: number
    ): void => {
        const newElements = { ...elements() };
        newElements[elementId] = { x, y };
        setElements(newElements);
        setPendingUpdate(elementId);
    };

    const onDropItem = (event: Event): void => {

        //type guard
        event.preventDefault();
        const dropEvent = event as DragEvent;
        const container = event.currentTarget as HTMLElement;
        if (!dropEvent.dataTransfer || !container) return;

        //handle data
        const itemData = wCtx.get().elementAPI;
        const config = itemData?.config;
        const boardRect = container.getBoundingClientRect();
        let x = dropEvent.clientX - boardRect.left;
        let y = dropEvent.clientY - boardRect.top;
        [x, y] = checkObjectClip(x, y, container);

        //move element
        if (itemData?.state === 'dropped' && config) {
            onMoveItem(config.properties().elementId, x, y);
            return;
        }

        //create new element
        if (itemData?.state === 'undropped') {
            const itemType = itemData?.itemType as TElementType;
            onCreateItem(itemType, x, y, container);
        }

    };

    const onPendingUpdate = (self: HTMLElement): void => {
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

    const onMeasure = (self: UltraLightElement) => {

        const $workSpace = self as HTMLElement;
        const computedStyles = window.getComputedStyle($workSpace, null);
        const boardHeight = parseInt(computedStyles.getPropertyValue("height"));
        const boardWidth = parseInt(computedStyles.getPropertyValue("width"));
        const boardRect = $workSpace.getBoundingClientRect();

        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get(),
            boardProperties: {
                boardHeight,
                boardWidth,
                boardRect
            }
        });

    };

    const getCoordinatesByElementId = (elementId: string) => {
        return elements()[elementId] || null;
    };

    ultraEffect(() => {
        
        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get(),
            measureBoard: () => setIsMeasuring(true),
            getCoordinatesByElementId
        });

    }, []);

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

        ]

    });

}