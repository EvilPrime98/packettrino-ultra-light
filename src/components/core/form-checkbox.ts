import { UltraComponent } from "@ultra-light";

/**
 * Renders a checkbox element. The default structure is a
 * div element with an optional label and an input element.
 * @param param0 
 * @returns 
 */
export function FormCheckBox({
    id,
    name,
    label,
    className,
    subscriber,
    getValue,
    onChange
}: {
    /**
     * Unique identifier of the checkbox element.
     */
    id: string;
    /**
     * Name of the checkbox element.
     */
    name: string;
    /**
     * Optional label for the checkbox element.
     */
    label?: string;
    /**
     * Optional class names for the checkbox element. These will be applied to the wrapper div.
     */
    className?: string[];
    /**
     * Stateful subscriber function that will notify the checkbox element.
     */
    subscriber: (fn: (value: boolean) => void) => () => void;
    /**
     * Function that is triggered when the checkbox element is checked or unchecked.
     */
    getValue: () => boolean;
    /**
     * Optional event handler for the checkbox element.
     */
    onChange?: (event: Event) => void;
}) {

    function triggerFunction($input: HTMLElement) {
        ($input as HTMLInputElement).checked = getValue();
    }

    return UltraComponent({

        component: `<div></div>`,

        className: (!className) ? [] : className,

        children: [

            (label) ? `<label for="${name}">${label}</label>` : null,

            UltraComponent({

                component: (`
                    <input 
                        id="${id}" 
                        name="${name}"
                        type="checkbox" 
                        class="btn-toggle"
                    />
                `),

                eventHandler: (onChange) ? { 'change': onChange } : {},

                trigger: [{ subscriber, triggerFunction }],

            })

        ]

    })

}