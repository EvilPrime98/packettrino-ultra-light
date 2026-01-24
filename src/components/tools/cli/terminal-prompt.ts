import { UltraComponent } from "@ultra-light";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";

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

    function checkEqualityUpdate () {
        const { user, host, pwd, delimiter } = tCtx.get();
        if (prevPrompt.user !== user) return true;
        if (prevPrompt.host !== host) return true;
        if (prevPrompt.delimiter !== delimiter) return true;
        if (prevPrompt.pwd.join("/") !== pwd.join("/")) return true;
        return false;
    }

    const onContextChange = (self: HTMLElement) => {
        const $span = self as HTMLSpanElement;
        if (!checkEqualityUpdate()) return;      
        const { user, host, pwd, delimiter } = tCtx.get();
        prevPrompt = {
            user: user,
            host: host,
            pwd: [...pwd],
            delimiter: delimiter
        };
        const userSegment = user;
        const hostSegment = host;
        const pwdSegment = `/${pwd.join('/')}`;
        const delimiterSegment = delimiter;
        $span.textContent = userSegment + "@" + hostSegment 
        + ":" + pwdSegment + delimiterSegment;    
    }

    return UltraComponent({
        component: `<span id="terminal-prompt"></span>`,
        trigger: [{ 
            subscriber: tCtx.subscribe, 
            triggerFunction: onContextChange,
            defer: true
        }]
    });
    
}