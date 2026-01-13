import { UltraComponent, ultraStyles } from "@ultra-light";
import { TERMINAL_CONTEXT } from "@/context/terminal-context";

const styles = ultraStyles(`

    .terminal-output {

        white-space: pre-wrap;
        box-sizing: border-box;
        padding-top: 0px;
        padding-bottom: 0px;
        margin-bottom: 12px;
        margin-top: -31px;

        p {
            margin: 0px;
            padding: 3px;
        }

        li {
            padding: 5px;
            list-style-position: outside;
            margin-left: 20px;
            text-indent: -25px;
        }

        table {

            width: 60%;
            border-collapse: collapse;

            * {
                border: 1px solid white;
                border-collapse: collapse;
                text-align: center;
                padding: 5px;
            }

        }

    }

`);

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