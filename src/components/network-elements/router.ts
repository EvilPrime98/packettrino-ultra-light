import { UltraLightElement, UltraComponent, ultraState, UltraActivity } from "@ultra-light";
import { AdvancedOptions } from "@components/core/adv-options";
import { TERMINAL_CONTEXT as tCtx } from "../../context/terminal-context";
import { WORK_SPACE_CONTEXT } from "@/context/workspace-context";
import ultraRouterConfig from "@/hooks/ultraRouterConfig";
import { TNewNetworkElementProperties } from "@/types/TConfig";
import styles from "./router.module.css";
import { RoutingTable } from "../tables/routing_tab";
import { ENV } from "@/context/env";
import { quick_ping } from "@/utils/quick_ping";
import { ROUTER_MENU_CTX as rmCtx } from "@/context/router-menu-context";

export default function Router({ x, y, id }: TNewNetworkElementProperties) {

    const elementAPI = ultraRouterConfig({ itemIndex: id });

    const [
        advOptionsState,
        setAdvOptionsState,
        subscribeAdvOptionsState
    ] = ultraState(false);

    const [
        routingTableState,
        setRoutingTableState,
        subscribeRoutingTableState
    ] = ultraState(false);

    const [
        contextClickEvent,
        setContextClickEvent
    ] = ultraState<null | Event>(null);

    const [
        ,
        setIsDeleting,
        subscribeIsDeleting
    ] = ultraState(false);

    const [
        packetState,
        setPacketState,
        subscribePacketState
    ] = ultraState(false);

    const options = [
        { message: "Terminal", callback: onTerminalOption },
        { message: "Routing Table", callback: () => setRoutingTableState(true) },
        { message: "Delete", callback: () => setIsDeleting(true) }
    ]

    function canConnect() {
        const ifaces = elementAPI.getIfaces();
        const numofInterfaces = Object.keys(ifaces).length;
        const numofConnections = Object.keys(ifaces).filter(ifaceId =>
            ifaces[ifaceId].connection.api !== null
        ).length;
        return numofConnections < numofInterfaces;
    }

    function onTerminalOption() {
        if (tCtx.get().isVisible) return;
        tCtx.set({
            ...tCtx.get(),
            "isVisible": true,
            "elementAPI": elementAPI,
        })
    }

    function onClick() {

        if (ENV.get().quickPingMode === true) {
            setPacketState(true);
            quick_ping(elementAPI, () => {
                setPacketState(false);
            })
            return;
        }

        if (rmCtx.get().isVisible) return;

        rmCtx.set({
            ...rmCtx.get(),
            "isVisible": true,
            "routerElementAPI": elementAPI
        })

    }

    function onRightClick(event: Event) {
        event.preventDefault();
        setContextClickEvent(event);
        setAdvOptionsState(!advOptionsState());
    }

    function onDragStart(event: Event) {

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

    function onDelete(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    function onIfaceChanges(self: UltraLightElement) {
        const icon = self as HTMLImageElement;
        if (!icon) return;
        icon.draggable = canConnect();
        icon.classList.toggle(styles['clickable'], canConnect());
    }

    return (

        UltraComponent({

            component:
                `<article
                id="${id}"
                class="item-dropped router ${styles["router-animated"]}"
            >
            </article>`,

            styles: {
                left: `${x}px`,
                top: `${y}px`
            },

            children: [

                UltraComponent({
                    component: (`
                        <img 
                            src="./assets/board/router.svg"
                            alt="pc"
                            draggable="true"
                            class="${styles['clickable']}"
                        />
                    `),

                    trigger: [
                        { 
                            subscriber: elementAPI.subscribeToIfaces, 
                            triggerFunction: onIfaceChanges
                        }
                    ]
                }),

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

                }),

                UltraActivity({

                    component: RoutingTable({
                        onClose: () => setRoutingTableState(false),
                        routingRules: elementAPI.routingRules,
                        subscribeToRoutingRules: elementAPI.subscribeToRoutingRules
                    }),

                    mode: {
                        state: routingTableState,
                        subscriber: subscribeRoutingTableState
                    }

                }),

                UltraActivity({

                    component: (`
                        <img 
                            src="/assets/packets/unicast.png"
                            class=${styles['packet-animation']}
                        />
                    `),

                    mode: {
                        state: packetState,
                        subscriber: subscribePacketState
                    }

                })

            ],

            eventHandler: {
                'contextmenu': onRightClick,
                'dragstart': onDragStart,
                'click': onClick
            },

            trigger: [{ subscriber: subscribeIsDeleting, triggerFunction: onDelete }]

        })

    )

}