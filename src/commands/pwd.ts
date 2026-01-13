import { TERMINAL_CONTEXT } from "@/context/terminal-context";

export default function command_pwd(): string {
    const $PWD = TERMINAL_CONTEXT.get().pwd;
    return `/${$PWD.join('/')}`;
}