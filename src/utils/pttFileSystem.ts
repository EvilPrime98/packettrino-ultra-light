import { TERMINAL_CONTEXT } from "@/context/terminal-context";

type lsOptions = {
    recursive?: boolean;
}

export class pttFileSystem {

    structure: Record<string, unknown>;

    constructor(structure: Record<string, any>) {
        this.structure = structure['/'];
    }

    getPWD() {
        let currentDirectory = (this.structure); // { '/': ...}
        const $PWD = TERMINAL_CONTEXT.get().pwd; // ['bin', 'foo', 'bar']
        for (let i = 0; i < $PWD.length; i++) currentDirectory = currentDirectory[$PWD[i]];
        return currentDirectory;
    }

    ls({ recursive }: lsOptions ) {

        const currentDirectory = this.getPWD();
        const isRecursive = recursive;
        const output: string[] = [];

        recursiveSearch(currentDirectory, "");

        function recursiveSearch(objt: Record<string, any>, currentPath: string) {

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
        
        let currentDirectory = this.structure;
        const provisionalPWD: string[] = [];

        directoryPath.forEach(dir => {
            if (!dir) return;
            if (!Object.hasOwn(currentDirectory, dir)) throw new Error(`El directorio ${dir} no existe`);
            if (!(currentDirectory[dir] instanceof Object)) throw new Error(`${dir} no es un directorio`);
            currentDirectory = currentDirectory[dir];
            provisionalPWD.push(dir);
        });

        return provisionalPWD;

    }

}