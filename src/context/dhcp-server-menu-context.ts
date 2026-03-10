import { TLayer3Config } from "@/types/TConfig";
import { UltraContext } from "ultra-light.js";

export type TDchpServerMenuContext = {
  /**
   * Returns true or false based on whether the pc menu is visible.
   */  
  isVisible: boolean;
  /**
   * Returns the pc element API for the current PC element.
   */
  serverAPI: TLayer3Config | null;
  /**
   * Updates the pc menu context with the provided updates. 
   * It will trigger all subscribers to update their state.
   * @param updates The updates to apply to the pc menu context.
  */
  update: (updates: Partial<TDchpServerMenuContext>) => void;
}

export const DHCP_SERVER_MENU_CONTEXT = UltraContext<TDchpServerMenuContext>({
  isVisible: false,
  serverAPI: null,
  update: (updates: Partial<TDchpServerMenuContext>) => {
    const dsCtx = DHCP_SERVER_MENU_CONTEXT;
    dsCtx.set({
      ...dsCtx.get()!,
      ...updates
    });
  }
});