import { UltraComponent, ultraCompState, ultraState } from "ultra-light.js";
import styles from "./toaster.module.css";
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

    const properties = ultraCompState<ToasterProperties>({
        message: "",
        isVisible: false,
        type: 'success',
        timeout: 1000
    });

    const [isLoading, setIsLoading,] = ultraState(false);
    const icon = TOAST_ICONS[properties.type.get()] || TOAST_ICONS.info;
    const initialClass = `${styles['toaster-container']} ${(properties.isVisible.get()) ? '' : styles['hidden']}`;

    function toasterTrigger(
        self: HTMLElement
    ) {
        if (!properties.isVisible.get() || isLoading()) return;
        setIsLoading(true);
        self.classList.remove(styles['hidden']);
        setTimeout(() => {
            self.classList.add(styles['hidden']);
            properties.isVisible.set(false);
            setIsLoading(false);
        }, properties.timeout.get());
    }

    function createNotification(
        message: string | number, 
        type: TToasterNotification 
    ) {
        properties.message.set(message);
        properties.isVisible.set(true);
        properties.type.set(type);
    }

    return UltraComponent({

        component: `<div class="${initialClass}"></div>`,

        children: [

            UltraComponent({

                component: `<div class="${styles.toast} ${styles[properties.type.get()]}"></div>`,

                children: [

                    UltraComponent({
                        component: `<span class="${styles['toast-icon']}">${icon}</span>`,
                        trigger: [{
                            subscriber: properties.type.subscribe, 
                            triggerFunction: (self: HTMLElement) => {
                                self.innerHTML = TOAST_ICONS[properties.type.get()];
                            }
                        }]
                    }),

                    UltraComponent({
                        component: `<div class="${styles['toast-message']}">${properties.message.get()}</div>`,
                        trigger: [{
                            subscriber: properties.message.subscribe,
                            triggerFunction: (self: HTMLElement) => {
                                self.innerHTML = properties.message.get().toString();
                            }
                        }]
                    })

                ]

            })
        ],

        trigger: [{ 
            subscriber: properties.isVisible.subscribe, 
            triggerFunction: toasterTrigger 
        }],

        onMount: [
            () => {
                TOASTER_CONTEXT.set({
                    createNotification
                })
            }
        ]

    });

}