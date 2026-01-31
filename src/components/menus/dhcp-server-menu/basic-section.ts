import { UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import styles from "./dhcp-server-menu.module.css";

export function BasicSection() {

    const [
        getIfaces,
        setIfaces,
        subscribeToIfaces
    ] = ultraState<string[]>([]);

    const [
        getSelectedIface,
        setSelectedIface,
        subscribeToSelectedIface
    ] = ultraState<string>("");

    function onLoad(){
        if (!dsCtx.get().isVisible) {
            onCleanup();
            return;
        }
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        const ifaces = serverAPI.getIfaces();
        setIfaces(Object.keys(ifaces));
        setSelectedIface(Object.keys(ifaces)[0]);
    }

    function onLoadIfaces(
        $select: HTMLElement
    ) {
        const currIfaceIds = [...getIfaces()];
        $select.innerHTML = "";
        currIfaceIds.forEach(iface => {
            $select.innerHTML += `<option value="${iface}">${iface}</option>`;
        });
    }

    function onIpChange(
        $input: UltraLightElement
    ) {
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        const iface = serverAPI.getIfaces()[getSelectedIface()];
        if (!iface) return;
        ($input as HTMLInputElement).value = iface.ip;
    }

    function onNetmaskChange(
        $input: UltraLightElement
    ) {
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        const iface = serverAPI.getIfaces()[getSelectedIface()];
        if (!iface) return;
        ($input as HTMLInputElement).value = iface.netmask;
    }

    function onIfaceChange() {
        console.log("iface change");
    }

    function onCleanup(){
        setIfaces([]);
        setSelectedIface("");
    }

    return UltraComponent({

        component: '<section></section>',

        className: [styles['main-section']],

        children: [

            UltraComponent({

                component: '<div></div>',

                children: [

                    '<label for="iface">Interface:</label>',

                    UltraComponent({
                        component: '<select id="iface" name="iface"></select>',
                        eventHandler: {
                            "change": onIfaceChange
                        },
                        trigger: [
                            { 
                                subscriber: subscribeToIfaces, 
                                triggerFunction: onLoadIfaces 
                            }
                        ]
                    })

                ]

            }),

            UltraComponent({

                component: '<div></div>',

                children: [

                    '<label for="ip">IP Address (ipv4):</label>',

                    UltraComponent({
                        component: '<input type="text" id="ip" name="ip">',
                        trigger: [{
                            subscriber: subscribeToSelectedIface,
                            triggerFunction: onIpChange
                        }]
                    })

                ]

            }),

            UltraComponent({

                component: '<div></div>',

                children: [

                    '<label for="netmask">Netmask:</label>',

                    UltraComponent({
                        component: '<input type="text" id="netmask" name="netmask">',
                        trigger: [{
                            subscriber: subscribeToSelectedIface,
                            triggerFunction: onNetmaskChange
                        }]
                    })

                ]

            }),

            UltraComponent({

                component: '<div></div>',

                children: [

                    '<label for="gateway">Gateway:</label>',

                    UltraComponent({
                        component: '<input type="text" id="gateway" name="gateway">',
                    })

                ]

            })
        ],

        trigger: [
            { subscriber: dsCtx.subscribe, triggerFunction: onLoad }
        ]

    })

}