import {
    UltraFragment,
    ultraState
} from "@ultra-light";
import AppLoader from "@components/core/app-loader.ts";
import { WorkSpace } from "@components/core/work-space.ts";
import Panel from "@components/core/panel/panel.ts";
import { Toaster } from "./components/core/toaster.ts";
import Terminal from "./components/tools/cli/terminal.ts";
import PcMenu from "@/components/menus/pc-menu/pc-menu.ts";
import { RouterMenu } from "@/components/menus/router-menu/router-menu.ts";
import PacketTracer from "@/components/menus/packet-tracer/packet-tracer.ts";
import SettingsMenu from "@/components/menus/settings/settings-menu.ts";
import { Dhcp_Server_Menu } from "./components/menus/dhcp-server-menu/dhcp-server-menu.ts";

export default function App() {

    const [isLoaded, setIsLoaded, subscribeIsLoaded] = ultraState(false);

    setTimeout(() => {
        setIsLoaded(true);
    }, 500);

    return UltraFragment(

        AppLoader({ isLoaded, subscribeIsLoaded }),
        Toaster(),
        Terminal(),
        WorkSpace(),
        PcMenu(),
        RouterMenu(),
        Dhcp_Server_Menu(),
        PacketTracer(),
        SettingsMenu(),
        Panel({ isLoaded, subscribeIsLoaded })

    );

}