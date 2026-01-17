import { UltraComponent } from "@ultra-light";
import PanelItem from "./panel-item";
import { TRACER_MENU_CTX } from "@/context/tracer-context";

export default function PacketTracerButton() {

    const onClick = () => {
        const currentState = TRACER_MENU_CTX.get().isVisible;
        TRACER_MENU_CTX.set({ isVisible: !currentState });
    }

    return UltraComponent({

        component: PanelItem({
            "name": "traffic",
            "image": "./assets/panel/traffic.svg",
            "draggable": false,
            "tooltip": "Tráfico de Red"
        }),

        eventHandler: {
            'click': onClick 
        }

    });
    
}