import { UltraContext } from "@ultra-light";
import type { PcMenuCtx } from "@/types/types";

export const PC_MENU_CTX = UltraContext<PcMenuCtx>({
    isVisible: false,
    pcElementAPI: null
});