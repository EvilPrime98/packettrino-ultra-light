import { UltraComponent } from "@ultra-light";
import { TERMINAL_CONTEXT } from "@/context/terminal-context";

export default function TerminalInput() {

    const changeHandler = (event: Event) => {

        event.preventDefault();

        const input = event.currentTarget as HTMLInputElement;

        TERMINAL_CONTEXT.set({
            ...TERMINAL_CONTEXT.get(),
            input: input.value
        });

    }

    const detectChange = (self: HTMLElement) => {

        if (self instanceof HTMLInputElement) {
            self.value = TERMINAL_CONTEXT.get().input;
        }

    }

    return (

        UltraComponent({

            component: `
            <input
                type="text"
                class="terminal-input"
                autofocus
                autocomplete="off"
                spellcheck="false"
                value="${TERMINAL_CONTEXT.get().input}"
            >`,

            eventHandler: { 'input': changeHandler },

            trigger: [{
                subscriber: TERMINAL_CONTEXT.subscribe,
                triggerFunction: detectChange
            }]

        })

    )

}