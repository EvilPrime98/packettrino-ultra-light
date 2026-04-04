import { UltraComponent, ultraState } from "ultra-light.js";
import DefaultCable from "./default-cable";
import { IDefaultCableProps, TAnimatedPacket } from "@/types/Tcanvas";
import Packet from "./packet";
import { CANVAS_CONTEXT as caCtx } from "@/context/canvas-context";

export function SvgCanvas() {

    const [elementToAdd, setElementToAdd, subscribeToElementToAdd] = ultraState<IDefaultCableProps| null>(null);
    let $svg: HTMLElement | null = null;

    function elementsHandler() {
        const element = elementToAdd();
        if (!element) return;
        $svg?.appendChild?.(
            DefaultCable(element)
        );
    }

    function addCableElement(
        element: IDefaultCableProps
    ) {
        setElementToAdd(element);
    }

    async function createPacketAnimation(
        x1: string, 
        y1: string, 
        x2: string, 
        y2: string,
        type?: TAnimatedPacket
    ): Promise<void> {
        $svg?.appendChild?.(
            Packet({ x1, y1, x2, y2, type: type || "unicast" })
        );
        const promise = caCtx.get().animationPromise;
        if (promise) await promise;
    }

    function onMount(
        self: HTMLElement
    ) {
        $svg = self;
        const currentContext = caCtx.get();
        caCtx.set({
            ...currentContext,
            addCableElement,
            createPacketAnimation
        })
    }

    return UltraComponent({

        component: (`
            <svg  
                id="svg-board" 
                preserveAspectRatio="none" 
                width="100%" 
                height="100%"
            >
            </svg>
        `),

        eventHandler: { 
            'dragover': (event: Event) => event.preventDefault() 
        },

        styles: {
            position: "absolute",
            top: "0",
            left: "0"
        },

        trigger: [
            { subscriber: subscribeToElementToAdd, triggerFunction: elementsHandler }
        ],

        onMount: [onMount]

    })

}