import type { IUltraRouterConfig } from "@/types/TConfig";
import { UltraContext } from "@ultra-light";

export type RouterMenuCtx = {
  /**
   * Returns true or false based on whether the router menu is visible.
   */
  isVisible: boolean;
  /**
   * Returns the router element API for the current router element.
   */
  routerElementAPI: IUltraRouterConfig | null;
}

export const ROUTER_MENU_CTX = UltraContext<RouterMenuCtx>({
    isVisible: false,
    routerElementAPI: null
});