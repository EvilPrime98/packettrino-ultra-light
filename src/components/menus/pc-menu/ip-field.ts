import { UltraComponent } from "@ultra-light";
import { Props } from "./pc-menu-types";

export default function IpField({ getFields, setFields, subscribeFields }: Props) {

    const updateFields = (event: Event) => {
        //type guard
        event.stopPropagation();
        const inputElement = event.target;
        if (!inputElement || !(inputElement instanceof HTMLInputElement)) return;
        //update state
        setFields({
            ...getFields(),
            ipField: inputElement.value
        })
    }

    const sync = (self: HTMLElement) => {
        if (!self || !(self instanceof HTMLInputElement)) return;
        if (self.value !== getFields().ipField) self.value = getFields().ipField;     
    }
    
    return (

        UltraComponent({

            component: `<div class="form-item"></div>`,

            children: [

                '<label for="ip">IP:</label>',

                UltraComponent({
                    component: `<input type="text" id="ip" name="ip">`,
                    eventHandler: { 'input': updateFields },
                    trigger: [
                        { subscriber: subscribeFields, triggerFunction: sync }
                    ]                    
                })

            ]

        })

    )

}