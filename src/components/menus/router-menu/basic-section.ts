import { UltraComponent, ultraCompState, UltraLightElement } from "ultra-light.js";
import styles from './router-menu.module.css';
import { ROUTER_MENU_CTX as rmCtx } from "@/context/router-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { deconfigureInterface, ip_addr } from "@/services/ifaces_service";
import { encodeCidr } from "@/utils/network_lib";
import AddIcon from "@/components/icons/add-icon";
import { FormInput } from "@/components/core/form-input";
import { RemoveIcon } from "@/components/icons/remove-icon";

export default function BasicSection({
    onRoutingRulesChange,
    getIfaces,
    subscribeToIfaces,
    refreshIfaces
}: {
    onRoutingRulesChange: () => void;
    getIfaces: () => string[];
    subscribeToIfaces: (fn: (value: string[]) => void) => () => void;
    refreshIfaces: () => void;
}) {

    const fields = ultraCompState({
        iface: "",
        ip: "",
        netmask: ""
    })

    /**
     * Executes when the component is loaded.
     * @param self - HTML Select element
     */
    function onLoad(
        self: UltraLightElement
    ) {
        const $select = self as HTMLSelectElement;
        $select.innerHTML = "";
        const ifacesId = getIfaces();
        ifacesId.forEach(ifaceId => {
            $select.innerHTML += `<option value="${ifaceId}">${ifaceId}</option>`;
        });
        if (ifacesId.length > 0) {
            const firstIface = ifacesId[0];
            fields.iface.set(firstIface);
        }
    }

    /**
     * Executes when the selected interface changes.
     */
    function onIfaceChange() {
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const ifaces = routerAPI.getIfaces();
        const ifaceId = fields.iface.get();
        if (ifaces[ifaceId]) {
            fields.ip.set(ifaces[ifaceId].ip);
            fields.netmask.set(ifaces[ifaceId].netmask);
        }
    }

    /**
     * Executes when the user clicks on the save button.    
     */
    function onSave() {
        try {
            const routerAPI = rmCtx.get().routerElementAPI;
            if (!routerAPI) return;
            const ifaceId = fields.iface.get();
            const ip = fields.ip.get();
            const netmask = fields.netmask.get();
            if (!ip || !netmask) {
                throw new Error("Some of the fields are empty");
            }
            ip_addr(routerAPI, {
                'add': encodeCidr(ip, netmask),
                'dev': ifaceId,
            });
            onRoutingRulesChange();
            toCtx.get().createNotification(
                `IP address ${ip} added to ${ifaceId}`,
                "success"
            );
        } catch (e) {
            toCtx.get().createNotification(
                `Error: ${(e instanceof Error) ? e.message : 'Unknown Error'}`,
                "error"
            );
        }
    }
    
    /**
     * Executes when the user clicks on the add interface button.
     */
    function onAddIface() {
        const elementAPI = rmCtx.get().routerElementAPI;
        if (!elementAPI) return;
        const newIfaceId = elementAPI.getNewIfaceId();
        try {
            elementAPI.addInterface(newIfaceId);
            toCtx.get().createNotification(
                `Interface ${newIfaceId} added successfully`,
                "success"
            );
            refreshIfaces();
        } catch (error: unknown) {
            const message = error instanceof Error
            ? error.message
            : "Unknown error";
            toCtx.get().createNotification(
                message,
                "error"
            );
        }
    }

    /**
     * Executes when the user clicks on the remove interface button.
     * @returns 
     */
    function onDelIface() {
        const elementAPI = rmCtx.get().routerElementAPI;
        if (!elementAPI) return;
        const ifaceId = fields.iface.get();
        try {
            deconfigureInterface(elementAPI, ifaceId);
            elementAPI.removeInterface(ifaceId);
            toCtx.get().createNotification(
                `Interface ${ifaceId} removed successfully`,
                "success"
            );
            refreshIfaces();
            onRoutingRulesChange();
        } catch (error: unknown) {
            const message = error instanceof Error
            ? error.message
            : "Unknown error";
            toCtx.get().createNotification(
                message,
                "error"
            );
        }
    }

    return UltraComponent({
        
        component: `<section id="basic-section"></section>`,
        
        children: [

            UltraComponent({
                
                component: `<div class="${styles['interfaces-wrapper']}"></div>`,
                
                children: [
                    
                    UltraComponent({
                        component: `<select id="iface"></select>`,
                        eventHandler: { 'change': (event: Event) => {
                            fields.iface.set((event.target as HTMLSelectElement).value);
                        }},
                        trigger: [{ subscriber: subscribeToIfaces, triggerFunction: onLoad }]
                    }),

                    UltraComponent({
                        component: AddIcon({ 
                            size: 26, 
                            className: styles['icon'] 
                        }),
                        eventHandler: { 'click': onAddIface },
                    }),

                    UltraComponent({
                        component: RemoveIcon({ size: 26, className: styles['icon'] }),
                        eventHandler: { 'click': onDelIface },
                    })

                ]

            }),

            FormInput({
                id: 'router-ip',
                name: 'router-ip',
                label: 'IP Address:',
                className: [styles['form-item']],
                getValue: () => fields.ip.get(),
                changeSubscriber: fields.ip.subscribe,
                onInput: (event: Event) => {
                    event.stopPropagation();
                    const $input = event.target as HTMLInputElement;
                    fields.ip.set($input.value);
                },
            }),

            FormInput({
                id: 'router-netmask',
                name: 'router-netmask',
                label: 'Netmask:',
                className: [styles['form-item']],
                getValue: () => fields.netmask.get(),
                changeSubscriber: fields.netmask.subscribe,
                onInput: (event: Event) => {
                    event.stopPropagation();
                    const $input = event.target as HTMLInputElement;
                    fields.netmask.set($input.value);
                },
            }),

            UltraComponent({
                component: (`<div class="${styles['form-item']}"></div>`),
                children: [
                    UltraComponent({
                        component: '<button>Save</button>',
                        className: ['btn-modern-blue', 'dark'],
                        styles: { 'padding': '10px' },
                        eventHandler: { 'click': onSave }
                    })
                ],
            })

        ],

        trigger: [
            {
                subscriber: fields.iface.subscribe,
                triggerFunction: onIfaceChange
            }
        ]

    })

}
