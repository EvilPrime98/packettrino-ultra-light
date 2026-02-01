import { IUltraPcConfig } from "@/types/TConfig";
import { UltraContext } from "@ultra-light";

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
    const pmCtx = PC_MENU_CTX;
    pmCtx.set({
      ...pmCtx.get(),
      ...updates
    });
  },
});