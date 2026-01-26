import { UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import type { IRouterMenuFields } from "./router-menu";
import styles from './router-menu.module.css';
import { ROUTER_MENU_CTX as rmCtx } from "@/context/router-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { ip_addr } from "@/services/ifaces_service";
import { encodeCidr } from "@/utils/network_lib";
import AddIcon from "@/components/icons/add-icon";

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

    const [
        getSelectedIface, 
        setSelectedIface
    ] = ultraState<string>("");

    const [
        getFields, 
        setFields, 
        subscribeToFields
    ] = ultraState<IRouterMenuFields>({
        ip: "",
        netmask: ""
    });

    function onLoadIfaces(self: UltraLightElement) {
        const $select = self as HTMLSelectElement;
        $select.innerHTML = "";
        const ifacesId = getIfaces();
        ifacesId.forEach(ifaceId => {
            $select.innerHTML += `<option value="${ifaceId}">${ifaceId}</option>`;
        });
        if (ifacesId.length > 0) {
            const firstIface = ifacesId[0];
            setSelectedIface(firstIface);
            loadIfaceData(firstIface);
        }
    }

    function loadIfaceData(ifaceId: string) {
        const routerAPI = rmCtx.get().routerElementAPI;
        if (!routerAPI) return;
        const ifaces = routerAPI.getIfaces();
        if (ifaces[ifaceId]) {
            setFields({
                ip: ifaces[ifaceId].ip,
                netmask: ifaces[ifaceId].netmask
            });
        }
    }

    function onIfaceChange(ifaceId: string) {
        setSelectedIface(ifaceId);
        loadIfaceData(ifaceId);
    }

    function onFieldsChange(field: keyof IRouterMenuFields, value: string) {
        setFields({
            ...getFields(),
            [field]: value
        });
    }

    function onSave() {

        try {

            const routerAPI = rmCtx.get().routerElementAPI;

            if (!routerAPI) return;

            const ifaceId = getSelectedIface();
            const { ip, netmask } = getFields();

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

    return UltraComponent({
        
        component: `<section id="basic-section"></section>`,
        
        children: [

            UltraComponent({
                component: `<div class="${styles['interfaces-wrapper']}"></div>`,
                children: [
                    
                    UltraComponent({
                        component: `<select id="iface"></select>`,
                        eventHandler: { 'change': (event: Event) => onIfaceChange((event.target as HTMLSelectElement).value) },
                        trigger: [{ subscriber: subscribeToIfaces, triggerFunction: onLoadIfaces }]
                    }),

                    UltraComponent({
                        component: AddIcon({ 
                            size: 26, 
                            className: styles['icon'] 
                        }),
                        eventHandler: { 'click': onAddIface },
                    })

                ]
            }),

            UltraComponent({
                
                component: (`
                    <div class="${styles['form-item']}">
                        <label for="router-ip">IP Address:</label>
                    </div>             
                `),

                children: [
                    UltraComponent({
                        component: '<input type="text" id="router-ip" name="router-ip">',
                        eventHandler: { 'input': (event: Event) => onFieldsChange('ip', (event.target as HTMLInputElement).value) },
                        trigger: [{ subscriber: subscribeToFields, triggerFunction: (self: UltraLightElement) => {
                            const ip = getFields().ip;
                            (self as HTMLInputElement).value = ip;
                        }}]
                    })
                ]

            }),

            UltraComponent({

                component: (`
                    <div class="${styles['form-item']}">
                        <label for="router-netmask">Netmask:</label>
                    </div>
                `),

                children: [
                    UltraComponent({
                        component: '<input type="text" name="router-netmask" id="router-netmask">',
                        eventHandler: { 'input': (event: Event) => onFieldsChange('netmask', (event.target as HTMLInputElement).value) },
                        trigger: [{ subscriber: subscribeToFields, triggerFunction: (self: UltraLightElement) => {
                            const netmask = getFields().netmask;
                            (self as HTMLInputElement).value = netmask;
                        }}]
                    })
                ]

            }),

            UltraComponent({
                component: (`<div class="${styles['form-item']}"></div>`),
                children: [
                    UltraComponent({
                        component: `<button class="btn-modern-blue dark">Save</button>`,
                        styles: { 'padding': '10px' },
                        eventHandler: { 'click': onSave }
                    })
                ],
            })

        ]

    })

}
