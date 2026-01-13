import { UltraComponent } from "@ultra-light";
import { TERMINAL_CONTEXT } from "@/context/terminal-context";

type Prompt = {
    user: string;
    host: string;
    pwd: string[];
    delimiter: string;
}

export default function TerminalPrompt() {
    
    let prevPrompt: Prompt = {
        user: "",
        host: "",
        pwd: [],
        delimiter: ""
    };

    const checkEqualityUpdate = (current: Prompt): boolean => {
        if (prevPrompt.user !== current.user) return true;
        if (prevPrompt.host !== current.host) return true;
        if (prevPrompt.delimiter !== current.delimiter) return true;
        if (prevPrompt.pwd.join("/") !== current.pwd.join("/")) return true;
        return false;
    }

    const promptTrigger = (self: HTMLElement) => {

        const current = TERMINAL_CONTEXT.get();
        
        if (!checkEqualityUpdate(current)) return;

        prevPrompt = {
            user: current.user,
            host: current.host,
            pwd: [...current.pwd],
            delimiter: current.delimiter
        };

        const userSegment = current.user;
        const hostSegment = current.host;
        const pwdSegment = `/${current.pwd.join('/')}`;
        const delimiterSegment = current.delimiter;

        self.textContent = `${userSegment}${hostSegment}${pwdSegment}${delimiterSegment}`;
        
    }

    return UltraComponent({
        component: `<span id="terminal-prompt"></span>`,
        trigger: [{ 
            subscriber: TERMINAL_CONTEXT.subscribe, 
            triggerFunction: promptTrigger 
        }]
    });
    
}