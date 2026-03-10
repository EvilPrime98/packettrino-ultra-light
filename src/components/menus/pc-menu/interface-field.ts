import {
    UltraComponent,
    ultraState
} from "ultra-light.js";
import { PC_MENU_CTX as pmCtx } from "@context/pc-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import AddIcon from "@/components/icons/add-icon";
import styles from "./pc-menu.module.css";
import { IUltraPcFields } from "./pc-menu";
import { RemoveIcon } from "@/components/icons/remove-icon";
import { deconfigureInterface } from "@/services/ifaces_service";

export default function InterfaceField(
    { fields }: 
    { fields: IUltraPcFields }
) {

    const [ ifacesList, setIfacesList, subscribeIfacesList ] = ultraState<string[]>([]); 
    
    /**
     * Initial load of the interface field.
     * @param self Select HTML element.
     * @returns 
     */
    function onLoadIfaces(
        self: HTMLElement
    ) {
        if (!pmCtx.get()?.isVisible) return;
        if (!self || !(self instanceof HTMLSelectElement)) return;
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaceIds = Object.keys(elementAPI.getIfaces());
        self.innerHTML = ifaceIds
        .map(ifaceId => `<option value="${ifaceId}">${ifaceId}</option>`)
        .join('');
        setIfacesList(ifaceIds);
    };

    /**
     * Executes when the user clicks on the add interface button.
     */
    function onAddIface() {
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const newIfaceId = elementAPI.getNewIfaceId();
        try {
            elementAPI.addInterface(newIfaceId);
            toCtx.get().createNotification(
                `Interface ${newIfaceId} added successfully`,
                'success'
            )
            setIfacesList([...ifacesList(), newIfaceId]);
        } catch (error: unknown) {
            const message = error instanceof Error
            ? error.message
            : 'Unknown error';
            toCtx.get().createNotification(
                message,
                'error'
            );
        }
    }

    /**
     * Executes when the user clicks on the remove interface button.
     */
    function onDelIface(){
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaceId = fields.iface.get();
        try {
            deconfigureInterface(elementAPI, ifaceId);
            elementAPI.removeInterface(ifaceId);
            toCtx.get().createNotification(
                `Interface ${ifaceId} removed successfully`,
                'success'
            )
            setIfacesList(ifacesList().filter(iface => iface !== ifaceId));
            fields.iface.set(ifacesList()[0]);
        } catch (error: unknown) {
            const message = error instanceof Error
            ? error.message
            : 'Unknown error';
            toCtx.get().createNotification(
                message,
                'error'
            );
        }
    }

    function onSync(
        self: HTMLElement
    ) {
        self.innerHTML = ifacesList()
        .map(iface => `<option value="${iface}">${iface}</option>`)
        .join('');
    }

    return UltraComponent({

        component: `<div class="${styles['form-item']}"></div>`,

        children: [

            `<label for="iface">Interface:</label>`,

            UltraComponent({
                component: `<select id="iface" name="iface"></select>`,
                eventHandler: { 'change': (event: Event) => {
                    fields.iface.set((event.target as HTMLSelectElement).value) 
                }},
                trigger: [
                    { subscriber: pmCtx.subscribe, triggerFunction: onLoadIfaces },
                    { subscriber: subscribeIfacesList, triggerFunction: onSync }
                ]
            }),

            UltraComponent({
                component: AddIcon({ size: 55, className: styles['icon'] }),
                eventHandler: { 'click': onAddIface },
            }),

            UltraComponent({
                component: RemoveIcon({ size: 55, className: styles['icon'] }),
                eventHandler: { 'click': onDelIface },
            })

        ],

    })

}