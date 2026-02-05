import { UltraActivity, UltraComponent, ultraState, type UltraLightElement } from "@ultra-light";
import { ARPTable } from "../tables/arp_tab";
import { AdvancedOptions } from "@components/core/adv-options";
import { TERMINAL_CONTEXT as tCtx } from "../../context/terminal-context";
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import ultraPcConfig from "@/hooks/ultraPcConfig";
import type { AdvancedOption } from "@/types/types";
import { WORK_SPACE_CONTEXT } from "@context/workspace-context";
import { TNewNetworkElementProperties } from "@/types/TConfig";
import { ENV } from "@/context/env-context";
import styles from "./pc.module.css";
import { quick_ping } from "@/utils/quick_ping";

export default function Pc({ id, x, y }: TNewNetworkElementProperties): HTMLElement {

    const pcAPI  = ultraPcConfig({ 
        id,
        packageOptions: {
            'isc-dhcp-client': true,
        }
    });

    console.log(pcAPI);

    const [
        arpTableState, 
        setArpTableState, 
        subscribeArpTableState
    ] = ultraState(false);
    
    const [
        advOptionsState, 
        setAdvOptionsState, 
        subscribeAdvOptionsState
    ] = ultraState(false);

    const [
        packetState, 
        setPacketState, 
        subscribePacketState
    ] = ultraState(false);

    const [
        contextClickEvent, 
        setContextClickEvent,
    ] = ultraState<null | Event>(null);
    
    const [
        , 
        setIsDeleting, 
        subscribeIsDeleting
    ] = ultraState(false);
    
    const options: AdvancedOption[] = [
        { message: "Show ARP Table", callback: () => setArpTableState(true) },
        { message: "Terminal", callback: showTerminal },
        { message: "Delete", callback: () => setIsDeleting(true) }
    ]

    function canConnect() {
        const ifaces = pcAPI.getIfaces();
        const numofInterfaces = Object.keys(ifaces).length;
        const numofConnections = Object.keys(ifaces).filter(ifaceId =>
            ifaces[ifaceId].connection.api !== null
        ).length;
        return numofConnections < numofInterfaces;
    }

    function showTerminal() {

        if (tCtx.get().isVisible) return;

        tCtx.set({
            ...tCtx.get(),
            "isVisible": true,
            "elementAPI": pcAPI,
        })

    }

    function onClick() {

        if (ENV.get().quickPingMode === true) {
            setPacketState(true);
            quick_ping(pcAPI, () => {
                setPacketState(false);
            })
            return;
        }

        if (pmCtx.get()?.isVisible) return;

        pmCtx.get().update({
            "isVisible": true,
            "pcElementAPI": pcAPI
        })

    }

    function onRightClick(event: Event) {
        event.preventDefault();
        setContextClickEvent(event);
        setAdvOptionsState(!advOptionsState());
    }

    function onDelete(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    function onDragStart(event: Event) {

        const dragEvent = event as DragEvent;
        const self = event.currentTarget;

        if (!(dragEvent instanceof DragEvent)) return;
        if (!(self instanceof HTMLElement)) return;

        WORK_SPACE_CONTEXT.set({
            ...WORK_SPACE_CONTEXT.get(),
            elementAPI: {
                config: pcAPI,
                originx: self.style.left,
                originy: self.style.top,
                state: 'dropped',
                itemType: 'pc'
            }
        })

    }

    function onIfaceChanges(self: UltraLightElement) {
        const icon = self as HTMLImageElement;
        if (!icon) return;
        icon.draggable = canConnect();
        icon.classList.toggle(styles['clickable'], canConnect());
    }

    return UltraComponent({

        component: (
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
                        subscriber: pcAPI.subscribeToIfaces,
                        triggerFunction: onIfaceChanges
                    }
                ]

            }),

            UltraActivity({

                component: ARPTable({
                    onClose: () => setArpTableState(false),
                    arpCache: pcAPI.getARPCache,
                    arpSubscriber: pcAPI.subscribeToArpCache,
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
            'contextmenu': onRightClick,
            'click': onClick,
            'dragstart': onDragStart
        },

        trigger: [
            {
                subscriber: subscribeIsDeleting,
                triggerFunction: onDelete
            }
        ]

    })

}