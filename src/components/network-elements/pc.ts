import { UltraActivity, UltraComponent, ultraState, type UltraLightElement } from "@ultra-light";
import { ARPTable } from "../tables/arp_tab";
import { AdvancedOptionsDyn } from "@components/core/adv-options";
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import ultraPcConfig from "@/hooks/ultraPcConfig";
import { WORK_SPACE_CONTEXT } from "@context/workspace-context";
import { TNewNetworkElementProperties } from "@/types/TConfig";
import { ENV } from "@/context/env-context";
import styles from "./pc.module.css";
import { quick_ping } from "@/utils/quick_ping";
import { ultraAdvOptions } from "@/hooks/ultraAdvOptions";
import { deleteElement } from "@/utils/component";

export default function Pc({ id, x, y }: TNewNetworkElementProperties): HTMLElement {

    const pcAPI  = ultraPcConfig({ 
        id,
        packageOptions: { 
            'isc-dhcp-client': true, 
        }
    });

    //state that indicates whether the ARP table should be visible or not.
    const [ arpTableState, setArpTableState, subscribeArpTableState ] = ultraState(false);
    //state that indicates whether the advanced options should be visible or not.
    const [ advOptionsState, setAdvOptionsState, subscribeAdvOptionsState] = ultraState(false);
    //state that indicates whether the packet animation should be visible or not.
    const [ packetState, setPacketState, subscribePacketState] = ultraState(false);
    //state that saves the context menu event.
    const [ contextClickEvent, setContextClickEvent,] = ultraState<null | Event>(null);
    //state that indicates whether the element is being deleted or not.
    const [ , setIsDeleting, subscribeIsDeleting ] = ultraState(false);
    //advanced options for the PC element.
    const pcOptions = ultraAdvOptions(pcAPI, [
        { id: 'arp-table' , message: "Show ARP Table", callback: () => setArpTableState(true) },
        { id: 'delete', message: "Delete", callback: () => setIsDeleting(true) }
    ]);
    
    /**
     * Returns whether the PC element has available connections or not
     * @returns 
     */
    function canConnect() {
        const ifaces = pcAPI.getIfaces();
        const numofInterfaces = Object.keys(ifaces).length;
        const numofConnections = Object.keys(ifaces).filter(ifaceId =>
            ifaces[ifaceId].connection.api !== null
        ).length;
        return numofConnections < numofInterfaces;
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

    function onRightClick(
        event: Event
    ) {
        event.preventDefault();
        setContextClickEvent(event);
        setAdvOptionsState(!advOptionsState());
    }

    function onDragStart(
        event: Event
    ) {
        const dragEvent = event as DragEvent;
        const $pc = event.currentTarget;
        if (!(dragEvent instanceof DragEvent)) return;
        if (!($pc instanceof HTMLElement)) return;
        WORK_SPACE_CONTEXT.get().update({
            elementAPI: {
                config: pcAPI,
                originx: $pc.style.left,
                originy: $pc.style.top,
                state: 'dropped',
                itemType: 'pc'
            }
        })
    }

    /**
     * This function is called when there is a change in the interfaces
     * of the PC element.
     * @param self 
     * @returns 
     */
    function onIfaceChanges(
        self: UltraLightElement
    ) {
        const $icon = self as HTMLImageElement;
        $icon.draggable = canConnect();
        $icon.classList.toggle(styles['clickable'], canConnect());
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

            //icon
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

            //arp table
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

            //advanced options
            UltraActivity({

                component: AdvancedOptionsDyn({
                    onClose: () => setAdvOptionsState(false),
                    contextClickEvent,
                    options: pcOptions.get,
                    optionsSubscriber: pcOptions.subscribe,
                    subscribeAdvOptionsState,
                    deleteOption: pcOptions.delete
                }),

                mode: {
                    state: advOptionsState,
                    subscriber: subscribeAdvOptionsState
                }

            }),

            //packet animation
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
                triggerFunction: ($pc) => deleteElement($pc, pcAPI, true)
            }
        ]

    })

}