import { UltraComponent, ultraEffect, ultraState } from "@ultra-light";
import PanelItem from "./panel-item";
import { ENV } from "@/context/env";

export default function QuickPingTool() {

    let cursor: ReturnType<typeof PacketCursor> | null = null;

    const onClick = () => {

        if (ENV.get().quickPingMode === true) {

            document.body.style.cursor = "default";

            if (cursor) {
                cursor._cleanup?.();
                cursor.remove();
                cursor = null;
            }

            ENV.set({ 
                ...ENV.get(), 
                quickPingMode: false 
            });

        }else{

            ENV.set({ 
                ...ENV.get(), 
                quickPingMode: true 
            });

            cursor = PacketCursor();
            document.body.appendChild(cursor);

        }

    }

    return UltraComponent({

        component: PanelItem({
            "name": "ping",
            "image": "./assets/panel/bus.svg",
            "draggable": false,
            "tooltip": "Simulador de Ping"
        }),

        eventHandler: {
            'click': onClick 
        }

    });
    
}

function PacketCursor() {

    const [position, setPosition, subscribeToPosition] = ultraState({
        x: '',
        y: ''
    })

    function onUpdate(self: HTMLElement){
        if (!self) return;
        self.style.top = position().y;
        self.style.left = position().x;
    }
    
    function onMove(event: Event) {
        if (!(event instanceof MouseEvent)) return;
        setPosition({
            x: `${event.clientX}px`,
            y: `${event.clientY}px`
        })
    }

    ultraEffect(() => {
        document.body.style.cursor = "none";
        document.addEventListener("mousemove", onMove);
    }, []);

    const onCleanup = () => {
        document.body.style.cursor = "default";
        document.removeEventListener("mousemove", onMove);
    } 

    return UltraComponent({
        
        component: (
            `<article class="pack-cursor">
                <img src="/assets/board/pack.svg" />
            </article>`
        ),
        
        trigger: [
            { subscriber: subscribeToPosition, triggerFunction: onUpdate }
        ],

        cleanup: [onCleanup]

    })

}