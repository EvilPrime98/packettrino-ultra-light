import { UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import type { IRouterMenuFields } from "./router-menu";
import styles from './router-menu.module.css';
import { ROUTER_MENU_CTX as rmCtx } from "@/context/modals";
import { TOASTER_CONTEXT as toCtx } from "@/components/core/toaster";
import { ip_addr } from "@/services/ifaces_service";
import { encodeCidr } from "@/utils/network_lib";

export default function BasicSection({
    onRoutingRulesChange,
    getIfaces,
    subscribeToIfaces,
}: {
    onRoutingRulesChange: () => void;
    getIfaces: () => string[];
    subscribeToIfaces: (fn: (value: string[]) => void) => () => void;
}) {

    const [getSelectedIface, setSelectedIface] = ultraState<string>("");
    const [getFields, setFields, subscribeToFields] = ultraState<IRouterMenuFields>({
        ip: "",
        netmask: ""
    });

    function onLoadIfaces(self: UltraLightElement) {
        self.innerHTML = "";
        const ifacesId = getIfaces();
        ifacesId.forEach(ifaceId => {
            self.innerHTML += `<option value="${ifaceId}">${ifaceId}</option>`;
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

    function onClose() {
        rmCtx.set({
            ...rmCtx.get(),
            "isVisible": false
        });
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
                    '<button class="btn-modern-red">Eliminar</button>',
                    '<button class="btn-modern-blue dark">Añadir</button>'
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
                        component: `<button class="btn-modern-blue dark" style="padding: 10px;">Save</button>`,
                        eventHandler: { 'click': onSave }
                    }),

                    UltraComponent({
                        component: `<button class="btn-modern-red dark" style="padding: 10px;" id="close-btn">Close</button>`,
                        eventHandler: { 'click': onClose }
                    })

                ],
            
            })

        ]

    })

}
