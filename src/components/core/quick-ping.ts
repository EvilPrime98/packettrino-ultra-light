import { UltraComponent } from "@ultra-light";
import PanelItem from "./panel-item";
import { ENV } from "@/context/env";
import PacketCursor from "./packet-cursor";

export default function QuickPingTool() {

    let cursor: ReturnType<typeof PacketCursor> | null = null;

    const clickHandler = () => {

        if (ENV.get().quickPingMode === true) {

            document.body.style.cursor = "default";

            if (cursor) {
                cursor._cleanup?.();
                cursor.remove();
                cursor = null;
            }

            ENV.set({ ...ENV.get(), quickPingMode: false });
            return;

        }

        ENV.set({ ...ENV.get(), quickPingMode: true });

        cursor = PacketCursor();
        document.body.appendChild(cursor);

    }

    return UltraComponent({

        component: PanelItem({
            "name": "ping",
            "image": "./assets/panel/bus.svg",
            "draggable": false,
            "tooltip": "Simulador de Ping"
        }),

        eventHandler: {
            'click': clickHandler 
        }

    });
    
}