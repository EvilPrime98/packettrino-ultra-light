import { UltraComponent } from "@/ultra-light/ultra-light";
import styles from "./dhcp-server-menu.module.css";

export function BasicSection() {

    function onIfaceChange() {
        console.log("iface change");
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
                        }
                    })

                ]

            }),

            UltraComponent({

                component: '<div></div>',

                children: [

                    '<label for="ip">IP Address (ipv4):</label>',

                    UltraComponent({
                        component: '<input type="text" id="ip" name="ip">',
                    })

                ]

            }),

            UltraComponent({

                component: '<div></div>',

                children: [

                    '<label for="netmask">Netmask:</label>',

                    UltraComponent({
                        component: '<input type="text" id="netmask" name="netmask">',
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
        ]
    })

}