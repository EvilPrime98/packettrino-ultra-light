import { UltraActivity, UltraComponent, ultraState, type UltraLightElement } from "@ultra-light";
import { ARPTable } from "../tables/arp_tab";
import { AdvancedOptions } from "@components/core/adv-options";
import { TERMINAL_CONTEXT as tCtx } from "../../context/terminal-context";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import ultraPcConfig from "@/hooks/ultraPcConfig";
import type { AdvancedOption } from "@/types/types";
import { WORK_SPACE_CONTEXT } from "@context/workspace-context";
import { TNewNetworkElementProperties } from "@/types/TConfig";
import { ENV } from "@/context/env-context";
import styles from "./pc.module.css";
import { quick_ping } from "@/utils/quick_ping";
import ultraDhcpServerConfig from "@/hooks/ultraDHCPServerConfig";

export default function DhcpServer({ id, x, y }: TNewNetworkElementProperties): HTMLElement {

    const serverAPI = { 
        ...ultraPcConfig({ id }), 
        ...ultraDhcpServerConfig()
    };
    
    const [arpTableState, setArpTableState, subscribeArpTableState] = ultraState(false);
    const [advOptionsState, setAdvOptionsState, subscribeAdvOptionsState] = ultraState(false);
    const [packetState, setPacketState, subscribePacketState] = ultraState(false);
    const [contextClickEvent, setContextClickEvent,] = ultraState<null | Event>(null);
    const [, setIsDeleting, subscribeIsDeleting] = ultraState(false);

    const options: AdvancedOption[] = [
        { message: "Network Configuration", callback: onNetworkConfig },
        { message: "Show ARP Table", callback: () => setArpTableState(true) },
        { message: "Terminal", callback: showTerminal },
        { message: "Delete", callback: () => setIsDeleting(true) }
    ]

    function canConnect() {
        const ifaces = serverAPI.getIfaces();
        const numofInterfaces = Object.keys(ifaces).length;
        const numofConnections = Object.keys(ifaces).filter(ifaceId =>
            ifaces[ifaceId].connection.api !== null
        ).length;
        return numofConnections < numofInterfaces;
    }

    function showTerminal() {
        if (tCtx.get().isVisible) return;
        tCtx.get().update({
            "isVisible": true,
            "elementAPI": serverAPI,
        })
    }

    function onClick() {
        if (ENV.get().quickPingMode === true) {
            setPacketState(true);
            quick_ping(serverAPI, () => {
                setPacketState(false);
            })
            return;
        }
        if (dsCtx.get()?.isVisible) return;
        dsCtx.get().update({
            "isVisible": true,
            "serverAPI": serverAPI
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
        WORK_SPACE_CONTEXT.get().update({
            elementAPI: {
                config: serverAPI,
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

    function onNetworkConfig() {
        if (pmCtx.get()?.isVisible) return;
        pmCtx.get().update({
            "isVisible": true,
            "pcElementAPI": serverAPI
        })
    }

    return UltraComponent({

        component: `<article id="${id}"></article>`,

        className: [
            'item-dropped',
            'dhcp-server',
            styles['dhcp-server-animated']
        ],

        styles: {
            left: `${x}px`,
            top: `${y}px`
        },

        children: [

            UltraComponent({

                component: (`
                        <img 
                            src="./assets/board/dhcp.svg"
                            alt="pc"
                            draggable="true"
                            class="${styles['clickable']}"
                        />
                    `),

                trigger: [
                    {
                        subscriber: serverAPI.subscribeToIfaces,
                        triggerFunction: onIfaceChanges
                    }
                ]

            }),

            UltraActivity({

                component: ARPTable({
                    onClose: () => setArpTableState(false),
                    arpCache: serverAPI.getARPCache,
                    arpSubscriber: serverAPI.subscribeToArpCache,
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