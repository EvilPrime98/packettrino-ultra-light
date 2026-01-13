import { pttFileSystem } from "@/utils/pttFileSystem";
import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import pathBuilder from "@/utils/pathBuilder";
import { IllegalArgumentError } from "@/errors";

export function command_ls(): string {

    try {

        const elementProperties = TERMINAL_CONTEXT.get().elementAPI?.properties();

        if (!elementProperties) return "";
        const args = (TERMINAL_CONTEXT.get().input).trim().split(" ").slice(1);

        for (const arg of args) {
            const validArgs = ["-l", "-R"];
            if (!validArgs.includes(arg)) throw new IllegalArgumentError(`Illegal option: ${arg}`);
        }

        const elementFilesystem = new pttFileSystem(elementProperties.filesystem);

        return elementFilesystem.ls({
            recursive: args.includes("-R")
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return `ls: ${errorMessage}`;
    }

}

export function command_cd(): string {

    const elementProperties = TERMINAL_CONTEXT.get().elementAPI?.properties();

    if (!elementProperties) return "";

    try {

        const elementFilesystem = new pttFileSystem(elementProperties.filesystem);
        const destinationDirectory = (TERMINAL_CONTEXT.get().input).trim().split(" ")[1];
        const path = pathBuilder(destinationDirectory);
        const newPWD = elementFilesystem.cd(path);

        TERMINAL_CONTEXT.set({
            ...TERMINAL_CONTEXT.get(),
            pwd: newPWD
        });

        return "";

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return `cd: ${errorMessage}`;
    }

}