import { UltraComponent } from "@ultra-light";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";

/**
 * Terminal Input Component. This component is responsible for handling the input of the terminal.
 * It listens to the context changes and updates the input value accordingly.
 * @returns 
 */
export default function TerminalInput() {

    const onInput = (event: Event) => {
        if (tCtx.get().isVisible === false) return;
        const $input = event.currentTarget as HTMLInputElement;
        tCtx.get().update({
            input: $input.value
        });
    }

    const onContextChange = (self: HTMLElement) => {
        if (tCtx.get().isVisible === false) return;
        const $input = self as HTMLInputElement;
        $input.value = tCtx.get().input;
        $input.focus();
        $input.setSelectionRange(
            $input.value.length,
            $input.value.length
        );
    }

    return UltraComponent({

        component: (`
            <input
                type="text"
                autofocus
                autocomplete="off"
                spellcheck="false"
                value="${tCtx.get().input}"
            />
        `),

        eventHandler: { 'input': onInput },

        trigger: [
            { subscriber: tCtx.subscribe, triggerFunction: onContextChange },
        ]

    })

}