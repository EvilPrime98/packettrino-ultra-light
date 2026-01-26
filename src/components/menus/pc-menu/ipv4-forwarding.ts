import { UltraComponent } from "@ultra-light";
import styles from "./pc-menu.module.css";
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";

export default function Ipv4Forwarding(){

    function onStart(self: HTMLElement) {
        if (!pmCtx.get().isVisible) return;
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const $input = self as HTMLInputElement;
        $input.checked = elementAPI.properties()["ipv4-forwarding"];
    }

    function onChange(event: Event) {
        
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const $input = event.target as HTMLInputElement;
        
        try {

            elementAPI.editProperty(
                'ipv4-forwarding', 
                $input.checked
            );

            toCtx.get()
            .createNotification(
                `IPv4 Forwarding updated successfully!`,
                'success'
            )

        } catch (error: unknown) {

            const errorMessage = error instanceof Error 
            ? error.message 
            : 'Unknown error';

            toCtx.get()
            .createNotification(
                errorMessage,
                'error'
            )

        }

    }

    return UltraComponent({

        component: `<div class="${styles['form-item']}"></div>`,

        children: [

            '<label for="ipv4-forwarding">IPv4 Forwarding</label>',

            UltraComponent({

                component: (`
                    <input 
                        type="checkbox" 
                        id="ipv4-forwarding" 
                        name="ipv4-forwarding"
                        class="btn-toggle"
                    />
                `),

                eventHandler: {
                    'change': onChange
                },

                trigger: [{
                    subscriber: pmCtx.subscribe,
                    triggerFunction: onStart
                }]

            })

        ]

    })

}