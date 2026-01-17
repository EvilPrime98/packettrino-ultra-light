import { UltraComponent } from "@ultra-light";
import { TPanelItem } from "@/types/TPanel";

export default function PanelItem({ 
    name, 
    image, 
    draggable,
    onDragStart,
    onClick
}: TPanelItem) {

    return (

        UltraComponent({

            component:(`
                <article class="item hidden ${name}">
                    <img
                        src="${image}"
                        alt="${name}"
                        draggable="${draggable}"
                    />
                </article>
            `),

            eventHandler: {
                'dragstart': onDragStart,
                'click': onClick
                //{ eventType: 'mouseenter', eventCallback: `showTooltip("${panelItem.tooltip}", event)` },
                //{ eventType: 'mouseleave', eventCallback: `deleteTooltip(event)` }
            }

        })

    )

}