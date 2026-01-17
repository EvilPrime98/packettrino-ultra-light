import { UltraActivity, UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import BasicSection from "./basic-section";
import RoutingRulesSection from "./routing-rules-section";
import { dragModal } from "@/utils/dragModal";
import { ROUTER_MENU_CTX as rmCtx } from "@/context/modals";
import { IRoutingRule } from "@/types/TConfig";
import styles from './router-menu.module.css';

export interface IRouterMenuFields {
    ip: string;
    netmask: string;
}

type TPages = "basic" | "routing";

export function router_menu() {

    const [getIfaces, setIfaces, subscribeToIfaces] = ultraState<string[]>([]);
    const [getRoutingRules, setRoutingRules, subscribeToRoutingRules] = ultraState<IRoutingRule[]>([]);
    const [getPage, setPage, subscribeToPage] = ultraState<TPages>("basic");

    function onContextChange() {
        if (rmCtx.get().isVisible) {
            dataDumpHandler();
            window.addEventListener("keydown", onKeyDown);
        } else {
            dataCleanupHandler();
            window.removeEventListener("keydown", onKeyDown);
        }
    }

    function dataDumpHandler() {
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const ifaceIds = Object.keys(routerAPI.getIfaces());
        const currRules = routerAPI.routingRules();
        setIfaces(ifaceIds);
        setRoutingRules(currRules);
    }

    function dataCleanupHandler() {
        setIfaces([]);
        setRoutingRules([]);
    }

    function titleHandler(self: HTMLElement) {
        if (!rmCtx.get()?.isVisible) return;
        const elementId = rmCtx.get().routerElementAPI?.properties().elementId;
        if (!elementId) return;
        self.innerHTML = elementId;
    }

    function onClose() {
        dataCleanupHandler();
        rmCtx.set({
            ...rmCtx.get(),
            "isVisible": false
        })
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            onClose();
        }
    }

    function onRoutingRulesChange(){
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const currRules = structuredClone(routerAPI.routingRules());
        setRoutingRules(currRules);
    }

    return UltraActivity({

        component: UltraComponent({

            component: `<form class="${styles['router-form']} modal draggable-modal"></form>`,

            children: [

                UltraComponent({

                    component: `<div class="${styles['window-frame']}"></div>`,

                    children: [
                        UltraComponent({
                            component: `<p class="${styles['frame-title']}"></p>`,
                            trigger: [{ subscriber: rmCtx.subscribe, triggerFunction: titleHandler }]
                        })
                    ],

                    eventHandler: {
                        "mousedown": dragModal
                    }

                }),

                UltraComponent({

                    component: (`<div class="${styles['nav-panel']}"></div>`),

                    children: [

                        UltraComponent({
                            component: `<button class="btn-modern-blue selected">Basic</button>`,
                            eventHandler: { 'click': () => setPage('basic') },
                            trigger: [{
                                subscriber: subscribeToPage, triggerFunction: (self: UltraLightElement) => {
                                    self.classList.toggle("selected", getPage() === "basic");
                                }
                            }]
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