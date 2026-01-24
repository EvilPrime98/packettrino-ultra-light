import { IDefaultCableProps } from "@/types/Tcanvas";
import { 
    UltraFragment, 
    UltraComponent, 
    ultraState, 
    UltraLightElement 
} from "@ultra-light";

export default function DefaultCable({ 
    x1, 
    y1, 
    x2, 
    y2, 
    item1Api, 
    item2Api,
    ifaceId
}: IDefaultCableProps) {

    const [deleteSignal, setDeleteSignal, subscribeDeleteSignal] = ultraState(false);
    const parseCoord = (coord: string): number => parseInt(coord.replace("px", ""));
    const STROKE_WIDTH = 5;
    const CIRCLE_RADIUS = 10;
    const x1Value = parseCoord(x1);
    const y1Value = parseCoord(y1);
    const x2Value = parseCoord(x2);
    const y2Value = parseCoord(y2);
    const midX = Math.floor((x1Value + x2Value) / 2);
    const midY = Math.floor((y1Value + y2Value) / 2);

    function onCut() {
        item1Api.removeConnection(item2Api.properties().elementId);
        item2Api.removeConnection(item1Api.properties().elementId);
        setDeleteSignal(true);
    }

    function onDelete(self: UltraLightElement) {
        if (!deleteSignal()) return;
        self._cleanup?.();
        self.remove();
    }

    return UltraFragment(

        UltraComponent({
            
            component: (`
                <line
                    x1="${x1Value}"
                    y1="${y1Value}"
                    x2="${x2Value}"
                    y2="${y2Value}"
                    stroke-width="${STROKE_WIDTH}"
                    stroke="#000"
                />
            `),

            trigger: [{
                subscriber: subscribeDeleteSignal, triggerFunction: onDelete
            }]

        }),

        UltraComponent({

            component: (`
                <circle
                    cx="${midX}"
                    cy="${midY}"
                    r="${CIRCLE_RADIUS}"
                    fill="#d80606ff"
                />
            `),

            styles: {
                cursor: "pointer"
            },

            children: [
                UltraComponent({
                    component: `<title>${ifaceId}</title>`
                })
            ],

            eventHandler: { 
                'click': onCut 
            },

            trigger: [{
                subscriber: subscribeDeleteSignal, triggerFunction: onDelete
            }]

        })

    );
}