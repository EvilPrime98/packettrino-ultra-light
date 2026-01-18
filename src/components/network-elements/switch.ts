import styles from "./switch.module.css";
import { AdvancedOption, MacRecord } from "@/types/types";
import { UltraActivity, UltraLightElement, UltraComponent, ultraState } from "@ultra-light";
import { AdvancedOptions } from "../core/adv-options";
import ultraSwitchConfig from "@/hooks/ultraSwitchConfig";
import { TOASTER_CONTEXT as toCtx } from "@/components/core/toaster";
import { WORK_SPACE_CONTEXT as wCtx } from "@/context/workspace-context";
import { IUltraSwitchConfig, TNewNetworkElementProperties } from "@/types/TConfig";
import { CANVAS_CONTEXT as cCtx } from "../core/svg-canvas";

export default function SwitchElement({ x, y, id }: TNewNetworkElementProperties): HTMLElement {

    const selfApi: IUltraSwitchConfig = ultraSwitchConfig({ id });
    const [advOptionsState, setAdvOptionsState, subscribeAdvOptionsState] = ultraState<boolean>(false);
    const [contextClickEvent, setContextClickEvent,] = ultraState<null | Event>(null);
    const [, setIsDeleting, subscribeIsDeleting] = ultraState<boolean>(false);
    const [macTableState, setMacTableState, subscribeToMacTable] = ultraState<boolean>(false);

    const options: AdvancedOption[] = [
        { message: "Delete", callback: () => setIsDeleting(true) }
    ]

    function canMove() {
        const activeConnections = selfApi.properties().connections
        .filter(connection => connection.api !== null);
        return activeConnections.length === 0;
    }

    function macTableHandler(){
        setMacTableState(!macTableState())
    }

    function onRightClick(event: Event) {
        event.preventDefault();
        setContextClickEvent(event);
        setAdvOptionsState(!advOptionsState());
    }

    function onDelete(self: UltraLightElement){
        self._cleanup?.();
        self.remove();
    }

    function onDropOver(event: Event) {

        event.preventDefault();
        event.stopPropagation();

        if (wCtx.get().elementAPI
            ?.itemType === "switch") return;

        const self = event.currentTarget;

        if (!self || !(self instanceof HTMLElement)) return;

        const elementApi = wCtx.get()
            .elementAPI?.config;

        if (!elementApi) return;

        try {

            selfApi.addConnection({
                itemId: elementApi.properties().elementId,
                api: elementApi
            });

            elementApi.addConnection({
                itemId: selfApi.properties().elementId,
                api: selfApi
            });

            selfApi.addMacRecord(
                elementApi.properties().elementId
            )

            cCtx.get().addCableElement?.({
                x1: wCtx.get().elementAPI?.originx || "0px",
                y1: wCtx.get().elementAPI?.originy || "0px",
                x2: self.style.left || "0px",
                y2: self.style.top || "0px",
                item1Api: selfApi,
                item2Api: elementApi
            });

            toCtx.get().createNotification(
                `Connection created succesfully!`,
                'success'
            );

        } catch (error: unknown) {

            if (!(error instanceof Error)) return;

            toCtx.get()
                .createNotification(
                    error.message,
                    'error'
                );

        }

    }

    function onDragStart(event: Event) {

        const dragEvent = event as DragEvent;
        const self = event.currentTarget;

        if (!(dragEvent instanceof DragEvent)) return;
        if (!(self instanceof HTMLElement)) return;

        wCtx.set({
            ...wCtx.get(),
            elementAPI: {
                config: selfApi,
                originx: self.style.left,
                originy: self.style.top,
                state: 'dropped',
                itemType: 'switch'
            }
        })

    }

    function onConnectionChanges(self: UltraLightElement) {
        const icon = self as HTMLImageElement;
        if (!icon) return;
        icon.draggable = canMove();
        icon.classList.toggle(styles['clickable'], canMove());
    }

    return (

        UltraComponent({

            component: (`
                <article
                id="${id}"
                class="item-dropped switch ${styles['switch-animated']}"
                >
                </article>
            `),

            styles: {
                left: `${x}px`,
                top: `${y}px`
            },

            children: [

                UltraComponent({
                    component: (`
                        <img 
                            src="./assets/board/switch.svg"
                            alt="switch"
                            draggable="true"
                            class="${styles['clickable']}"
                        />
                    `),

                    trigger: [
                        { 
                            subscriber: selfApi.subscribeToProperties, 
                            triggerFunction: onConnectionChanges 
                        }
                    ]
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

                    component: macTable({
                        macTableHandler,
                        getAllRecords: selfApi.getAllRecords,
                        subscribeToRecords: selfApi.subscribeToRecords
                    }),

                    mode: {
                        state: macTableState,
                        subscriber: subscribeToMacTable
                    }

                }),

            ],

            eventHandler: {
                'contextmenu': onRightClick,
                'click': macTableHandler,
                'drop': onDropOver,
                'dragstart': onDragStart
            },

            trigger: [
                { subscriber: subscribeIsDeleting, triggerFunction: onDelete }
            ]

        })

    )

}

type MacTableProps = {
    macTableHandler: () => void;
    getAllRecords: () => Record<string, MacRecord>;
    subscribeToRecords: (fn: (value: Record<string, MacRecord>) => void) => () => void
}

function macTable({ macTableHandler, getAllRecords, subscribeToRecords }: MacTableProps) {

    const recordsHandler = (self: HTMLElement) => {
        self.innerHTML = '';
        const currentRecords = getAllRecords();
        for (const record in currentRecords) {
            self.appendChild(RecordRow(currentRecords[record]));
        }
    }

    return (

        UltraComponent({

            component: `<article class="modal-table mac-table"></article>`,

            children: [

                UltraComponent({

                    component: `
                    <table>
                        <thead>
                            <tr>
                                <th>MAC</th>
                                <th>Port</th>
                            </tr>
                        </thead>
                    </table>`,

                    children: [
                        UltraComponent({
                            component: '<tbody></tbody>',
                            trigger: [{ subscriber: subscribeToRecords, triggerFunction: recordsHandler }]
                        })
                    ],

                }),

                UltraComponent({
                    component: '<button>Close</button>',
                    eventHandler: { 'click': macTableHandler }
                })

            ],

            eventHandler: {
                'click': (event: Event) => event.stopPropagation(),
                'contextmenu': (event: Event) => event.stopPropagation()
            },

        })

    )

}

function RecordRow(record: MacRecord) {

    return (
        UltraComponent({
            component: `<tr><td>${record.mac}</td><td>${record.port}</td></tr>`
        })
    )

}