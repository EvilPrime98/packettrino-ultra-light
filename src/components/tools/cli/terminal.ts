import { UltraComponent, ultraState } from "@ultra-light";
import TerminalEditor from "./terminal-editor";
import { TERMINAL_CONTEXT as tCtx } from "../../../context/terminal-context";
import { dragModal } from "@utils/dragModal";
import TerminalInput from "./terminal-input";
import TerminalOutput from "./terminal-output";
import TerminalPrompt from "./terminal-prompt";
import unix from "@/components/tools/cli/unix";
import styles from "./terminal.module.css";

export default function Terminal() {

    const [prevIsVisible, setPrevIsVisible,] = ultraState(
        tCtx.get().isVisible
    );

    function onKeydown(event: Event) {

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

    function onClick(event: Event) {
        const self = event.currentTarget as HTMLElement;
        const input = self.querySelector("input") as HTMLInputElement;
        if (input) input.focus();
    }

    function onContextChange(self: HTMLElement) {

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

    return UltraComponent({

        component: `<div></div>`,

        className: [
            styles["terminal-component"], 
            styles["draggable-modal"], 
            tCtx.get().isVisible ? "" : styles["hidden"]
        ],

        children: [

            UltraComponent({
                component: `<div class=${styles["window-frame"]}>Terminal</div>`,
                eventHandler: { "mousedown": dragModal }
            }),

            UltraComponent({
                component: '<p></p>',
                children: [ TerminalPrompt(), TerminalInput() ]
            }),

            TerminalOutput(),
            TerminalEditor()
        ],

        eventHandler: {
            "keydown": onKeydown,
            "click": onClick
        },

        trigger: [
            { subscriber: tCtx.subscribe, triggerFunction: onContextChange }
        ]

    });

}