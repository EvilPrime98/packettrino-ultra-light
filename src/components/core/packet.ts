import { UltraLightElement, UltraComponent, ultraEffect } from "@ultra-light";
import ultraPacketConfig from "@/hooks/ultraPacketConfig";
import { CANVAS_CONTEXT } from "./svg-canvas";

type Props = {
    x1: string;
    y1: string;
    x2: string;
    y2: string;
    type: string;
};

export default function Packet({ x1, y1, x2, y2, type }: Props) {

    const selfConfig = ultraPacketConfig({ x1, y1, x2, y2, type });
    let animationPromise: Promise<void> | null = null;

    function deleteHandler(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    function updatePosition(self: UltraLightElement) {
        self.setAttribute("x", selfConfig.getPositions().x);
        self.setAttribute("y", selfConfig.getPositions().y);
    }

    ultraEffect( () => {

        animationPromise = new Promise<void>((resolve) => {
            requestAnimationFrame(async () => {
                await selfConfig.startAnimation();
                resolve();
            });
        });

        CANVAS_CONTEXT.set({
            ...CANVAS_CONTEXT.get(),
            elementApi: selfConfig,
            animationPromise
        })

    }, []);

    return UltraComponent({

        component: (
            `<image
                href="/assets/packets/${type}.png"
                width="50"
                height="50"
                x="${selfConfig.getPositions().x}"
                y="${selfConfig.getPositions().y}"
            />`
        ),

        trigger: [
            { subscriber: selfConfig.subscribeToDeleteSignal, triggerFunction: deleteHandler },
            { subscriber: selfConfig.subscribeToPositions, triggerFunction: updatePosition }
        ],

    });

}