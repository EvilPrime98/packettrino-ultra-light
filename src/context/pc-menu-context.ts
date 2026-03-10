import { IUltraPcConfig } from "@/types/TConfig";
import { UltraContext } from "ultra-light.js";

export type PcMenuCtx = {
  /**
   * Returns true or false based on whether the pc menu is visible.
   */
  isVisible: boolean;
  /**
   * Returns the pc element API for the current PC element.
   */
  pcElementAPI: IUltraPcConfig | null;
  /**
   * Updates the pc menu context.
   */
  update: (newCtx: Partial<PcMenuCtx>) => void;
}

export const PC_MENU_CTX = UltraContext<PcMenuCtx>({
  
  isVisible: false,
  
  pcElementAPI: null,
  
  update: (updates: Partial<PcMenuCtx>) => {
    PC_MENU_CTX.set({
      ...PC_MENU_CTX.get()!,
      ...updates
    });
  },

});