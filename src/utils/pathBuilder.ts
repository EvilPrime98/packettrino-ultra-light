import { TERMINAL_CONTEXT } from "@/context/terminal-context";

export default function pathBuilder(pathInput: string) {

    let path;
    const $PWD = TERMINAL_CONTEXT.get().pwd;

    if (!pathInput) return [];
    
    if (pathInput.startsWith("/")) {
        path = pathInput.split("/");
    } else {
        path = [...$PWD].concat(pathInput.split("/"));
    }

    return path.filter(el => el !== "" && el !== "/");
    
}