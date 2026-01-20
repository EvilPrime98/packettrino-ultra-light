import { TERMINAL_CONTEXT } from "@/context/terminal-context";

export function command_pwd(): void {

    try {
        
        const $PWD = TERMINAL_CONTEXT.get().pwd;

        TERMINAL_CONTEXT.get().write(
            `/${$PWD.join('/')}`
        );

    }catch (error: unknown) {
        
        const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';

        TERMINAL_CONTEXT.get().write(`pwd: ${errorMessage}`);

    }

}