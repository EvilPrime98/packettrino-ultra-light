import { UltraComponent } from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/pc-menu-context";
import styles from "./pc-menu.module.css";
import { IUltraPcFields } from "./pc-menu";

export default function GatewayField({ fields }: { fields: IUltraPcFields}) {

    const { subscribe: subscribePcInfo } = pmCtx;

    const addGateway = (self: HTMLElement) => {
        if (!pmCtx.get()?.isVisible) return;
        const { pcElementAPI } = pmCtx.get();
        if (!pcElementAPI) return;
        const gateway = pcElementAPI.getDefaultGateway();
        const inputElement = self as HTMLInputElement;
        inputElement.value = gateway;
    }

    const fieldsHandler = (event: Event) => {
        event.stopPropagation();
        const inputElement = event.target as HTMLInputElement;
        const gateway = inputElement.value;
        fields.set('gateway', gateway);
    }
    
    return (

        UltraComponent({

            component: `<div class="${styles['form-item']}"></div>`,

            children: [

                '<label for="gateway">Gateway:</label>',

                UltraComponent({

                    component: `<input type="text" id="gateway" name="gateway">`,
                    
                    eventHandler: { 
                        'input': fieldsHandler 
                    },

                    trigger: [
                        { subscriber: subscribePcInfo, triggerFunction: addGateway }
                    ]

                })

            ],

        })
    )

}
