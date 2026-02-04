import { UltraComponent } from "@ultra-light";
import styles from "./pc-menu.module.css";
import { IUltraPcFields } from "./pc-menu";

export default function NetmaskField({ fields }: { fields: IUltraPcFields }) {

    function fieldsHandler(
        event: Event
    ){
        event.stopPropagation();
        const inputElement = event.target as HTMLInputElement;
        fields.set('netmask', inputElement.value);
    }

    const sync = (self: HTMLElement) => {
        if (!self || !(self instanceof HTMLInputElement)) return;
        if (self.value !== fields.get('netmask')) {
            self.value = fields.get('netmask');
        }
    }

    return (

        UltraComponent({

            component: `<div class="${styles['form-item']}"></div>`,

            children: [

                '<label for="netmask">Netmask:</label>',

                UltraComponent({
                    component: `<input type="text" id="netmask" name="netmask">`,
                    eventHandler: { 'input': fieldsHandler },
                    trigger: [
                        { 
                            subscriber: fields.subscribe('netmask'),
                            triggerFunction: sync 
                        }
                    ]
                })

            ],

        })
    )

}