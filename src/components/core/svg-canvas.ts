import { UltraComponent, UltraContext, ultraEffect, ultraState } from "@ultra-light";
import DefaultCable from "./default-cable";
import { CanvasContextInterface, IDefaultCableProps } from "@/types/Tcanvas";
import Packet from "./packet";

const CANVAS_CONTEXT = UltraContext<CanvasContextInterface>({
    elementApi: null,
    animationPromise: null,
    addCableElement: null,
    createPacketAnimation: async () => {},
});

export { CANVAS_CONTEXT }

export function SvgCanvas() {

    const [elementToAdd, setElementToAdd, subscribeToElementToAdd] = ultraState<IDefaultCableProps| null>(null);

    const component = UltraComponent({

        component: `
        <svg  
            id="svg-board" 
            preserveAspectRatio="none" 
            width="100%" 
            height="100%"
        >
        </svg>`,

        eventHandler: { 
            'dragover': (event: Event) => event.preventDefault() 
        },

        styles: {
            position: "absolute",
            top: "0",
            left: "0"
        },

        trigger: [
            { subscriber: subscribeToElementToAdd, triggerFunction: elementsHandler }
        ]

    })

    function elementsHandler(self: HTMLElement) {
        const element = elementToAdd();
        if (!element) return;
        self.appendChild?.(DefaultCable(element));
    }

    function addCableElement(element: IDefaultCableProps) {
        setElementToAdd(element);
    }

    async function createPacketAnimation(x1: string, y1: string, x2: string, y2: string): Promise<void> {
        // El componente Packet ahora inicia su propia animación después de montarse
        // y espera a que la animación termine antes de resolver la promesa
        component.appendChild(
            Packet({ x1, y1, x2, y2, type: "unicast" })
        );

        // Esperar a que la promesa de animación esté disponible y luego esperar a que se complete
        const promise = CANVAS_CONTEXT.get().animationPromise;
        if (promise) {
            await promise;
        }
    }

    ultraEffect(() => {
        // Preservamos elementApi del contexto existente para no sobrescribir
        // la referencia del componente Packet cuando se monta
        const currentContext = CANVAS_CONTEXT.get();
        CANVAS_CONTEXT.set({
            ...currentContext,
            addCableElement,
            createPacketAnimation
        })
    }, [])

    return component;

}