import { ENV } from "@/context/env-context";
import { IUltraPacketConfig } from "@/types/Tcanvas";
import { ultraState } from "@ultra-light";

type Props = {
    x1: string;
    y1: string;
    x2: string;
    y2: string;
    type: string;
};


export default function ultraPacketConfig({ x1, y1, x2, y2 }: Props): IUltraPacketConfig {

    const [, setDeleteSignal, subscribeToDeleteSignal] = ultraState(false);
    const [positions, setPositions, subscribeToPositions] = ultraState({ x: x1, y: y1 });
    let startTime: number | null = null;
    let animationResolve: (() => void) | null = null;

    function animateMove(time?: number) {

        if (startTime === null) startTime = time ?? performance.now();

        const elapsed = (time ?? performance.now()) - startTime;
        const duration = ENV.get().visualSpeed;
        const progress = Math.min(elapsed / duration, 1);

        const x1Num = parseFloat(x1);
        const y1Num = parseFloat(y1);
        const x2Num = parseFloat(x2);
        const y2Num = parseFloat(y2);

        const currentX = x1Num + (x2Num - x1Num) * progress;
        const currentY = y1Num + (y2Num - y1Num) * progress;

        setPositions({ x: currentX.toString(), y: currentY.toString() });

        if (progress < 1) {
            requestAnimationFrame((t) => animateMove(t));
        } else {
            startTime = null;
            setDeleteSignal(true);
            if (animationResolve) {
                animationResolve();
                animationResolve = null;
            }
        }

    }

    async function startAnimation() {
        return new Promise<void>((resolve) => {
            animationResolve = resolve;
            requestAnimationFrame((t) => animateMove(t));
        });
    }

    function getPositions() {
        return positions();
    }

    function updatePosition(x: string, y: string) {
        const newPosition = { x, y };
        setPositions(newPosition);
    }

    function deleteElement() {
        setDeleteSignal(true);
    }
    
    return {
        getPositions,
        updatePosition,
        subscribeToPositions,
        deleteElement,
        subscribeToDeleteSignal,
        startAnimation
    }

}