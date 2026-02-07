import type { TToasterNotification } from "@/types/TToaster";
import { UltraContext } from "@ultra-light";

export interface IToasterContext {
  /**
   * Creates a toaster notification. It can be used to display messages to the user.
   * @param message Message to be displayed.
   * @param type It can be 'success', 'error', 'info', or 'warning'.
   * @returns 
   */
  createNotification: (message: string | number, type: TToasterNotification) => void
}

export const TOASTER_CONTEXT = UltraContext<IToasterContext>({
  createNotification: () => {}
});