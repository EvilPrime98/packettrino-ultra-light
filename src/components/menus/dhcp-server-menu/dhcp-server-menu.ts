import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import type { UltraLightElement } from "@/ultra-light/types";
import MenuFrame from "@/components/menus/menu-frame";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import { BasicSection } from "./basic-section";
import { DhcpOptionsSection } from "./dhcp-options-section";
import styles from "./dhcp-server-menu.module.css";
import { ReservationsSection } from "./reservations-section";

const pages = {
    main: "main",
    reservations: "reservations"
} as const;

type TPages = typeof pages[keyof typeof pages];

export function Dhcp_Server_Menu() {

    const [
        getTitle,
        setTitle,
        subscribeToTitle
    ] = ultraState<string>("");

    const [
        getPage,
        setPage,
        subscribeToPage
    ] = ultraState<TPages>(pages.main);

    function onLoad(){
        if (!dsCtx.get().isVisible) return;
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        setTitle(serverAPI.properties().elementId);
    }

    function onClose() {
        cleanup();
        dsCtx.get().update({
            isVisible: false
        })
    }

    function cleanup() {
        setPage(pages.main);
        setTitle('');
    }

    function onSave() {
        console.log("saving");
    }

    return UltraActivity({

        mode: {
            state: () => dsCtx.get().isVisible,
            subscriber: dsCtx.subscribe
        },

        component: '<form></form>',

        className: [styles['dhcp-form'], 'modal', 'draggable-modal'],

        children: [

            MenuFrame({
                onClose,
                initTitle: 'DHCP Server',
                titleSubscriber: subscribeToTitle,
                getTitle: getTitle,
            }),

            UltraComponent({

                component: (`<div></div>`),

                className: [styles['nav-panel']],

                children: [

                    UltraComponent({
                        component: `<button type="button">Main</button>`,
                        className: ['btn-modern-blue', 'selected'],
                        eventHandler: { 'click': () => setPage(pages.main) },
                        trigger: [
                            {
                                subscriber: subscribeToPage,
                                triggerFunction: (self: UltraLightElement) => {
                                    self.classList.toggle(
                                        "selected",
                                        getPage() === pages.main
                                    );
                                }
                            }
                        ]
                    }),

                    UltraComponent({
                        component: `<button type="button">Reservations</button>`,
                        className: ['btn-modern-blue'],
                        eventHandler: { 'click': () => setPage(pages.reservations) },
                        trigger: [{
                            subscriber: subscribeToPage,
                            triggerFunction: (self: UltraLightElement) => {
                                self.classList.toggle(
                                    "selected",
                                    getPage() === pages.reservations
                                );
                            }
                        }]
                    })

                ]

            }),

            UltraActivity({

                mode: {
                    state: () => getPage() === pages.main,
                    subscriber: subscribeToPage
                },

                component: '<section></section>',
                className: [styles['main-section']],
                children: [
                    BasicSection(),
                    DhcpOptionsSection()
                ]

            }),

            UltraActivity({

                mode: {
                    state: () => getPage() === pages.reservations,
                    subscriber: subscribeToPage
                },

                component: ReservationsSection(),

            })

        ],

        eventHandler: {
            "submit": onSave
        },

        trigger: [
            { subscriber: dsCtx.subscribe, triggerFunction: onLoad }
        ]

    })

}