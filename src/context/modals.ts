import { UltraContext, UltraFragment } from "@ultra-light";
import pc_menu from "../components/menus/pc-menu/pc-menu.ts";
import { router_menu } from "../components/menus/router-menu/router-menu.ts";
import PacketTracer from "@/components/menus/packet-tracer/packet-tracer.ts";
import type { PcMenuCtx, RouterMenuCtx } from "../types/types.ts";
import SettingsMenu from "@/components/menus/settings/settings-menu.ts";

const PC_MENU_CTX = UltraContext<PcMenuCtx>({
    isVisible: false,
    pcElementAPI: null
});

const ROUTER_MENU_CTX = UltraContext<RouterMenuCtx>({
    isVisible: false,
    routerElementAPI: null
});

export { PC_MENU_CTX, ROUTER_MENU_CTX };

export function MODALS_PROVIDER(...children: string[] | HTMLElement[] | Node[]) {

    return UltraFragment(
        pc_menu(),
        router_menu(),
        PacketTracer(),
        SettingsMenu(),
        ...children
    )

}