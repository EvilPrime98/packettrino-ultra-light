import { UltraComponent, UltraLightElement } from "@ultra-light";
import { dragModal } from "@/utils/dragModal";
import CrossIcon from "@/components/icons/cross-icon";
import styles from './menu-frame.module.css';

type MenuFrameProps = {
    /**
     * Function to be called when the close button is clicked.
     * @returns 
     */
    onClose: () => void;
    /**
     * Initial title of the menu.
     */
    initTitle: string;
    /**
     * Optional function to get the current title of the menu. Must also
     * provide a titleSubscriber function.
     * @returns 
     */
    getTitle?: () => string;
    /**
     * Optional function to subscribe to changes in the title of the menu.
     * Must also provide a getTitle function.
     * @param fn 
     * @returns 
     */
    titleSubscriber?: (fn: (title: string) => void) => () => void;
}

export default function MenuFrame({
    onClose,
    initTitle,
    getTitle,
    titleSubscriber
}: MenuFrameProps) {

    if (!titleSubscriber || !getTitle) {

        return UltraComponent({

            component: `<div class="${styles['window-frame']}"></div>`,

            children: [

                UltraComponent({
                    component: `<p>${initTitle}</p>`,
                }),

                UltraComponent({

                    component: CrossIcon({
                        size: 30,
                        color: "red",
                        className: "close-icon"
                    }),

                    eventHandler: {
                        
                        "click": (event: Event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            onClose();
                        },

                        "mousedown": (event: Event) => {
                            event.stopPropagation();
                            event.preventDefault();
                        }

                    }

                })

            ],

            eventHandler: { "mousedown": dragModal },

        })

    }

    const onTitleChange = (self: UltraLightElement) => {
        const newTitle = getTitle();
        self.innerHTML = newTitle;
    }

    return UltraComponent({

        component: `<div class="${styles['window-frame']}"></div>`,

        children: [

            UltraComponent({
                component: `<p>${initTitle}</p>`,
                trigger: [{
                    subscriber: titleSubscriber,
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

}