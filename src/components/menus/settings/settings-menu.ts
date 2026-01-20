import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import { SETTINGS_MENU_CTX as smCtx } from "@/context/settings-context";
import { ENV } from "@/context/env-context";
import styles from "./settings.module.css";
import MenuFrame from "@/components/menus/menu-frame";
import Option from "./option";

export default function SettingsMenu() {

    const [
        getCheckBoxes,
        setCheckBoxes,
        subscribeCheckBoxes
    ] = ultraState({
        'dark-mode': false,
        'visual-toggle': false,
        'ignore-arp-traffic': false,
        'ignore-layer2-traffic': false
    });

    const [
        arpTTL,
        setArpTTL,
        subcribeToArpTTL
    ] = ultraState(0);

    function onStart() {

        if (!smCtx.get().isVisible) return;

        setArpTTL(ENV.get().$ARPENTRYTTL);

        setCheckBoxes({
            'dark-mode': ENV.get().darkMode,
            'visual-toggle': ENV.get().visualToggle,
            'ignore-arp-traffic': ENV.get().ignoreArpTraffic,
            'ignore-layer2-traffic': ENV.get().ignoreLayer2Traffic
        })

    }

    function onCleanup() {

        setCheckBoxes({
            'dark-mode': false,
            'visual-toggle': false,
            'ignore-arp-traffic': false,
            'ignore-layer2-traffic': false
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

                Option({
                    type: 'checkbox',
                    id: "visual-toggle",
                    label: "Visual Mode",
                    triggers: [{
                        subscriber: subscribeCheckBoxes,
                        triggerFunction: (self: HTMLElement) => {
                            (self as HTMLInputElement).checked = getCheckBoxes()['visual-toggle'];
                        }
                    }],
                    onChange: (event: Event) => {
                        ENV.set({
                            ...ENV.get(),
                            visualToggle: (event.target as HTMLInputElement).checked
                        })
                    }
                }),

                Option({
                    type: 'checkbox',
                    id: "ignore-arp-traffic",
                    label: "Hide ARP Traffic",
                    triggers: [{
                        subscriber: subscribeCheckBoxes,
                        triggerFunction: (self: HTMLElement) => {
                            (self as HTMLInputElement).checked = getCheckBoxes()['ignore-arp-traffic'];
                        }
                    }],
                    onChange: (event: Event) => {
                        ENV.set({
                            ...ENV.get(),
                            ignoreArpTraffic: (event.target as HTMLInputElement).checked
                        })
                    }
                }),

                Option({
                    type: 'checkbox',
                    id: "ignore-layer2-traffic",
                    label: "Hide Layer 2 Traffic",
                    triggers: [{
                        subscriber: subscribeCheckBoxes,
                        triggerFunction: (self: HTMLElement) => {
                            (self as HTMLInputElement).checked = getCheckBoxes()['ignore-layer2-traffic'];
                        }
                    }],
                    onChange: (event: Event) => {
                        ENV.set({
                            ...ENV.get(),
                            ignoreLayer2Traffic: (event.target as HTMLInputElement).checked
                        })
                    }
                }),

                Option({
                    type: 'range',
                    range: {
                        min: ENV.get().$MINARPENTRYTTL,
                        max: ENV.get().$MAXARPENTRYTTL,
                        value: ENV.get().$ARPENTRYTTL
                    },
                    id: "arp-ttl",
                    label: "ARP TTL",
                    onInput: onInputARPTTL,
                    children: [
                        UltraComponent({
                            component: `<span id="arp-ttl-value">${ENV.get().$ARPENTRYTTL}s</span>`,
                            trigger: [{ subscriber: subcribeToArpTTL, triggerFunction: onChangeARPTTL }]
                        })
                    ]
                }),

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