import { UltraComponent, ultraState } from "@ultra-light";
import { Option } from "./option";
import { WORK_SPACE_CONTEXT as wCtx } from "@context/workspace-context";
import { AdvancedOption } from "@/types/types";
import styles from './adv-options.module.css';

type Props = {
    contextClickEvent: () => Event | null;
    onClose?: () => void;
    options: AdvancedOption[];
    subscribeAdvOptionsState: (fn: (value: boolean) => void) => () => void;
}

export function AdvancedOptions({
    onClose,
    contextClickEvent,
    options,
    subscribeAdvOptionsState
}: Props) {

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

    return UltraComponent({

        component: '<div></div>',

        className: ['modal', styles['advanced-options-modal']],

        children: [
            ...options.map(option =>
                Option({
                    message: option.message,
                    callback: (event: Event | null) => {
                        option.callback(event);
                        onClose?.();
                    }
                })
            )
        ],

        trigger: [
            { subscriber: subscribeAdvOptionsState, triggerFunction: onVisibilityChange }
        ],

        eventHandler: {
            'click': (event: Event) => event.stopPropagation()
        }

    })

}