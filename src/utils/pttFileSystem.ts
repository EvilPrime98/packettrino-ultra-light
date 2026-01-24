import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import { 
    DirectoryDoesNotExistError, 
    DirectoryIsNotADirectoryError, 
    FileDoesNotExistError, 
    FileIsNotAFileError 
} from "@/errors";

type lsOptions = {
    recursive?: boolean;
    long?: boolean;
    dir?: string[];
}

export type IPTTFile = string;

export interface IPTTFolder {
    [key: string]: IPTTFile | IPTTFolder;
}

export class pttFileSystem {

    structure: IPTTFolder;

    constructor(structure: Record<string, IPTTFolder>) {
        this.structure = structure['/'];
    }

    /**
     * Takes an absolute path and returns the directory at that path.
     * @param absPath An array of strings representing the absolute path to a certain directory.
     * @returns 
     */
    private goTo(
        absPath: string[]
    ) {
        let currentDirectory: IPTTFile | IPTTFolder = structuredClone(this.structure);
        for (const dir of absPath) {
            currentDirectory = (currentDirectory as IPTTFolder)[dir];
            if (currentDirectory === undefined) throw new DirectoryDoesNotExistError(dir);
            if (!(currentDirectory instanceof Object)) throw new DirectoryIsNotADirectoryError(dir);
        }
        return currentDirectory as IPTTFolder;
    }

    /**
     * Returns a list of files and directories in the current directory, or in a specified directory.
     * @param {lsOptions} options
     * @param {boolean} options.recursive Recursively lists subdirectories.
     * @param {boolean} options.long Long format.
     * @param {Array<string>} options.dir Optional directory in absolute path format to list.
     * @returns 
     */
    ls({ 
        recursive, 
        long,
        dir
    }: lsOptions = {}): string {

        const currentDirectory = (!dir || dir?.length === 0) 
        ? this.goTo(TERMINAL_CONTEXT.get().pwd) 
        : this.goTo(dir);

        const isRecursive = recursive;
        const output: string[] = [];

        recursiveSearch(currentDirectory, "");

        function recursiveSearch(
            objt: IPTTFolder,
            currentPath: string
        ) {

            for (const key in objt) {
                if (objt[key] instanceof Object) {
                    output.push(`${currentPath}/${key}`);
                    if (isRecursive) recursiveSearch(objt[key], `${currentPath}/${key}`);
                } else {
                    output.push(`${currentPath}/${key}`);
                }
            }
        }

        return (long) ? output.join("\n") : output.join(" ");

    }

    cd(directoryPath: string[]) {

        let currentDirectory: IPTTFile | IPTTFolder = this.structure;
        const provisionalPWD: string[] = [];

        directoryPath.forEach(dir => {
            if (!dir) return;
            if (typeof currentDirectory === 'string' || !Object.hasOwn(currentDirectory, dir)) {
                throw new DirectoryDoesNotExistError(dir);
            }
            if (!(currentDirectory[dir] instanceof Object)) throw new DirectoryIsNotADirectoryError(dir);
            currentDirectory = currentDirectory[dir];
            provisionalPWD.push(dir);
        });

        return provisionalPWD;

    }

    read(
        fileName: string,
        directoryPath: string[]
    ): IPTTFile {

        let currentDirectory: IPTTFolder = this.structure;

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new DirectoryDoesNotExistError(directoryPath[i]);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new DirectoryIsNotADirectoryError(directoryPath[i]);
            currentDirectory = currentDirectory[directoryPath[i]] as IPTTFolder;
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new FileDoesNotExistError(fileName);
        if (currentDirectory[fileName] instanceof Object) throw new FileIsNotAFileError(fileName);

        return currentDirectory[fileName] as IPTTFile;

    }

    write({
        fileName,
        directoryPath,
        content,
    }: {
        fileName: string;
        directoryPath: string[];
        content: IPTTFile;
    }): void {

        let currentDirectory: IPTTFolder = this.structure;

        for (let i = 0; i < directoryPath.length; i++) {

            if (!currentDirectory[directoryPath[i]]) {
                throw new DirectoryDoesNotExistError(directoryPath[i]);
            }

            if (!(currentDirectory[directoryPath[i]] instanceof Object)) {
                throw new DirectoryIsNotADirectoryError(directoryPath[i]);
            }

            currentDirectory = currentDirectory[directoryPath[i]] as IPTTFolder;

        }

        if (!Object.hasOwn(currentDirectory, fileName)) {
            throw new FileDoesNotExistError(fileName);
        }

        if (currentDirectory[fileName] instanceof Object) {
            throw new FileIsNotAFileError(fileName);
        }

        currentDirectory[fileName] = content;

    }

}