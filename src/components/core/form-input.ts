import { UltraComponent, UltraLightElement } from "@/ultra-light/ultra-light";

/**
 * Renders a form input element. The default structure is a
 * div element with an optional label and an input element.
 * @param param0 
 * @returns 
 */
export function FormInput({
    id,
    name,
    type,
    getValue,
    changeSubscriber,
    label
}:{
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
    getValue: () => string;
    /**
     * Stateful subscriber function that is triggered when the input value changes.
     */
    changeSubscriber: (fn: (value: any) => void) => () => void;
    /**
     * Type of the input. Defaults to "text".
     */
    type?: string;
    /**
     * Optional label for the input.
     */
    label?: string;
}) {

    function onChangeTrigger($input: UltraLightElement) {
        ($input as HTMLInputElement).value = getValue();
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

                trigger: [ { subscriber: changeSubscriber, triggerFunction: onChangeTrigger } ]
            })

        ]

    })

}