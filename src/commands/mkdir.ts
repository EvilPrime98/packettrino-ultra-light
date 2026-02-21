import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import { AlignmentError, EmptyArgumentError } from "@/errors";
import { pttFileSystem } from "@/utils/pttFileSystem";
import pathBuilder from "@/utils/pathBuilder";

export function command_mkdir(): void {

    try {

        const elementAPI = tCtx.get().elementAPI;

        if (!elementAPI) {
            throw new AlignmentError("No element API available");
        }

        const args = tCtx.get().input
        .trim()
        .replaceAll(/\s+/g, ' ')
        .split(' ')
        .slice(1);

        if (args.length === 0) {
            throw new EmptyArgumentError("No input provided");
        }

        const path = pathBuilder(args[0]);
        const dirName = path.pop();

        if (!dirName) {
            throw new EmptyArgumentError("No directory name provided");
        }

        const fs = new pttFileSystem(elementAPI.properties().filesystem);

        fs.mkdir(path, dirName);

    } catch (e) {

        const errorMessage = e instanceof Error ? e.message : 'Unknown error';

        tCtx.get().write(
            `Error: ${(errorMessage)}`
        );

    }

}