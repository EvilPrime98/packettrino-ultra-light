import { UltraComponent } from "@/ultra-light/ultra-light";
import styles from "./dhcp-server-menu.module.css";

export function DhcpOptionsSection() {

    return UltraComponent({

        component: '<section></section>',

        className: [styles['dhcp-options-section']],

        children: [
            
            '<p>DHCP Options</p>',

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="dhcp-listen-on-interfaces">Listen on Interfaces:</label>',
                    UltraComponent({
                        component: '<input type="text" id="dhcp-listen-on-interfaces" name="dhcp-listen-on-interfaces">',
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="range-start">Range Start:</label>',
                    UltraComponent({
                        component: '<input type="text" id="range-start" name="range-start">',
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="range-end">Range End:</label>',
                    UltraComponent({
                        component: '<input type="text" id="range-end" name="range-end">',
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="dhcp-offer-netmask">Offer Netmask:</label>',
                    UltraComponent({
                        component: '<input type="text" id="dhcp-offer-netmask" name="dhcp-offer-netmask">',
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="dhcp-offer-gateway">Offer Gateway:</label>',
                    UltraComponent({
                        component: '<input type="text" id="dhcp-offer-gateway" name="dhcp-offer-gateway">',
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="dhcp-offer-dns">Offer DNS:</label>',
                    UltraComponent({
                        component: '<input type="text" id="dhcp-offer-dns" name="dhcp-offer-dns">',
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="dhcp-offer-lease-time">Offer Lease Time:</label>',
                    UltraComponent({
                        component: '<input type="text" id="dhcp-offer-lease-time" name="dhcp-offer-lease-time">',
                    })
                ]
            }),
            
        ]

    })

}
