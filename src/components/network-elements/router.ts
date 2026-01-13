import { UltraLightElement, UltraComponent, ultraState, UltraActivity } from "@ultra-light";
import { AdvancedOptions } from "@components/core/adv-options";
import { TERMINAL_CONTEXT as tCtx} from "../../context/terminal-context";
import { WORK_SPACE_CONTEXT } from "../core/work-space";
import ultraRouterConfig from "@/hooks/ultraRouterConfig";
import { TNewNetworkElementProperties } from "@/types/TConfig";
import styles from "./router.module.css";

export default function Router({ x, y, id }: TNewNetworkElementProperties) {

    const elementAPI = ultraRouterConfig({ itemIndex: id });
    const [advOptionsState, setAdvOptionsState, subscribeAdvOptionsState] = ultraState(false);
    const [contextClickEvent, setContextClickEvent] = ultraState<null | Event>(null);
    const [, setIsDeleting, subscribeIsDeleting] = ultraState(false);

    const contextMenuHandler = (event: Event) => {
        event.preventDefault();
        setContextClickEvent(event);
        setAdvOptionsState(!advOptionsState());
    }

    const showTerminal = () => {
        if (tCtx.get().isVisible) return;
        tCtx.set({
            ...tCtx.get(),
            "isVisible": true,
            "elementAPI": elementAPI,
        })
    }
    
    const dragStartHandler = (event: Event) => {

        const dragEvent = event as DragEvent;
        const self = event.currentTarget;

        if (!(dragEvent instanceof DragEvent)) return;
        if (!(self instanceof HTMLElement)) return;

        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get(),
            elementAPI: {
                config: elementAPI,
                originx: self.style.left,
                originy: self.style.top,
                state: 'dropped',
                itemType: 'pc'
            }
        })

    }

    function deleteHandler(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    const options = [
        { message: "Terminal", callback: showTerminal },
        { message: "Routing Table", callback: () => alert("routing table") },
        { message: "Delete", callback: () => setIsDeleting(true) }
    ]

    return (

        UltraComponent({

            component:
                `<article
                id="${id}"
                class="item-dropped router ${styles["router-animated"]}"
            >
                <img 
                    src="./assets/board/router.svg"
                    alt="pc"
                    draggable="true"
                >
            </article>`,

            styles: {
                left: `${x}px`,
                top: `${y}px`
            },

            children: [

                UltraActivity({
                    
                    component: AdvancedOptions({
                        onClose: () => setAdvOptionsState(false),
                        subscribeAdvOptionsState,
                        options: [...options],
                        contextClickEvent
                    }),

                    mode: {
                        state: advOptionsState,
                        subscriber: subscribeAdvOptionsState
                    }

                })

            ],

            eventHandler: {
                'contextmenu': contextMenuHandler,
                'dragstart': dragStartHandler
            },

            trigger: [{ subscriber: subscribeIsDeleting, triggerFunction: deleteHandler }]

        })

    )

}