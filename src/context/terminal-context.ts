import { TLayer3Config } from "@/types/TConfig";
import { UltraContext } from "@ultra-light";

export interface TerminalContextInterface {
  /**
   * Returns true or false based on whether the terminal is visible.
   */
  isVisible: boolean;
  
  /**
   * Returns the current index of the command in the terminal buffer.
   */
  currentCommandIndex: number;

  /**
   * Returns the terminal buffer as an array of strings.
   */
  terminalBuffer: string[];

  /**
   * Returns the current working directory as an array of strings.
   */
  pwd: string[];

  /**
   * Returns the API of the element connected to the terminal.
   */
  elementAPI: TLayer3Config | null;

  /**
   * Returns the input string of the terminal.
   */
  input: string;

  /**
   * Returns the output string of the terminal.
   */
  output: string;

  /**
   * Returns the user name of the terminal.
   */
  user: string;
  
  /**
   * Returns the host name of the terminal.
   */
  host: string;

  /**
   * Returns the delimiter character of the terminal.
   */
  delimiter: string;

  /** Updates the terminal context with the provided updates. 
   * It will trigger all subscribers to update their state.
   * @param updates The updates to apply to the terminal context.
  */
  update: (updates: Partial<TerminalContextInterface>) => void;
  
  /**
   * Writes a new line of text to the terminal. Short-hand for updating the
   * "output" property.
   * @param line The line of text to write.
   */
  write: (line: string) => void;

  /**
   * Returns the current loop ID of the terminal. This is used to identify and 
   * stop a write loop.
   */
  loopId: NodeJS.Timeout | null;

  /**
   * Writes a new line of text every "$intervalTime"ms to the terminal.
   * @param line The line of text to write.
   * @param intervalTime Interval time in ms.
   * @returns 
   */
  loopwrite: (line: string, intervalTime: number) => void;

  /**
   * Clears the terminal output. Short-hand for updating the "output" property.
   */
  clear: () => void;

  /**
   * Opens the terminal text editor with the provided content.
   * @param content The content to be displayed in the editor.
   * @returns 
   */
  openEditor: (content: string) => void;

  /**
   * Closes the terminal text editor.
   * @returns
   */
  closeEditor: () => void;
  
  /**
   * Stores the cut line for Ctrl+K / Ctrl+U operations in the editor.
   */
  clipboardLine: string;

  /**
   * Stores the path of the current editor file.
   */
  editorPath: string;

}

/**
 * Context for the Terminal component. It holds the state of the terminal and provides 
 * methods to interact with it.
 * @returns {TerminalContextInterface}
 */
const TERMINAL_CONTEXT = UltraContext<TerminalContextInterface>({
  //properties
  isVisible: false,
  terminalBuffer: [],
  currentCommandIndex: 0,
  pwd: [],
  elementAPI: null,
  input: "",
  output: "",
  user: "root",
  host: "",
  delimiter: "#",
  loopId: null,
  clipboardLine: '',
  editorPath: '',
  //methods
  update: (updates: Partial<TerminalContextInterface>) => {
    const tCtx = TERMINAL_CONTEXT;
    if (!tCtx.get().isVisible) return;
    tCtx.set({
      ...tCtx.get(),
      ...updates
    });
  },
  openEditor: () => {},
  closeEditor: () => {},
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