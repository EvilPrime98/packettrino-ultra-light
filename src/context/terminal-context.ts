import { UltraContext } from "@ultra-light";
import { TerminalContextInterface } from "@/types/types";

/**
 * Context for the Terminal component.
 * @returns {TerminalContextInterface}
 */
const TERMINAL_CONTEXT = UltraContext<TerminalContextInterface>({
  
  isVisible: false,
  terminalBuffer: [],
  currentCommandIndex: 0,
  pwd: [],
  elementAPI: null,
  input: "",
  output: "",
  user: "root@",
  host: "",
  delimiter: "#",
  loopId: null,
  
  write: (line: string) => {
    const tCtx = TERMINAL_CONTEXT;
    if (!tCtx.get().isVisible) return;    
    const currentState = tCtx.get();
    tCtx.set({
      ...currentState,
      output: currentState.output + line + "\n",
    });
  },

  loopwrite: (line: string, intervalTime: number) => {
    
    const tCtx = TERMINAL_CONTEXT;

    if (!tCtx.get().isVisible) return;

    const loopId = setInterval(() => {
      tCtx.get()
      .write(line);
    }, intervalTime);

    tCtx.set({
      ...tCtx.get(),
      loopId
    });

  },

  clear: () => {
    
    const tCtx = TERMINAL_CONTEXT;

    tCtx.set({
      ...tCtx.get(),
      output: ""
    });

  }

});

export { TERMINAL_CONTEXT };