import { UltraComponent, ultraStyles, ultraState } from "@ultra-light";
import TerminalEditor from "./terminal-editor";
import { TERMINAL_CONTEXT as tCtx } from "../../../context/terminal-context";
import { dragModal } from "@utils/dragModal";
import TerminalInput from "./terminal-input";
import TerminalOutput from "./terminal-output";
import TerminalPrompt from "./terminal-prompt";
import unix from "@/components/tools/cli/unix";

const transitionDuration = '0.2s';

const styles = ultraStyles(`
    
    .terminal-component {
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #333;
        color: white;
        width: 1000px;
        height: 500px;
        border-radius: 5px;
        box-sizing: border-box;
        box-shadow: 0px 0px 10px black;
        z-index: 2;
        overflow-y: auto;
        opacity: 1;
        scale: 1;
        transition: opacity, scale, display allow-discrete;
        transition-duration: ${transitionDuration};
        
        @starting-style {
            opacity: 0;
            scale: 0;
        }
    }

    .hidden {
        display: none;
        opacity: 0;
        scale: 0;
    }

    .window-frame {

        margin: 0px;
        padding: 0px;
        width: 100%;
        height: 30px;
        background-color: var(--darkblue);
        color: #fff;
        z-index: -1;
        display: flex;
        align-items: center;
        justify-content: center;

        p {
            text-transform: uppercase;
            font-weight: bolder;
            color: #fff;
            margin-top: auto;
            margin-bottom: auto;
        }

    }

    .terminal-component&.dragging {
        transform: none;
        transition: none;
    }

    .terminal-component * {
        font-family: monospace;
        font-size: 20px;
        padding: 20px;
    }

    .terminal-component input {
        border: none;
        outline: none;
        background-color: transparent;
        color: white;
        width: 100%;
        height: fit-content;
        word-wrap: break-word;
        padding: 0px;
        margin-left: 10px;
    }

    .terminal-component p {
        display: flex;
        align-items: center;
    }

    .terminal-component span {
        width: fit-content;
        padding: 0px;
        white-space: nowrap;
        user-select: none;
    }

`);

export default function Terminal() {

    const [prevIsVisible, setPrevIsVisible,] = ultraState(
        tCtx.get().isVisible
    );

    function terminalKeyboard(event: Event) {

        const keydownEvent = event as KeyboardEvent;

        const clearLoop = () => {
            const loopId = tCtx.get().loopId;
            if (loopId) clearInterval(loopId);
            tCtx.set({
                ...tCtx.get(),
                loopId: null
            });
        }

        if (keydownEvent.ctrlKey && keydownEvent.key === "c") {
            keydownEvent.preventDefault();
            clearLoop();
            tCtx.set({
                ...tCtx.get(),
                output: ""
            });
            return;
        }

        if (keydownEvent.key === "Escape") {
            keydownEvent.preventDefault();
            clearLoop();
            tCtx.set({
                ...tCtx.get(),
                isVisible: false
            });
            return;
        }

        if (keydownEvent.key === "ArrowUp") {

            keydownEvent.preventDefault();

            const currIndex = tCtx.get()
                .currentCommandIndex;

            if (currIndex <= 0) return;

            const prevCommand = tCtx.get()
                .terminalBuffer[currIndex - 1];

            tCtx.set({
                ...tCtx.get(),
                input: prevCommand,
                currentCommandIndex: currIndex - 1
            });

        }

        if (keydownEvent.key === "ArrowDown") {

            keydownEvent.preventDefault();

            const currIndex = tCtx.get().currentCommandIndex;

            if (currIndex >= tCtx.get().terminalBuffer.length - 1) return;

            const prevCommand = tCtx.get()
                .terminalBuffer[currIndex + 1];

            tCtx.set({
                ...tCtx.get(),
                input: prevCommand,
                currentCommandIndex: currIndex + 1
            });

        }

        if (keydownEvent.key === "Enter") {

            tCtx.get()
            .clear();

            unix();
            
            const {
                input,
                currentCommandIndex: currIndex,
                terminalBuffer: currCommands
            } = tCtx.get();

            tCtx.set({
                ...tCtx.get(),
                terminalBuffer: [...currCommands, input],
                input: "",
                currentCommandIndex: (input === '') ? currIndex : currIndex + 1
            });

        }

    }

    function clickTerminal(event: Event) {
        const self = event.currentTarget as HTMLElement;
        const input = self.querySelector("input") as HTMLInputElement;
        if (input) input.focus();
    }

    function terminalContextTrigger(self: HTMLElement) {

        const { isVisible, elementAPI: propertiesHandler } = tCtx.get();

        if (prevIsVisible() === isVisible) return;

        setPrevIsVisible(isVisible);

        self.classList.toggle(styles["hidden"], !isVisible);

        if (!isVisible) {

            tCtx.set({
                ...tCtx.get(),
                isVisible: false,
                pwd: [],
                input: "",
                output: ""
            });

            Object.assign(self.style, {
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            });

            return;

        }

        //forzamos el focus y la selección del input
        const terminalInput = self.querySelector("input") as HTMLInputElement;
        terminalInput.focus();
        terminalInput.setSelectionRange(
            terminalInput.value.length,
            terminalInput.value.length
        );

        //actualizamos las propiedades del terminal
        if (propertiesHandler) {

            tCtx.set({
                ...tCtx.get(),
                host: propertiesHandler.properties().elementId,
            });

        }

    }

    const initialClass = `${tCtx.get().isVisible ? "" : styles["hidden"]}`;

    return (

        UltraComponent({

            component: `<div class="${styles["terminal-component"]} draggable-modal ${initialClass}"></div>`,

            children: [

                UltraComponent({
                    component: `<div class=${styles["window-frame"]}>Terminal</div>`,
                    eventHandler: { "mousedown": dragModal }
                }),

                UltraComponent({

                    component: `<p class="terminal-line"></p>`,

                    children: [
                        TerminalPrompt(),
                        TerminalInput()
                    ]

                }),

                TerminalOutput(),
                TerminalEditor()
            ],

            eventHandler: {
                "keydown": terminalKeyboard,
                "click": clickTerminal
            },

            trigger: [{ subscriber: tCtx.subscribe, triggerFunction: terminalContextTrigger }]

        })
    );

}