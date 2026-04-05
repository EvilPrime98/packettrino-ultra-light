import { UltraActivity, UltraComponent, ultraState } from "ultra-light.js";
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

        setArpTTL(ENV.$ARPENTRYTTL.get());

        setCheckBoxes({
            'dark-mode': ENV.darkMode.get(),
            'visual-toggle': ENV.visualToggle.get(),
            'ignore-arp-traffic': ENV.ignoreArpTraffic.get(),
            'ignore-layer2-traffic': ENV.ignoreLayer2Traffic.get()
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
        ENV.$ARPENTRYTTL.set(Number($input.value));
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
                        ENV.visualToggle.set((event.target as HTMLInputElement).checked);
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
                        ENV.ignoreArpTraffic.set((event.target as HTMLInputElement).checked);
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
                        ENV.ignoreLayer2Traffic.set((event.target as HTMLInputElement).checked);
                    }
                }),

                Option({
                    type: 'range',
                    range: {
                        min: ENV.$MINARPENTRYTTL.get(),
                        max: ENV.$MAXARPENTRYTTL.get(),
                        value: ENV.$ARPENTRYTTL.get()
                    },
                    id: "arp-ttl",
                    label: "ARP TTL",
                    onInput: onInputARPTTL,
                    children: [
                        UltraComponent({
                            component: `<span id="arp-ttl-value">${ENV.$ARPENTRYTTL.get()}s</span>`,
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