import { UltraComponent, ultraState } from "ultra-light.js";
import { Option } from "./option";
import { WORK_SPACE_CONTEXT as wCtx } from "@context/workspace-context";
import { AdvancedOption } from "@/types/types";
import styles from './adv-options.module.css';

export function AdvancedOptionsDyn({
    onClose,
    contextClickEvent,
    options,
    optionsSubscriber,
    subscribeAdvOptionsState,
    deleteOption,
}: {
    /**
     * Stateful getter for the context click event.
     * @returns 
     */
    contextClickEvent: () => Event | null;
    /**
     * This function is called when the user closes the context menu.
     */
    onClose?: () => void;
    /**
     * Stateful getter for the options.
     */
    options: () => AdvancedOption[];
    /**
     * Stateful subscriber for the options.
     */
    optionsSubscriber: (fn: (value: AdvancedOption[]) => void) => () => void;
    /**
     * Stateful subscriber for the visibility of the context menu.
     */
    subscribeAdvOptionsState: (fn: (value: boolean) => void) => () => void;
    /**
     * This function is called when the user deletes an option.
     */
    deleteOption: (id: string) => void;
}) {

    const [
        getEventCleanup,
        setEventCleanup
    ] = ultraState<(() => void) | null>(null);

    function onVisibilityChange(
        $modal: HTMLElement
    ) {
        if (getEventCleanup() !== null) {
            getEventCleanup()?.();
            setEventCleanup(null);
            return;
        }
        setEventCleanup(onGlobalEvents());
        const clickEvent = contextClickEvent();
        if (!clickEvent || !(clickEvent instanceof MouseEvent)) {
            onClose?.();
            return;
        }
        onModalAdjustments($modal, clickEvent);
    }

    function onModalAdjustments(
        $modal: HTMLElement,
        clickEvent: MouseEvent
    ) {

        wCtx.get().measureBoard();
        const { boardHeight, boardWidth, boardRect } = wCtx.get().boardProperties;
        const workRectLeft = boardRect?.left || 0;
        const workRectTop = boardRect?.top || 0;
        const x = clickEvent.clientX - workRectLeft;
        const y = clickEvent.clientY - workRectTop;

        if (y < boardHeight / 2 && x < boardWidth / 2) {
            $modal.style.top = "30%";
            $modal.style.bottom = "";
            $modal.style.left = "50%";
            $modal.style.right = "";
        } else if (y < boardHeight / 2 && x >= boardWidth / 2) {
            $modal.style.top = "30%";
            $modal.style.bottom = "";
            $modal.style.left = "";
            $modal.style.right = "30%";
        } else if (y >= boardHeight / 2 && x < boardWidth / 2) {
            $modal.style.top = "";
            $modal.style.bottom = "30%";
            $modal.style.left = "30%";
            $modal.style.right = "";
        } else {
            $modal.style.top = "";
            $modal.style.bottom = "30%";
            $modal.style.left = "";
            $modal.style.right = "30%";
        }
    }

    function onGlobalEvents() {
        function onClickOutside(event: Event) {
            const $el = event.target as HTMLElement;
            if (!$el.closest('.advanced-options-modal')) onClose?.();
        }
        window.addEventListener('click', onClickOutside);
        return () => {
            window.removeEventListener('click', onClickOutside);
        }
    }

    function onOptionsChange(
        $div: HTMLElement
    ) {
        $div.innerHTML = '';
        $div.append(...options().map(option =>
            Option(
                {
                    id: option.id,
                    message: option.message,
                    callback: (event: Event | null) => {
                        option.callback(event);
                        onClose?.();
                    }
                },
                deleteOption
            )
        ));
    }

    return UltraComponent({

        component: '<div></div>',

        className: ['modal', styles['advanced-options-modal']],

        children: [
            ...options().map(option =>
                Option(
                    {
                        id: option.id,
                        message: option.message,
                        callback: (event: Event | null) => {
                            option.callback(event);
                            onClose?.();
                        }
                    },
                    deleteOption
                )
            )
        ],

        trigger: [
            { subscriber: subscribeAdvOptionsState, triggerFunction: onVisibilityChange },
            { subscriber: optionsSubscriber, triggerFunction: onOptionsChange, defer: true }
        ],

        eventHandler: {
            'click': (event: Event) => event.stopPropagation()
        }

    })

}