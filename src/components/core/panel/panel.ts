import { UltraComponent, ultraState } from "@ultra-light";
//import { dynamicRoutingButton } from "./dynamic-routing-item";
import PanelItem from "./panel-item";
import { TPanelItem } from "@/types/TPanel";
import QuickPingTool from "./quick-ping";
import { TRACER_MENU_CTX as tmCtx } from "@/context/tracer-context";
import { WORK_SPACE_CONTEXT as wCtx } from "@/context/workspace-context";
import { SETTINGS_MENU_CTX as smCtx } from "@/context/settings-context";

// const panelItems: TPanelItem[] = [
//     // {
//     //     "name": "upload",
//     //     "image": "./assets/panel/upload.svg",
//     //     "draggable": false,
//     //     "tooltip": "Subir Archivo de Red"
//     // },
//     // {
//     //     "name": "load",
//     //     "image": "./assets/panel/load.svg",
//     //     "draggable": false,
//     //     "tooltip": "Cargar archivo"
//     // },
//     // {
//     //     "name": "download",
//     //     "image": "./assets/panel/download.svg",
//     //     "draggable": false,
//     //     "tooltip": "Descargar Archivo de Red"
//     // },
//     // {
//     //     "name": "text",
//     //     "image": "./assets/panel/annotation.svg",
//     //     "draggable": true,
//     //     "tooltip": "Anotación"
//     // },
//     {
//         "name": "traffic",
//         "image": "./assets/panel/traffic.svg",
//         "draggable": false,
//         "tooltip": "Tráfico de Red"
//     }
//     // {
//     //     "name": "ping",
//     //     "image": "./assets/panel/bus.svg",
//     //     "draggable": false,
//     //     "tooltip": "Simulador de Ping"
//     // },
//     // {
//     //     "name": "animation-controls",
//     //     "image": "./assets/panel/animationControls.svg",
//     //     "draggable": false,
//     //     "tooltip": "Controles de Animación"
//     // },
//     // {
//     //     "name": "settings",
//     //     "image": "./assets/panel/settings.svg",
//     //     "draggable": false,
//     //     "tooltip": "Opciones Avanzadas"
//     // },
//     // {
//     //     "name": "hide-panel",
//     //     "image": "./assets/panel/hide-panel.svg",
//     //     "draggable": false,
//     //     "tooltip": "Ocultar el panel"
//     // }
// ]

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
    }
    // {
    //     "name": "dhcpserver",
    //     "image": "./assets/panel/dhcpserver.svg",
    //     "draggable": true,
    //     "tooltip": "Servidor DHCP"
    // },
    // {
    //     "name": "dhcprelay",
    //     "image": "./assets/panel/dhcprelay.svg",
    //     "draggable": true,
    //     "tooltip": "Agente DHCP"
    // },
    // {
    //     "name": "dnsserver",
    //     "image": "./assets/panel/dnsserver.svg",
    //     "draggable": true,
    //     "tooltip": "Servidor DNS"
    // },
    // {
    //     "name": "isc-dhcp-server",
    //     "image": "./assets/panel/isc-dhcp-server.svg",
    //     "draggable": true,
    //     "tooltip": "isc-dhcp-server"
    // },
    // {
    //     "name": "isc-dhcp-client",
    //     "image": "./assets/panel/isc-dhcp-client.svg",
    //     "draggable": true,
    //     "tooltip": "isc-dhcp-client"
    // },
    // {
    //     "name": "isc-dhcp-relay",
    //     "image": "./assets/panel/isc-dhcp-relay.svg",
    //     "draggable": true,
    //     "tooltip": "isc-dhcp-relay"
    // },
    // {
    //     "name": "bind9",
    //     "image": "./assets/panel/bind9.svg",
    //     "draggable": true,
    //     "tooltip": "bind9"
    // },
    // {
    //     "name": "apache2",
    //     "image": "./assets/panel/apache2.svg",
    //     "draggable": true,
    //     "tooltip": "apache2"
    // }
]

type Props = {
    isLoaded: () => boolean;
    subscribeIsLoaded: (fn: (value: boolean) => void) => () => void;
}

export default function Panel({ isLoaded, subscribeIsLoaded }: Props) {

    const [panelVisible, setPanelVisible, subscribePanelVisible] = ultraState(false);

    const panelLoader = (self: HTMLElement) => {
        if (isLoaded()) {
            self.classList.remove("hidden");
        }
    }

    const itemsLoader = (self: HTMLElement) => {
        const $items = self.querySelectorAll(".item");
        let time = 0;
        $items.forEach((item) => {
            setTimeout(() => {
                item.classList.remove("hidden");
            }, time);
            time += 10;
        });
    }

    const visibilityHandler = (event: Event) => {
        const element = event.target as HTMLElement;
        const item = element.closest(".item");
        if (item && item.classList.contains("hide-panel")) {
            setPanelVisible(!panelVisible());
        }
    }

    const visibilityTrigger = (self: HTMLElement) => {
        const $items = Array.from(self.querySelectorAll(".item"));
        const $itemsToHide = $items.filter(item => !item.classList.contains("hide-panel"));
        $itemsToHide.forEach((item) => {
            item.classList.toggle("hidden", panelVisible());
        });
    }

    const onItemDragStart = (name: string) => {
        wCtx.set({
            ...wCtx.get(),
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

            component: `<section id="item-panel" class="hidden"></section>`,

            children: [

                '<input type="file" id="fileInput" accept=".ptt" style="display: none;">',

                UltraComponent({

                    component: `<div class="item-panel-elements"></div>`,

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
                        })

                    ],

                    trigger: [{ subscriber: subscribeIsLoaded, triggerFunction: itemsLoader }]

                })

            ],

            eventHandler: { 
                'click': visibilityHandler
            },
            
            trigger: [
                { subscriber: subscribeIsLoaded, triggerFunction: panelLoader },
                { subscriber: subscribePanelVisible, triggerFunction: visibilityTrigger }
            ]

        })

    )
}