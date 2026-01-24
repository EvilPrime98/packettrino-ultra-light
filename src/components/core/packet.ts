import { UltraLightElement, UltraComponent } from "@ultra-light";
import ultraPacketConfig from "@/hooks/ultraPacketConfig";
import { CANVAS_CONTEXT } from "@/context/canvas-context";
import { TAnimatedPacket } from "@/types/Tcanvas";

type Props = {
    x1: string;
    y1: string;
    x2: string;
    y2: string;
    type: TAnimatedPacket;
};

export default function Packet({ x1, y1, x2, y2, type }: Props) {

    const api = ultraPacketConfig({ x1, y1, x2, y2, type });
    let animationPromise: Promise<void> | null = null;

    function deleteHandler(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    function updatePosition(self: UltraLightElement) {
        self.setAttribute("x", api.getPositions().x);
        self.setAttribute("y", api.getPositions().y);
    }


    animationPromise = new Promise<void>((resolve) => {
        requestAnimationFrame(async () => {
            await api.startAnimation();
            resolve();
        });
    });

    CANVAS_CONTEXT.set({
        ...CANVAS_CONTEXT.get(),
        elementApi: api,
        animationPromise
    })

    return UltraComponent({

        component: (
            `<image
                href="/assets/packets/${type}.png"
                width="50"
                height="50"
                x="${api.getPositions().x}"
                y="${api.getPositions().y}"
            />`
        ),

        trigger: [
            { subscriber: api.subscribeToDeleteSignal, triggerFunction: deleteHandler },
            { subscriber: api.subscribeToPositions, triggerFunction: updatePosition }
        ],

    });

}