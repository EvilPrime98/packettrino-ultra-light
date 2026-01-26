import { UltraComponent } from "@ultra-light";
//import { dynamicRoutingButton } from "./dynamic-routing-item";
import PanelItem from "./panel-item";
import { TPanelItem } from "@/types/TPanel";
import QuickPingTool from "./quick-ping";
import { TRACER_MENU_CTX as tmCtx } from "@/context/tracer-context";
import { WORK_SPACE_CONTEXT as wCtx } from "@/context/workspace-context";
import { SETTINGS_MENU_CTX as smCtx } from "@/context/settings-context";

const networkItems: TPanelItem[] = [
    {
        "name": "pc",
        "image": "./assets/panel/pc.svg",
        "draggable": true,
        "tooltip": "PC"
    },
    {
        "name": "router",
        "image": "./assets/panel/router.svg",
        "draggable": true,
        "tooltip": "Router"
    },
    {
        "name": "switch",
        "image": "./assets/panel/switch.svg",
        "draggable": true,
        "tooltip": "Switch"
    },
    {
        "name": 'dhcp-server',
        "image": "./assets/panel/dhcpserver.svg",
        "draggable": true,
        "tooltip": "DHCP Server"
    },
]

export default function Panel({ 
    isLoaded, 
    subscribeIsLoaded 
}: {
    isLoaded: () => boolean;
    subscribeIsLoaded: (fn: (value: boolean) => void) => () => void;
}) {

    const onLoad = ($section: HTMLElement) => {
        if (isLoaded()) {
            $section.classList.remove("hidden");
        }
    }

    const onItemsLoad = ($itemPanel: HTMLElement) => {
        const $items = $itemPanel.querySelectorAll(".item");
        let time = 0;
        $items.forEach((item) => {
            setTimeout(() => {
                item.classList.remove("hidden");
            }, time);
            time += 10;
        });
    }

    const onItemDragStart = (name: string) => {
        wCtx.get().update({
            elementAPI: {
                config: null,
                originx: "",
                originy: "",
                state: 'undropped', 
                itemType: name
            }
        })
    }

    return (

        UltraComponent({

            component: `<section id="item-panel"></section>`,

            className: ['hidden'],

            children: [

                `<input 
                    type="file" 
                    id="fileInput" 
                    accept=".ptt" 
                    style="display: none;"
                />`,

                UltraComponent({

                    component: '<div></div>',

                    className: ['item-panel-elements'],

                    children: [
                        
                        //dynamicRoutingButton(),
                        
                        ...networkItems.map(panelItem => PanelItem({
                            name: panelItem.name,
                            image: panelItem.image,
                            draggable: panelItem.draggable,
                            tooltip: panelItem.tooltip,
                            onDragStart: () => onItemDragStart(panelItem.name)
                        })),

                        QuickPingTool(),
                        
                        PanelItem({
                            name: "traffic",
                            image: "./assets/panel/traffic.svg",
                            draggable: false,
                            tooltip: "Tráfico de Red",
                            onClick: () => {
                                const currentState = tmCtx.get().isVisible;
                                tmCtx.set({ 
                                    ...tmCtx.get(),
                                    isVisible: !currentState 
                                });
                            }
                        }),

                        PanelItem({
                            name: "settings",
                            image: "./assets/panel/settings.svg",
                            draggable: false,
                            tooltip: "Settings",
                            onClick: () => {
                                const currentState = smCtx.get().isVisible;
                                smCtx.set({ 
                                    ...smCtx.get(),
                                    isVisible: !currentState 
                                });
                            }
                        }),

                        PanelItem({
                            name: "note",
                            image: "./assets/panel/annotation.svg",
                            draggable: true,
                            tooltip: "Note",
                            onDragStart: () => onItemDragStart("note")
                        })

                    ],

                    trigger: [{ subscriber: subscribeIsLoaded, triggerFunction: onItemsLoad }]

                })

            ],
         
            trigger: [
                { subscriber: subscribeIsLoaded, triggerFunction: onLoad },
            ]

        })

    )
}