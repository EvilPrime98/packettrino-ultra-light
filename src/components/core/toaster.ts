import { UltraComponent, ultraState } from "@ultra-light";
import styles from "./toaster.module.css";
import '@assets/error.svg';
import CheckMarkIcon from "../icons/check-mark-icon";
import CrossIcon from "../icons/cross-icon";
import { ToasterProperties, TToasterNotification } from "@/types/TToaster";
import { TOASTER_CONTEXT } from "@/context/toaster-context";

const TOAST_ICONS = {
    success: CheckMarkIcon({}),
    error: CrossIcon({}),
    info: 'ℹ',
    warning: '⚠',
};

export function Toaster() {

    const [properties, setProperties, subscribeToProperties] = ultraState<ToasterProperties>({
        message: "",
        isVisible: false,
        type: 'success',
        timeout: 1000
    })

    const [isLoading, setIsLoading,] = ultraState(false);
    const icon = TOAST_ICONS[properties().type] || TOAST_ICONS.info;
    const initialClass = `${styles['toaster-container']} ${(properties().isVisible) ? '' : styles['hidden']}`;

    function toasterTrigger(self: HTMLElement) {

        if (!properties().isVisible || isLoading()) return;

        setIsLoading(true);

        self.classList.remove(styles['hidden']);

        setTimeout(() => {

            self.classList.add(styles['hidden']);

            setProperties({
                ...properties(),
                isVisible: false
            })
            setIsLoading(false);

        }, properties().timeout);

    }

    function createNotification(
        message: string | number, 
        type: TToasterNotification 
    ) {

        const newState: ToasterProperties = {
            ...properties(),
            message,
            isVisible: true,
            type
        }

        setProperties(newState);

    }


    TOASTER_CONTEXT.set({
        createNotification
    })


    return UltraComponent({

        component: `<div class="${initialClass}"></div>`,

        children: [

            UltraComponent({

                component: `<div class="${styles.toast} ${styles[properties().type]}"></div>`,

                children: [

                    UltraComponent({
                        component: `<span class="${styles['toast-icon']}">${icon}</span>`,
                        trigger: [{
                            subscriber: subscribeToProperties, triggerFunction: (self: HTMLElement) => {
                                self.innerHTML = TOAST_ICONS[properties().type];
                            }
                        }]
                    }),

                    UltraComponent({
                        component: `<div class="${styles['toast-message']}">${properties().message}</div>`,
                        trigger: [{
                            subscriber: subscribeToProperties, triggerFunction: (self: HTMLElement) => {
                                self.innerHTML = properties().message.toString();
                            }
                        }]
                    })

                ]

            })
        ],

        trigger: [{ subscriber: subscribeToProperties, triggerFunction: toasterTrigger }]

    });

}