import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import { 
    DirectoryDoesNotExistError, 
    DirectoryIsNotADirectoryError, 
    FileDoesNotExistError, 
    FileIsNotAFileError 
} from "@/errors";

type lsOptions = {
    recursive?: boolean;
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

    getPWD(): IPTTFolder {
        let currentDirectory: IPTTFile | IPTTFolder = this.structure;
        const $PWD = TERMINAL_CONTEXT.get().pwd;
        for (let i = 0; i < $PWD.length; i++) {
            currentDirectory = (currentDirectory as IPTTFolder)[$PWD[i]];
        }
        return currentDirectory as IPTTFolder;
    }

    ls({ recursive }: lsOptions ) {

        const currentDirectory = this.getPWD();
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

        return (isRecursive) ? output.join("\n") : output.join(" ");

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