import { AdvancedOption } from "@/types/types";
import { UltraComponent } from "@ultra-light";
import CrossIcon from "@/components/icons/cross-icon";
import styles from "./adv-options.module.css";

export function Option(
    { message, callback, id }: AdvancedOption,
    deleteOption: (id: string) => void
) {

    const clickHandler = (event: Event) => {
        event.stopPropagation();
        callback(event);
    }

    const iconClickHandler = (event: Event) => {
        event.stopPropagation();
        deleteOption(id);
    }

    return UltraComponent({

        component: '<button></button>',

        children: [
            
            `<span>${message}</span>`,

            UltraComponent({
                component: CrossIcon({ size: 20, className: styles['delete-icon'] }),
                eventHandler: {
                    click: iconClickHandler
                }
            })

        ],

        eventHandler: {
            'click': clickHandler
        }

    })

}