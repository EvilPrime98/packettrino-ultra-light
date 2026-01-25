import { TERMINAL_CONTEXT } from "@/context/terminal-context";
import { 
    DirectoryDoesNotExistError, 
    DirectoryIsNotADirectoryError, 
    FileDoesNotExistError, 
    FileIsNotAFileError 
} from "@/errors";
import { printcol } from "./prints";

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
     * Returns the size of a file or directory in bytes.
     * @param ref 
     * @returns 
     */
    private getFileSize(
        ref: IPTTFile | IPTTFolder
    ){
        if (ref instanceof Object) return 0;
        return ref.length * 2;
    }

    /**
     * Returns the long information of a file or directory.
     * @param ref 
     * @param index 
     * @returns 
     */
    private getLongInformation(
        ref: IPTTFile | IPTTFolder,
        index: string
    ){
        const isDirectory = ref instanceof Object;
        const permissions = `${(isDirectory) ? 'd' : '-'}rw-r--r--`;
        const user  = TERMINAL_CONTEXT.get().user;
        const group = TERMINAL_CONTEXT.get().user;
        const size = this.getFileSize(ref).toString();
        //const lastModified = '2022-01-01'; // TODO: get last modified date
        return printcol(5, permissions, user, group, size, index);
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

        const recursiveSearch = (
            dir: IPTTFolder,
            currentPath: string
        ) => {

            for (const index in dir) {   
                if (dir[index] instanceof Object) {
                    if (long) {
                        output.push(this.getLongInformation(dir[index], index));
                    }else {
                        output.push(`${currentPath}/${index}`);
                    }
                    if (isRecursive) recursiveSearch(dir[index], `${currentPath}/${index}`);
                } else {
                    if (long) {
                        output.push(this.getLongInformation(dir[index], index));
                    }else {
                        output.push(`${currentPath}/${index}`);
                    }
                }
            }
        };

        recursiveSearch(currentDirectory, "");

        return output.join("\n");

    }

    /**
     * Changes the current working directory.
     * @param directoryPath An array of strings representing the absolute path to the directory to change to.
     * @returns The new current working directory. 
     * @throws DirectoryDoesNotExistError
     * @throws DirectoryIsNotADirectoryError
     */
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

    /**
     * Reads a file from the file system.
     * @param fileName A string representing the name of the file to read.
     * @param directoryPath An array of strings representing the absolute path to the directory containing the file.
     * @returns 
     */
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

    /**
     * Writes a file to the file system.
     * @param param0 
     * @returns
     * @throws FileDoesNotExistError
     * @throws FileIsNotAFileError
     */
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