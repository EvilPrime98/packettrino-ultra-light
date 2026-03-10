import { UltraActivity, UltraComponent, UltraLightElement, ultraState } from "ultra-light.js";
import BasicSection from "./basic-section";
import RoutingRulesSection from "./routing-rules-section";
import { ROUTER_MENU_CTX as rmCtx } from "@/context/router-menu-context";
import { IRoutingRule } from "@/types/TConfig";
import styles from './router-menu.module.css';
import MenuFrame from "../menu-frame";

type TPages = "basic" | "routing";

export function RouterMenu() {

    const [ getIfaces, setIfaces, subscribeToIfaces ] = ultraState<string[]>([]);
    const [ getRoutingRules, setRoutingRules, subscribeToRoutingRules] = ultraState<IRoutingRule[]>([]);
    const [ getPage, setPage, subscribeToPage ] = ultraState<TPages>("basic");
    const [ getTitle, setTitle, subscribeToTitle ] = ultraState<string>("");
    const [ getEventCleanup, setEventCleanup, ] = ultraState<(() => void) | null>(null);

    /**
     * Executes when the router menu context changes. It checks if the 
     * context is visible and if it is, it loads the data from the router element
     * API into the state variables.
     * @returns
     */
    function onContextChange(
        self: UltraLightElement
    ) {
        if (rmCtx.get().isVisible) {
            onLoad();
        } else {
            onCleanup(self);
        }
    }

    /**
     * Dumps all the data from the router element API into the state variables
     * @returns 
     */
    function onLoad() {
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        onLoadIfaces();
        onLoadRoutingRules();
        setTitle(routerAPI.properties().elementId);
        setEventCleanup(onEvents());
    }

    /**
     * Dumps the iface information from the router element API 
     * into the state variables.
     * @returns 
     */
    function onLoadIfaces(){
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const ifaceIds = Object.keys(routerAPI.getIfaces());
        setIfaces(ifaceIds);
    }

    /**
     * Dumps the routing rule information from the router element API 
     * into the state variables.
     * @returns 
     */
    function onLoadRoutingRules(){
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const currRules = routerAPI.routingRules();
        setRoutingRules(currRules);
    }

    /**
     * Executes when the router menu is closed. It cleans up the
     * event listeners and sets the state variables to their initial values.
     * @param self - HTML Form element
     * @returns
     */
    function onCleanup(
        self: HTMLElement
    ) {
        (self as HTMLFormElement).reset();
        setPage('basic');
        setIfaces([]);
        setRoutingRules([]);
        setTitle('');
        getEventCleanup()?.();
        setEventCleanup(null);
    }

    /**
     * This function closes the router menu and cleans up the state variables.
     * @returns
     */
    function onClose() {
        rmCtx.set({
            ...rmCtx.get(),
            "isVisible": false
        })
    }

    /**
     * This function manages the global event listeners for the router menu.
     * @returns
     */
    function onEvents() {

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        }

    }   

    return UltraActivity({

        mode: {
            state: () => rmCtx.get().isVisible,
            subscriber: rmCtx.subscribe
        },

        component: UltraComponent({

            component: `<form></form>`,

            className: [
                styles['router-form'],
                'modal',
                'draggable-modal'
            ],

            children: [

                MenuFrame({
                    initTitle: '',
                    onClose,
                    getTitle,
                    titleSubscriber: subscribeToTitle
                }),

                //nav panel
                UltraComponent({

                    component: (`<div></div>`),

                    className: [styles['nav-panel']],

                    children: [

                        UltraComponent({
                            component: `<button>Basic</button>`,
                            className: ['btn-modern-blue','selected'],
                            eventHandler: { 'click': () => setPage('basic') },
                            trigger: [
                                {
                                    subscriber: subscribeToPage,
                                    triggerFunction: (self: UltraLightElement) => {
                                        self.classList.toggle(
                                            "selected", 
                                            getPage() === "basic"
                                        );
                                    }
                                }
                            ]
                        }),

                        UltraComponent({
                            component: `<button>Routing Rules</button>`,
                            className: ['btn-modern-blue'],
                            eventHandler: { 'click': () => setPage('routing') },
                            trigger: [{
                                subscriber: subscribeToPage, 
                                triggerFunction: (self: UltraLightElement) => {
                                    self.classList.toggle(
                                        "selected", 
                                        getPage() === "routing"
                                    );
                                }
                            }]
                        })

                    ]

                }),

                //basic section
                UltraActivity({

                    component: BasicSection({
                        onRoutingRulesChange: onLoadRoutingRules,
                        getIfaces,
                        subscribeToIfaces,
                        refreshIfaces: onLoadIfaces
                    }),

                    mode: {
                        state: () => getPage() === "basic",
                        subscriber: subscribeToPage
                    }

                }),

                //routing rules section
                UltraActivity({

                    component: RoutingRulesSection({
                        onRoutingRulesChange: onLoadRoutingRules,
                        getRoutingRules,
                        subscribeToRoutingRules,
                    }),

                    mode: {
                        state: () => getPage() === "routing",
                        subscriber: subscribeToPage
                    }

                })

            ],

            eventHandler: {
                "click": (event: Event) => event.preventDefault()
            }

        }),

        trigger: [
            { 
                subscriber: rmCtx.subscribe, 
                triggerFunction: onContextChange 
            }
        ]

    })

}