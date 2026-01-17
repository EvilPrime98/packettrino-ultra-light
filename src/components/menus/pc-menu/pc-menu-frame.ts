import { UltraComponent, UltraLightElement } from "@ultra-light";
import { dragModal } from "@/utils/dragModal";
import { PC_MENU_CTX as pmCtx } from "@context/modals";
import CrossIcon from "@/components/icons/cross-icon";
import styles from "./pc-menu.module.css";

export default function PcMenuFrame({ 
    onClose 
}: { 
    onClose: () => void 
}) {

    const onTitleChange = (self: UltraLightElement) => {
        const menuData = pmCtx.get();
        if (!menuData?.isVisible) return;
        const { pcElementAPI: propertiesHandler } = menuData;
        if (!propertiesHandler) return;
        self.innerHTML = propertiesHandler.properties().elementId;
    }

    return (

        UltraComponent({

            component: `<div class="${styles['window-frame']}"></div>`,

            children: [

                UltraComponent({
                    component: '<p></p>',
                    trigger: [{
                        subscriber: pmCtx.subscribe,
                        triggerFunction: onTitleChange
                    }]
                }),

                UltraComponent({

                    component: CrossIcon({
                        size: 30,
                        color: "red",
                        className: "close-icon"
                    }),

                    eventHandler: { "click": onClose }
                    
                })

            ],

            eventHandler: { "mousedown": dragModal },

        })

    )

}