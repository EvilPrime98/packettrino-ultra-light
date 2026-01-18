import { UltraActivity, UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import styles from './note.module.css';
import { AdvancedOptions } from "@/components/core/adv-options";
import type { AdvancedOption } from "@/types/types";

interface TextObjectProps {
    id: string;
    x: number;
    y: number;
}

export default function TextObject({ id, x, y }: TextObjectProps) {

    const [
        getOptionsState,
        setOptionsState,
        subscribeToOptionsState
    ] = ultraState<boolean>(false);

    const [, setIsDeleting, subscribeIsDeleting] = ultraState<boolean>(false);
    const [currentEvent, setCurrentEvent,] = ultraState<Event | null>(null);

    const options: AdvancedOption[] = [
        { message: "Delete", callback: () => setIsDeleting(true) }
    ];

    function onRightClick(event: Event) {
        event.preventDefault();
        setCurrentEvent(event);
        setOptionsState(true);
    }

    function onDelete(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    function onInput(event: Event) {

        const $input = event.target as HTMLInputElement;
        const $textObject = $input.parentElement as HTMLElement;
        const content = $input.value;

        requestAnimationFrame(() => {
            const temp = document.createElement('span');
            temp.style.cssText = `
                visibility: hidden;
                position: absolute;
                white-space: pre;
                font: ${window.getComputedStyle($input).font};
            `;
            temp.textContent = content || 'W';
            document.body.appendChild(temp);
            const { width } = temp.getBoundingClientRect();
            temp.remove();
            const newWidth = Math.max(40, width + 20);
            $textObject.style.width = `${newWidth}px`;
            $textObject.style.marginLeft = `-${newWidth / 2}px`;
            $textObject.setAttribute("data-text", content);
        });

    }

    function onMouseDown(event: Event) {
        
        const mEvent = event as MouseEvent;
        const $textObject = mEvent.target as HTMLElement;
        
        if ($textObject.tagName === 'INPUT') return;
        
        const dEvent = event as DragEvent;
        const rect = $textObject.getBoundingClientRect();
        const offsetX = dEvent.clientX - rect.left - rect.width / 2;
        const offsetY = dEvent.clientY - rect.top - rect.height / 2;
        
        $textObject.style.position = 'absolute';

        function moveText(moveEvent: Event) {
            const mEvent = moveEvent as MouseEvent;
            document.body.style.cursor = "none";
            const x = mEvent.clientX - offsetX;
            const y = mEvent.clientY - offsetY;
            const maxX = window.innerWidth - $textObject.offsetWidth;
            const maxY = window.innerHeight - $textObject.offsetHeight;
            $textObject.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            $textObject.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        }

        function stopDragging() {
            document.removeEventListener('mousemove', moveText);
            document.removeEventListener('mouseup', stopDragging);
            const input = $textObject.querySelector('input');
            if (input) input.focus();
            document.body.style.cursor = "default";
        }

        document.addEventListener('mousemove', moveText);
        document.addEventListener('mouseup', stopDragging);

    }

    return UltraComponent({

        component: (`
            <article 
                class="${styles['text-annotation']}"
                id="text-${id}"
                data-text=""
            >
            </article>
        `),

        styles: {
            top: `${y}px`,
            left: `${x}px`,
        },

        children: [

            UltraActivity({

                component: AdvancedOptions({
                    onClose: () => setOptionsState(false),
                    contextClickEvent: currentEvent,
                    options: [...options],
                    subscribeAdvOptionsState: subscribeToOptionsState
                }),

                mode: {
                    state: getOptionsState,
                    subscriber: subscribeToOptionsState,
                }

            }),

            UltraComponent({

                component: `<input type="text" />`,

                eventHandler: {
                    'input': onInput
                }

            })

        ],

        eventHandler: {
            "mousedown": onMouseDown,
            "contextmenu": onRightClick
        },

        trigger: [
            {
                subscriber: subscribeIsDeleting,
                triggerFunction: onDelete
            }
        ]

    });

}