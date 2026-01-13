import { UltraComponent, ultraState } from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/modals";
import type { PcMenuFields } from "@/types/types";
import { TOASTER_CONTEXT } from "@/components/core/toaster";
import EditIcon from "@/components/icons/edit-icon";
import AddIcon from "@/components/icons/add-icon";
import styles from "./pc-menu.module.css";

type InterfaceFieldProps = {
    getFields: () => PcMenuFields;
    setFields: (newValue: PcMenuFields) => void;
    subscribeFields: (fn: (value: PcMenuFields) => void) => () => void;
    isEditing: () => boolean;
    setIsEditing: (newValue: boolean) => void;
}

export default function InterfaceField({ 
    setFields, 
    getFields, 
    isEditing, 
    setIsEditing 
}: InterfaceFieldProps) {

    const [
        ifacesList, 
        setIfacesList, 
        subscribeIfacesList
    ] = ultraState<string[]>([]);

    const loadIfaces = (self: HTMLElement) => {
        
        if (!pmCtx.get()?.isVisible) return;
        
        if (!self || !(self instanceof HTMLSelectElement)) return;
        
        const elementAPI = pmCtx.get().pcElementAPI;
        
        if (!elementAPI) return;
        
        const ifaceIds = Object.keys(elementAPI.properties().ifaces);
        
        self.innerHTML = ifaceIds
        .map(ifaceId => `<option value="${ifaceId}">${ifaceId}</option>`)
        .join('');

        setIfacesList(ifaceIds);

    };

    const ifaceChangeHandler = (event: Event) => {
        
        const element = event.target;
        
        if (!element || !(element instanceof HTMLSelectElement)) return;
        
        const elementProperties = pmCtx.get().pcElementAPI;
        
        if (!elementProperties) return;
        
        const iface = elementProperties.properties().ifaces[element.value];
        
        if (!iface) return;

        setFields({
            ...getFields(),
            interfaceField: element.value,
            ipField: iface.ip || "",
            netmaskField: iface.netmask || "",
            dhcpField: iface.dhcp || false
        })

    }

    const addInterfaceHandler = () => {
        
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const newIfaceId = elementAPI.getNewIfaceId();

        try {

            elementAPI
            .addInterface(newIfaceId);

            TOASTER_CONTEXT.get()
            .createNotification(`Interface ${newIfaceId} added successfully`, 'success')
            
            setIfacesList([...ifacesList(), newIfaceId]);

        } catch (error: unknown) {

            const message = error instanceof Error 
            ? error.message 
            : 'Unknown error';

            TOASTER_CONTEXT.get()
            .createNotification(message, 'error');

        }
        
    }

    const editInterfaceHandler = () => {
        setIsEditing(!isEditing());
    }

    const sync = (self: HTMLElement) => {
        if (!self || !(self instanceof HTMLSelectElement)) return;
        self.innerHTML = ifacesList()
        .map(iface => `<option value="${iface}">${iface}</option>`)
        .join('');
    }

    return (

        UltraComponent({

            component: `<div class="form-item"></div>`,

            children: [

                `<label for="iface">Interface:</label>`,

                UltraComponent({
                    component: `<select id="iface" name="iface"></select>`,
                    eventHandler: { 'change': ifaceChangeHandler },
                    trigger: [
                        { subscriber: pmCtx.subscribe, triggerFunction: loadIfaces },
                        { subscriber: subscribeIfacesList, triggerFunction: sync }
                    ]
                }),

                UltraComponent({
                    component: EditIcon({ size: 55, className: styles['icon'] }),
                    eventHandler: { 'click': editInterfaceHandler },
                }),

                UltraComponent({
                    component: AddIcon({ size: 55, className: styles['icon'] }),
                    eventHandler: { 'click': addInterfaceHandler },
                })

            ],

        })

    )

}