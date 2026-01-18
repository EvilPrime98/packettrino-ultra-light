import { UltraFragment } from "@ultra-light";
import PcMenu from "../components/menus/pc-menu/pc-menu.ts";
import { RouterMenu } from "../components/menus/router-menu/router-menu.ts";
import PacketTracer from "@/components/menus/packet-tracer/packet-tracer.ts";
import SettingsMenu from "@/components/menus/settings/settings-menu.ts";

export function MODALS_PROVIDER(...children: string[] | HTMLElement[] | Node[]) {

    return UltraFragment(
        PcMenu(),
        RouterMenu(),
        PacketTracer(),
        SettingsMenu(),
        ...children
    )

}