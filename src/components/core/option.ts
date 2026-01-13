import { AdvancedOption } from "@/types/types";
import { UltraComponent } from "@ultra-light";

export function Option({ message, callback }: AdvancedOption) {

    const clickHandler = (event: Event) => {
        event.stopPropagation();
        callback(event);
    }

    return (
        UltraComponent({
            component: `<button>${message}</button>`,
            eventHandler: {
                'click': clickHandler
            }
        })
    )

}