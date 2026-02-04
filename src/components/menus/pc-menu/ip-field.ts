import { UltraComponent } from "@ultra-light";
import styles from "./pc-menu.module.css";
import { IUltraPcFields } from "./pc-menu";

export default function IpField({ fields }: { fields: IUltraPcFields }) {

    function updateFields(event: Event){
        event.stopPropagation();
        const $input = event.target as HTMLInputElement;
        fields.set('ip', $input.value);
    }

    function sync(self: HTMLElement){
        const $input = self as HTMLInputElement;
        if ($input.value !== fields.get('ip')) {
            $input.value = fields.get('ip');
        }
    }
    
    return (

        UltraComponent({

            component: `<div class="${styles['form-item']}"></div>`,

            children: [

                '<label for="ip">IP:</label>',

                UltraComponent({
                    component: `<input type="text" id="ip" name="ip">`,
                    eventHandler: { 'input': updateFields },
                    trigger: [
                        { 
                            subscriber: fields.subscribe('ip'),
                            triggerFunction: sync 
                        }
                    ]                    
                })

            ]

        })

    )

}