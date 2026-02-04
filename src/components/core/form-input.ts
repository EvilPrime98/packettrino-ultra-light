import { UltraComponent, UltraTrigger } from "@/ultra-light/ultra-light";

/**
 * Renders a form input element. The default structure is a
 * div element with an optional label and an input element.
 * @param param0 
 * @returns 
 */
export function FormInput({
    id,
    name,
    getValue,
    changeSubscriber,
    onInput,
    onChange,
    className,
    type,
    label,
    adTriggers
}: {
    /**
     * Unique identifier of the input.
     */
    id: string;
    /**
     * Name of the input.
     */
    name: string;
    /**
     * Stateful function that returns the current value of the input.
     */
    getValue: () => string | number | boolean;
    /**
     * Stateful subscriber function that is triggered when the input value changes.
     */
    changeSubscriber: (fn: (value: any) => void) => () => void;
    /** 
     * Optional event handler for the input element.
     */
    onInput?: (event: Event) => void;
    /**
     * Optional event handler for the input element.
     */
    onChange?: (event: Event) => void;
    /**
     * Optional class names for the input element. These will be applied to the wrapper div.
     */
    className?: string[];
    /**
     * Type of the input. Defaults to "text".
     */
    type?: string;
    /**
     * Optional label for the input.
     */
    label?: string;
    /**
     * Optional aditional triggers for the input. These will be applied to the input element.
     */
    adTriggers?: UltraTrigger[];

}) {

    if (type === 'checkbox') {

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

                    trigger: [
                        
                        {  
                            subscriber: changeSubscriber, 
                            triggerFunction: ($input: HTMLElement) => {
                                ($input as HTMLInputElement).checked = Boolean(getValue());
                            }
                        },

                        ...adTriggers || []

                    ],

                })

            ]

        })

    }

    return UltraComponent({

        component: '<div></div>',

        children: [

            (label) ? `<label for="${name}">${label}</label>` : null,

            UltraComponent({

                component: (`
                <input 
                    type="${type || 'text'}"
                    id="${id}" 
                    name="${name}"
                />
            `),

                trigger: [{ 
                    subscriber: changeSubscriber, 
                    triggerFunction: ($input: HTMLElement) => {
                        ($input as HTMLInputElement).value = getValue().toString();
                    }
                }]
            })

        ],

        eventHandler: (onInput) ? { 'input': onInput } : {}

    })

}