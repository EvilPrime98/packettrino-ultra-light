import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";

export function command_history(): void {

    try {

        const currBuffer = tCtx.get().terminalBuffer

        tCtx.get().write(
            currBuffer.map((command, index) => {
                const indStr = ((index + 1).toString() + '.').padEnd(6, ' ');
                return `${indStr} ${command}`;
            }).join("\n")
        );

    } catch (error) {

        const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';
        
        tCtx.get().write(
            `history: ${errorMessage}`
        );

    }

}