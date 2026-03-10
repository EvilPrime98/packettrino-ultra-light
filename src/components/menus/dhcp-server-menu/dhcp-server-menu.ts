import { UltraActivity, UltraComponent, ultraState } from "ultra-light.js";
import type { UltraLightElement } from "ultra-light.js";
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

    //state for the frame title
    const [ getTitle, setTitle, subscribeToTitle ] = ultraState<string>("");
    //state for the current page
    const [ getPage, setPage, subscribeToPage ] = ultraState<TPages>(pages.main);
    //state for the global events cleanup
    const [ getEventCleanup, setEventCleanup,  ] = ultraState<(() => void)>(() => {});

    /**
     * This function is executed when the DHCP-Server-Menu-Context 
     * visibility changes.
     * @param $form 
     * @returns 
     */
    function onLoad(
        $form: UltraLightElement
    ) {
        if (!dsCtx.get().isVisible) {
            onCleanup($form);
            return;
        }
        setEventCleanup(onGlobalEvents());
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        setTitle(serverAPI.properties().elementId);
    }

    function onClose() {
        dsCtx.get().update({
            isVisible: false
        })
    }

    function onCleanup(
        $form: UltraLightElement
    ) {
        ($form as HTMLFormElement).reset();
        setPage(pages.main);
        setTitle('');
        getEventCleanup()();
    }
    
    /**
     * This function adds event listeners to the global window object.
     * @returns A function that removes the event listeners.
     */
    function onGlobalEvents() {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
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

            //navigation panel
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

            //main section
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

            //reservations section
            UltraActivity({

                mode: {
                    state: () => getPage() === pages.reservations,
                    subscriber: subscribeToPage
                },

                component: ReservationsSection(),

            })

        ],

        trigger: [
            { subscriber: dsCtx.subscribe, triggerFunction: onLoad }
        ]

    })

}