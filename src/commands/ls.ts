import { pttFileSystem } from "@/utils/pttFileSystem";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import { catchopts } from "@/utils/network_lib";
import pathBuilder from "@/utils/pathBuilder";


export function command_ls(): void {

    const legalOptions = ["-l", "-R"];

    try {

        const elementProperties = tCtx.get().elementAPI?.properties();
        if (!elementProperties) return;

        const tokens = tCtx.get().input.trim().replace(/\s+/, ' ').split(' ');
        
        const $OPTS = catchopts(
            legalOptions,
            tokens
        );

        const fs = new pttFileSystem(elementProperties.filesystem);
        
        const lsResult = fs.ls({
            recursive: Object.hasOwn($OPTS, "-R"),
            long: Object.hasOwn($OPTS, "-l"),
            dir: pathBuilder(tokens.slice($OPTS.IND+1)[0])
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