import { UltraComponent } from "@ultra-light";
import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import styles from "./terminal.module.css";

export default function TerminalOutput() {

    const outputHandler = (self: HTMLElement) => {
        self.innerHTML = TERMINAL_CONTEXT.get().output;
    }

    const mouseDownHandler = (event: Event) => {
        event.stopPropagation();
    }

    return UltraComponent({
        component: `<pre class="${styles["terminal-output"]}"></pre>`,
        eventHandler: { "mousedown": mouseDownHandler },
        trigger: [{
            subscriber: TERMINAL_CONTEXT.subscribe,
            triggerFunction: outputHandler
        }]
    });

}