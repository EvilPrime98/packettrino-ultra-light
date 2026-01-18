import { UltraContext } from "@ultra-light";
import type { RouterMenuCtx } from "@/types/types";

export const ROUTER_MENU_CTX = UltraContext<RouterMenuCtx>({
    isVisible: false,
    routerElementAPI: null
});