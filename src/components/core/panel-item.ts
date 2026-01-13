import { UltraComponent } from "@ultra-light";
import { WORK_SPACE_CONTEXT } from "./work-space";
import { TPanelItem } from "@/types/TPanel";

export default function PanelItem({ name, image, draggable }: TPanelItem) {

    const dragStartHandler = () => {

        const { set, get } = WORK_SPACE_CONTEXT;

        set({
            ...get(),
            elementAPI: {
                config: null,
                originx: "",
                originy: "",
                state: 'undropped', 
                itemType: name
            }
        })

    }

    return (
        UltraComponent({
            component: `
            <article class="item hidden ${name}">
                <img
                    src="${image}"
                    alt="${name}"
                    draggable="${draggable}"
                />
            </article>`,

            eventHandler: {
                'dragstart': dragStartHandler
                //{ eventType: 'mouseenter', eventCallback: `showTooltip("${panelItem.tooltip}", event)` },
                //{ eventType: 'mouseleave', eventCallback: `deleteTooltip(event)` }
            }
        })
    )

}