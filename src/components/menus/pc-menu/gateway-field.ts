import { UltraComponent } from "@ultra-light";
import { Props } from "./pc-menu-types";
import { PC_MENU_CTX as pmCtx } from "@context/modals";

export default function GatewayField({ 
    getFields, 
    setFields 
}: Props) {

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
        setFields({
            ...getFields(),
            gatewayField: gateway
        })
    }
    
    return (

        UltraComponent({

            component: `<div class="form-item"></div>`,

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
