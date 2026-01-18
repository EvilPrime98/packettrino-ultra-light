import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import { SETTINGS_MENU_CTX  as smCtx } from "@/context/settings-context";
import { ENV } from "@/context/env-context";
import styles from "./settings.module.css";
import MenuFrame from "@/components/menus/menu-frame";

export default function SettingsMenu() {

    const [
        getCheckBoxes,
        setCheckBoxes,
        subscribeCheckBoxes
    ] = ultraState({
        'dark-mode': false,
        'visual-toggle': false,
        'ignore-arp-traffic': false
    });

    const [
        arpTTL, 
        setArpTTL, 
        subcribeToArpTTL
    ] = ultraState(0);

    function onStart(){

        if (!smCtx.get().isVisible) return;

        setArpTTL(ENV.get().$ARPENTRYTTL);

        setCheckBoxes({
            'dark-mode': ENV.get().darkMode,
            'visual-toggle': ENV.get().visualToggle,
            'ignore-arp-traffic': ENV.get().ignoreArpTraffic
        })

    }

    function onCleanup() {

        setCheckBoxes({
            'dark-mode': false,
            'visual-toggle': false,
            'ignore-arp-traffic': false
        })

        setArpTTL(0);

    }

    function onInputARPTTL(event: Event) {
        const $input = event.target as HTMLInputElement;
        setArpTTL(Number($input.value));
        ENV.set({
            ...ENV.get(),
            $ARPENTRYTTL: Number($input.value)
        })
    }

    function onChangeARPTTL(self: HTMLElement) {
        const $span = self as HTMLSpanElement;
        $span.innerHTML = `${arpTTL()}s`;
    }

    function onClose() {
        onCleanup();
        smCtx.set({
            ...smCtx.get(),
            isVisible: false
        })
    }
    
    return UltraActivity({
        
        component: UltraComponent({

            component: `<form class="modal draggable-modal ${styles['settings-modal']}"></form>`,

            children: [

                MenuFrame({
                    onClose,
                    initTitle: "General Settings",
                }),

                UltraComponent({

                    component: `<div class="${styles['options-group']}"></div>`,

                    children: [
                        
                        '<label for="dark-mode"> Dark Mode </label>',

                        UltraComponent({
                            
                            component: (`
                                <input 
                                    type="checkbox" 
                                    class="btn-toggle"
                                    id="dark-mode" 
                                    name="dark-mode"
                                />
                            `),

                            trigger: [{ 
                                subscriber: subscribeCheckBoxes,
                                triggerFunction: (self: HTMLElement) => {
                                    (self as HTMLInputElement).checked = getCheckBoxes()['dark-mode'];
                                }
                            }]

                        })

                    ]

                }),

                UltraComponent({

                    component: `<div class="${styles['options-group']}"></div>`,

                    children: [
                        
                        '<label for="visual-toggle"> Visual Mode </label>',

                        UltraComponent({
                            
                            component: (`
                                <input 
                                    type="checkbox" 
                                    class="btn-toggle" 
                                    id="visual-toggle" 
                                    name="visual-toggle"
                                />
                            `),

                            trigger: [{ 
                                subscriber: subscribeCheckBoxes,
                                triggerFunction: (self: HTMLElement) => {
                                    (self as HTMLInputElement).checked = getCheckBoxes()['visual-toggle'];
                                }
                            }],

                            eventHandler: {
                                change: function () {
                                    ENV.get().visualToggle = (this as HTMLInputElement).checked;
                                }
                            }

                        })

                    ]

                }),

                UltraComponent({
                    
                    component: `<div class="${styles['options-group']}"></div>`,
                    
                    children: [
                        
                        '<label for="ignore-arp-traffic"> Hide ARP Traffic </label>',
                        
                        UltraComponent({
                            
                            component: (`
                                <input 
                                    type="checkbox" 
                                    class="btn-toggle" 
                                    id="ignore-arp-traffic" 
                                    name="ignore-arp-traffic"
                                />
                            `),

                            eventHandler: { change: function () {
                                ENV.get().ignoreArpTraffic = (this as HTMLInputElement).checked;
                            }},
                            
                            trigger: [{ 
                                subscriber: subscribeCheckBoxes,
                                triggerFunction: (self: HTMLElement) => {
                                    (self as HTMLInputElement).checked = getCheckBoxes()['ignore-arp-traffic'];
                                }
                            }]
                            
                        })

                    ]

                }),

                UltraComponent({

                    component: `<div class="${styles['options-group']}"></div>`,

                    children: [
                        
                        '<label for="arp-ttl"> ARP TTL </label>',

                        UltraComponent({

                            component: (`
                                <input 
                                    type="range" 
                                    class="btn-input" 
                                    id="arp-ttl" 
                                    name="arp-ttl" 
                                    min="${ENV.get().$MINARPENTRYTTL}"
                                    max="${ENV.get().$MAXARPENTRYTTL}"
                                    value="${ENV.get().$ARPENTRYTTL}"
                                />
                            `),

                            eventHandler: { 
                                'input': onInputARPTTL 
                            },

                        }),

                        UltraComponent({
                            component: `<span id="arp-ttl-value">${ENV.get().$ARPENTRYTTL}s</span>`,
                            trigger:[{ subscriber: subcribeToArpTTL, triggerFunction: onChangeARPTTL }]
                        })

                    ]

                })

            ]

        }),

        mode: {
            state: () => smCtx.get().isVisible,
            subscriber: smCtx.subscribe
        },

        trigger: [{
            subscriber: smCtx.subscribe,
            triggerFunction: onStart
        }]

    })

}