import { UltraActivity, UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import BasicSection from "./basic-section";
import RoutingRulesSection from "./routing-rules-section";
import { ROUTER_MENU_CTX as rmCtx } from "@/context/modals";
import { IRoutingRule } from "@/types/TConfig";
import styles from './router-menu.module.css';
import MenuFrame from "../menu-frame";

export interface IRouterMenuFields {
    ip: string;
    netmask: string;
}

type TPages = "basic" | "routing";

export function router_menu() {

    const [getIfaces, setIfaces, subscribeToIfaces] = ultraState<string[]>([]);
    const [getRoutingRules, setRoutingRules, subscribeToRoutingRules] = ultraState<IRoutingRule[]>([]);
    const [getPage, setPage, subscribeToPage] = ultraState<TPages>("basic");
    const [getTitle, setTitle, subscribeToTitle] = ultraState<string>("");
    const [getEventCleanup, setEventCleanup] = ultraState<(() => void) | null>(null);

    function onContextChange() {
        if (rmCtx.get().isVisible) {
            onLoad();
        } else {
            onCleanup();
        }
    }

    function onLoad() {
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const ifaceIds = Object.keys(routerAPI.getIfaces());
        const currRules = routerAPI.routingRules();
        setIfaces(ifaceIds);
        setRoutingRules(currRules);
        setTitle(routerAPI.properties().elementId);
        setEventCleanup(onEvents());
    }

    function onCleanup() {
        setIfaces([]);
        setRoutingRules([]);
        setTitle('');
        getEventCleanup()?.();
        setEventCleanup(null);
    }

    function onClose() {
        onCleanup();
        rmCtx.set({
            ...rmCtx.get(),
            "isVisible": false
        })
    }

    function onRoutingRulesChange() {
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const currRules = structuredClone(routerAPI.routingRules());
        setRoutingRules(currRules);
    }

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

        component: UltraComponent({

            component: `<form class="${styles['router-form']} modal draggable-modal"></form>`,

            children: [

                MenuFrame({
                    initTitle: '',
                    onClose,
                    getTitle,
                    titleSubscriber: subscribeToTitle
                }),

                UltraComponent({

                    component: (`<div class="${styles['nav-panel']}"></div>`),

                    children: [

                        UltraComponent({
                            component: `<button class="btn-modern-blue selected">Basic</button>`,
                            eventHandler: { 'click': () => setPage('basic') },
                            trigger: [
                                {
                                    subscriber: subscribeToPage,
                                    triggerFunction: (self: UltraLightElement) => {
                                        self.classList.toggle("selected", getPage() === "basic");
                                    }
                                }
                            ]
                        }),

                        UltraComponent({
                            component: `<button class="btn-modern-blue">Routing Rules</button>`,
                            eventHandler: { 'click': () => setPage('routing') },
                            trigger: [{
                                subscriber: subscribeToPage, triggerFunction: (self: UltraLightElement) => {
                                    self.classList.toggle("selected", getPage() === "routing");
                                }
                            }]
                        })

                    ]

                }),

                UltraActivity({

                    component: BasicSection({
                        onRoutingRulesChange,
                        getIfaces,
                        subscribeToIfaces,
                    }),

                    mode: {
                        state: () => getPage() === "basic",
                        subscriber: subscribeToPage
                    }

                }),

                UltraActivity({

                    component: RoutingRulesSection({
                        onRoutingRulesChange,
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

        mode: {
            state: () => rmCtx.get().isVisible,
            subscriber: rmCtx.subscribe
        },

        trigger: [
            { subscriber: rmCtx.subscribe, triggerFunction: onContextChange }
        ]

    })

}