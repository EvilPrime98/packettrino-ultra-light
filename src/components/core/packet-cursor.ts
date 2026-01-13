import { UltraLightElement, UltraComponent, ultraState } from "@ultra-light";

export default function PacketCursor() {

    const [position, setPosition, subscribeToPosition] = ultraState({
        x: '',
        y: ''
    })

    const updatePosition = (self: HTMLElement) => {
        if (!self) return;
        self.style.top = position().y;
        self.style.left = position().x;
    }

    const component: UltraLightElement = UltraComponent({
        component: (
            `<article class="pack-cursor">
                <img src="/assets/board/pack.svg" />
            </article>`
        ),
        trigger: [
            { subscriber: subscribeToPosition, triggerFunction: updatePosition }
        ]
    })
    
    const originalCursor = document.body.style.cursor;
    
    document.body.style.cursor = "none";

    function moveCursor(event: Event) {
        console.log('activado')
        if (!(event instanceof MouseEvent)) return;
        setPosition({
            x: `${event.clientX}px`,
            y: `${event.clientY}px`
        })
    }

    document.addEventListener("mousemove", moveCursor);

    const originalCleanup = component._cleanup;

    component._cleanup = () => {
        if (originalCleanup) originalCleanup();
        document.removeEventListener("mousemove", moveCursor);
        document.body.style.cursor = originalCursor;
    } 

    return component;

}