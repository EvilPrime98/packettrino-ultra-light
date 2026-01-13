import { UltraActivity, UltraComponent, ultraState, type UltraLightElement } from "@ultra-light";
import { ARPTable } from "../tables/arp_tab";
import { AdvancedOptions } from "@components/core/adv-options";
import { TERMINAL_CONTEXT as tCtx } from "../../context/terminal-context";
import { PC_MENU_CTX as pmCtx } from "../../context/modals";
import ultraPcConfig from "@/hooks/ultraPcConfig"; 
import type { AdvancedOption } from "@/types/types";
import { WORK_SPACE_CONTEXT } from "../core/work-space";
import { IUltraPcConfig, TNewNetworkElementProperties } from "@/types/TConfig";
import { getActiveInterfaces } from "@/utils/component";
import { ENV } from "@/context/env";
import styles from "./pc.module.css";
import { quick_ping } from "@/commands/ping";

export default function Pc({ id, x, y }: TNewNetworkElementProperties): HTMLElement {

    const elementAPI: IUltraPcConfig = ultraPcConfig({ id });
    const [arpTableState, setArpTableState, subscribeArpTableState] = ultraState(false);
    const [advOptionsState, setAdvOptionsState, subscribeAdvOptionsState] = ultraState(false);
    const [packetState, setPacketState, subscribePacketState] = ultraState(false);
    const [contextClickEvent, setContextClickEvent,] = ultraState<null | Event>(null);
    const [, setIsDeleting, subscribeIsDeleting] = ultraState(false);

    const hasAvailableConnections = () => {
        const numofConnections = getActiveInterfaces(
            elementAPI.properties()
        ).length;
        const numofInterfaces = Object.keys(
            elementAPI.properties().ifaces
        ).length;
        return numofConnections < numofInterfaces;
    }

    const clickHandler = () => {
        
        if (ENV.get().quickPingMode === true) {

            setPacketState(true);
            
            quick_ping(elementAPI, () => {
                setPacketState(false);
            })

            return;

        }

        if (pmCtx.get()?.isVisible) return;

        pmCtx.set({
            ...pmCtx.get(),
            "isVisible": true,
            "pcElementAPI": elementAPI
        })
        
    }

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

    const handleDelete = (self: UltraLightElement) => {
        self._cleanup?.();
        self.remove();
    }

    const options: AdvancedOption[] = [
        { message: "Show ARP Table", callback: () => setArpTableState(true) },
        { message: "Terminal", callback: showTerminal },
        { message: "Delete", callback: () => setIsDeleting(true) }
    ]

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

    const handlePropertiesChanges = (self: UltraLightElement) => {
        const icon = self as HTMLImageElement;
        if (!icon) return;
        icon.draggable = hasAvailableConnections();
        icon.classList.toggle(styles['clickable'], hasAvailableConnections());
    }

    return (

        UltraComponent({

            component:(
                `<article
                    id="${id}"
                    class="item-dropped pc ${styles["pc-animated"]}"
                >
                </article>`
            ),

            styles: {
                left: `${x}px`,
                top: `${y}px`
            },

            children: [

                UltraComponent({

                    component: (`
                        <img 
                            src="./assets/board/pc.svg"
                            alt="pc"
                            draggable="true"
                            class="${styles['clickable']}"
                        />
                    `),

                    trigger: [
                        { 
                            subscriber: elementAPI.subscribeToProperties, 
                            triggerFunction: handlePropertiesChanges 
                        }
                    ]

                }),
                
                UltraActivity({
                    
                    component: ARPTable({ 
                        onClose: () => setArpTableState(false),
                        arpCache: () => elementAPI.properties()["arp-cache"],
                        subscribeToProperties: elementAPI.subscribeToProperties
                    }),

                    mode: {
                        state: arpTableState,
                        subscriber: subscribeArpTableState
                    }

                }),

                UltraActivity({
                    
                    component: AdvancedOptions({
                        onClose: () => setAdvOptionsState(false),
                        contextClickEvent,
                        options: [...options],
                        subscribeAdvOptionsState
                    }),

                    mode: {
                        state: advOptionsState,
                        subscriber: subscribeAdvOptionsState
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
                'contextmenu': contextMenuHandler,
                'click': clickHandler,
                'dragstart': dragStartHandler
            },

            trigger: [
                { 
                    subscriber: subscribeIsDeleting, 
                    triggerFunction: handleDelete 
                }
            ]

        })

    )

}