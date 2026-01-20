import { pttFileSystem } from "@/utils/pttFileSystem";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import { IllegalArgumentError } from "@/errors";

export function command_ls(): void {

    try {

        const elementProperties = tCtx.get().elementAPI?.properties();
        if (!elementProperties) return;
        
        const args = (tCtx.get().input).trim().split(" ").slice(1);

        for (const arg of args) {
            const validArgs = ["-l", "-R"];
            if (!validArgs.includes(arg)) throw new IllegalArgumentError(`Illegal option: ${arg}`);
        }

        const fs = new pttFileSystem(elementProperties.filesystem);
        const lsResult = fs.ls({
            recursive: args.includes("-R")
        });

        tCtx.get().write(
            lsResult
        );

    } catch (error: unknown) {

        const errorMessage = error instanceof Error 
        ? error.message : 
        'Unknown error';
        
        tCtx.get().write(`ls: ${errorMessage}`);

    }

}