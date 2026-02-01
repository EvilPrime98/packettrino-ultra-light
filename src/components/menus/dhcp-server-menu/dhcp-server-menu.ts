import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import type { UltraLightElement } from "@/ultra-light/types";
import MenuFrame from "@/components/menus/menu-frame";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import { DhcpOptionsSection } from "./dhcp-options-section";
import styles from "./dhcp-server-menu.module.css";
import { ReservationsSection } from "./reservations-section";
import { MenuTab } from "./tab";

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

    function onLoad($form: UltraLightElement) {
        if (!dsCtx.get().isVisible) {
            cleanup($form);
            return;
        }
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        setTitle(serverAPI.properties().elementId);
    }

    function onClose() {
        dsCtx.get().update({
            isVisible: false
        })
    }

    function cleanup($form: UltraLightElement) {
        ($form as HTMLFormElement).reset();
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

                    MenuTab({
                        pageId: pages.main,
                        selectedClass: 'selected',
                        onClick: () => setPage(pages.main),
                        pageSubscriber: subscribeToPage,
                        getCurrentPage: getPage
                    }),

                    MenuTab({
                        pageId: pages.reservations,
                        selectedClass: 'selected',
                        onClick: () => setPage(pages.reservations),
                        pageSubscriber: subscribeToPage,
                        getCurrentPage: getPage
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