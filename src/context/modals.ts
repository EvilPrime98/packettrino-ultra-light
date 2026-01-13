import { UltraContext, UltraFragment } from "@ultra-light";
import pc_menu from "../components/menus/pc-menu/pc-menu.ts";
import type { PcMenuCtx } from "../types/types.ts";

const PC_MENU_CTX = UltraContext<PcMenuCtx>({
    isVisible: false,
    pcElementAPI: null
});

export { PC_MENU_CTX };

export function MODALS_PROVIDER(...children: string[] | HTMLElement[] | Node[]) {

    return(
        UltraFragment(
            pc_menu(),
            ...children
        )
    )

}