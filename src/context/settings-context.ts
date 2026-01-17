import { UltraContext } from "@/ultra-light/ultra-light";

export type SettingsMenuCtx = {
  /**
   * Returns true or false based on whether the tracer is visible.
   */
  isVisible: boolean;
}

export const SETTINGS_MENU_CTX = UltraContext<SettingsMenuCtx>({
  isVisible: false
});