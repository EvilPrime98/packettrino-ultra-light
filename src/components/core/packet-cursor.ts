import { UltraComponent, ultraEffect, ultraState } from "@ultra-light";

export default function PacketCursor() {

    const [position, setPosition, subscribeToPosition] = ultraState({
        x: '',
        y: ''
    })

    const originalCursor = document.body.style.cursor;

    function updatePosition(self: HTMLElement){
        if (!self) return;
        self.style.top = position().y;
        self.style.left = position().x;
    }
    
    function moveCursor(event: Event) {
        if (!(event instanceof MouseEvent)) return;
        setPosition({
            x: `${event.clientX}px`,
            y: `${event.clientY}px`
        })
    }

    // function clickHandler(event: Event){
    //     event.stopPropagation();
    //     event.preventDefault();
    //     console.log('click');
    // }

    const effectCleanup = ultraEffect(() => {
        document.body.style.cursor = "none";
        document.addEventListener("mousemove", moveCursor);
        //document.addEventListener("click", clickHandler);
    }, []);

    const cursorCleanup = () => {
        document.removeEventListener("mousemove", moveCursor);
        document.body.style.cursor = originalCursor;
        //document.removeEventListener("click", clickHandler);
    } 

    return UltraComponent({
        
        component: (
            `<article class="pack-cursor">
                <img src="/assets/board/pack.svg" />
            </article>`
        ),
        
        trigger: [
            { subscriber: subscribeToPosition, triggerFunction: updatePosition }
        ],

        cleanup: [cursorCleanup, effectCleanup]

    })

}