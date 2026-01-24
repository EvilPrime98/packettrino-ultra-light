import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import { AlignmentError, EmptyArgumentError } from "@/errors";
import { pttFileSystem } from "@/utils/pttFileSystem";
import pathBuilder from "@/utils/pathBuilder";
import { TLayer3Config } from "@/types/TConfig";

export function command_nano() {

    try {

        const elementAPI = tCtx.get().elementAPI;

        if (!elementAPI) {
            throw new AlignmentError("No element API available");
        }

        const argument = tCtx.get().input
        .trim()
        .replaceAll(/\s+/g, ' ')
        .split(' ')[1];

        if (!argument) {
            throw new EmptyArgumentError("No input provided");
        }

        const path = pathBuilder(argument);
        const fileName = path.pop();

        if (path.length === 0 || !fileName) {
            throw new EmptyArgumentError("No file name provided");
        }

        const fs = new pttFileSystem(elementAPI.properties().filesystem);
        const fileContent = fs.read(fileName, path);

        tCtx.get().update({
            editorPath: argument
        });

        tCtx.get().openEditor(
            fileContent
        );

    } catch (e) {

        const errorMessage = e instanceof Error ? e.message : 'Unknown error';

        tCtx.get().write(
            `Error: ${(errorMessage)}`
        );

    }

}


/**
 * This function is used to write a file to the filesystem using the nano utility.
 * It returns a string with the output of the command.
 * @param elementAPI The element API.
 * @param path The path to the file as a string. Can be relative or absolute.
 * @param content The content to write.
 * @returns output
 */
export function nano_write(
    elementAPI: TLayer3Config,
    path: string,
    content: string,
): string {

    try {

        const pathSegments = pathBuilder(path);
        const fileName = pathSegments.pop();

        if (pathSegments.length === 0 || !fileName) {
            throw new EmptyArgumentError("No file name provided");
        }

        const fs = new pttFileSystem(elementAPI.properties().filesystem);

        fs.write({
            fileName: fileName,
            directoryPath: pathSegments,
            content
        })

        return `File ${fileName} written successfully`

    } catch (e) {

        const errorMessage = e instanceof Error ? e.message : 'Unknown error';

        return `Error: ${(errorMessage)}`
        
    }

}