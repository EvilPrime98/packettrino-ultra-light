import { UltraComponent } from "@ultra-light";
import { PcMenuFields } from "@/types/types";

type Props = {
    getFields: () => PcMenuFields;
    setFields: (newValue: PcMenuFields) => void;
    subscribeFields: (fn: (value: PcMenuFields) => void) => () => void;
}

export function DhcpMode({ getFields, setFields, subscribeFields }: Props) {
    
    const sync = (self: HTMLElement) => {
        //update state
        if (!self || !(self instanceof HTMLInputElement)) return;
        self.checked = getFields().dhcpField;
    }

    const clickHandler = (event: Event) => {
        //type guard
        event.stopPropagation();
        const dhcpToggle = event.target;
        if (!dhcpToggle || !(dhcpToggle instanceof HTMLInputElement)) return;
        //update state
        setFields({
            ...getFields(),
            dhcpField: dhcpToggle.checked
        })
    }

    return(

        UltraComponent({
            
            component: `<div class="form-item" id="dhcp-mode"></div>`,
            
            children: [

                `<label for="dhcp-toggle"> Modo DHCP: </label>`,

                UltraComponent({
                    component: `<input class="btn-toggle" type="checkbox" id="dhcp-toggle" name="dhcp-toggle">`,
                    trigger: [{ subscriber: subscribeFields, triggerFunction: sync }]
                })  

            ],

            eventHandler: { 
                'click': clickHandler
            }

        })

    )

}

export function WebServerMode() {

    return(

        UltraComponent({
            
            component: `<div class="form-item" id="web-server-mode"></div>`,
            
            children: [

                `<label for="web-server-toggle"> Servidor Web: </label>`,

                UltraComponent({
                    component: `<input class="btn-toggle" type="checkbox" id="web-server-toggle" name="web-server-toggle">`
                })  

            ],
        })

    )

}