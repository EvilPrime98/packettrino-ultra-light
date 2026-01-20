import { pttFileSystem } from "@/utils/pttFileSystem";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import pathBuilder from "@/utils/pathBuilder";

export function command_cd(): void {

    const elementProperties = tCtx.get().elementAPI?.properties();
    if (!elementProperties) return;

    try {

        const elementFilesystem = new pttFileSystem(elementProperties.filesystem);
        const destinationDirectory = (tCtx.get().input).trim().split(" ")[1];
        const path = pathBuilder(destinationDirectory);
        const newPWD = elementFilesystem.cd(path);

        tCtx.set({
            ...tCtx.get(),
            pwd: newPWD
        });


    } catch (error: unknown) {

        const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';
        
        tCtx.get().write(`cd: ${errorMessage}`);

    }

}