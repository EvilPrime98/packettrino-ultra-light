import { UltraComponent } from "@ultra-light";
import { Props } from "./pc-menu-types";
export default function NetmaskField({ getFields, setFields, subscribeFields }: Props) {

    const fieldsHandler = (event: Event) => {
        //type guard
        event.stopPropagation();
        const inputElement = event.target;
        if (!inputElement || !(inputElement instanceof HTMLInputElement)) return;
        //update state
        setFields({
            ...getFields(),
            netmaskField: inputElement.value
        })
    }

    const sync = (self: HTMLElement) => {
        if (!self || !(self instanceof HTMLInputElement)) return;
        if (self.value !== getFields().netmaskField) self.value = getFields().netmaskField;
    }

    return (

        UltraComponent({

            component: `<div class="form-item"></div>`,

            children: [

                '<label for="netmask">Netmask:</label>',

                UltraComponent({
                    component: `<input type="text" id="netmask" name="netmask">`,
                    eventHandler: { 'input': fieldsHandler },
                    trigger: [
                        { subscriber: subscribeFields, triggerFunction: sync }
                    ]
                })

            ],

        })
    )

}