import { UltraComponent, ultraStyles } from "@ultra-light";
import { Option } from "./option";
import { WORK_SPACE_CONTEXT as wCtx } from "@context/workspace-context";
import { AdvancedOption } from "@/types/types";

type Props = {
    contextClickEvent: () => Event | null;
    onClose?: () => void;
    options: AdvancedOption[];
    subscribeAdvOptionsState: (fn: (value: boolean) => void) => () => void;
}

const styles = ultraStyles(`

    .advanced-options-modal {
        position: absolute;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08);
        text-align: center;
        width: 160px;
        padding: 5px;
        z-index: 3;
        animation: fadeIn 0.2s ease-in-out;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .advanced-options-modal button {
        margin: 4px 0;
        padding: 10px 16px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f5f5f5;
        color: #333;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .advanced-options-modal button:hover {
        background-color: #e8e8e8;
    }

    .advanced-options-modal button:active {
        background-color: #dcdcdc;
    }

    .advanced-options-modal.modal-dark-mode {
        background-color: #1e1e1e;
        border: 1px solid #444;
    }

    .advanced-options-modal.modal-dark-mode button {
        margin: 4px 0;
        padding: 10px 16px;
        border: 1px solid #444;
        border-radius: 8px;
        background-color: #2b2b2b;
        color: #f0f0f0;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .advanced-options-modal.modal-dark-mode button:hover {
        background-color: #3a3a3a;
    }

    .advanced-options-modal.modal-dark-mode button:active {
        background-color: #444;
    }

    .hidden {
        display: none;
    }

`);

export function AdvancedOptions({
    onClose,
    contextClickEvent,
    options,
    subscribeAdvOptionsState
}: Props) {

    const visibilityHandler = (self: HTMLElement) => {

        const clickEvent = contextClickEvent();

        if (!clickEvent || !(clickEvent instanceof MouseEvent)) {
            onClose?.();
            return;
        }

        wCtx.get().measureBoard();
        const { boardHeight, boardWidth, boardRect } = wCtx.get().boardProperties;
        const workRectLeft = boardRect?.left || 0;
        const workRectTop = boardRect?.top || 0;
        const x = clickEvent.clientX - workRectLeft;
        const y = clickEvent.clientY - workRectTop;

        if (y < boardHeight / 2 && x < boardWidth / 2) {
            self.style.top = "30%";
            self.style.bottom = "";
            self.style.left = "50%";
            self.style.right = "";
        } else if (y < boardHeight / 2 && x >= boardWidth / 2) {
            self.style.top = "30%";
            self.style.bottom = "";
            self.style.left = "";
            self.style.right = "30%";
        } else if (y >= boardHeight / 2 && x < boardWidth / 2) {
            self.style.top = "";
            self.style.bottom = "30%";
            self.style.left = "30%";
            self.style.right = "";
        } else {
            self.style.top = "";
            self.style.bottom = "30%";
            self.style.left = "";
            self.style.right = "30%";
        }

    }

    return (

        UltraComponent({

            component: `<div class="modal ${styles["advanced-options-modal"]}"></div>`,

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

            trigger: [{ subscriber: subscribeAdvOptionsState, triggerFunction: visibilityHandler }],

            eventHandler: {
                'click': (event: Event) => event.stopPropagation()
            }
            
        })

    )

}