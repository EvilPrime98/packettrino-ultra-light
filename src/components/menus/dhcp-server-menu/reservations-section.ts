import { UltraComponent } from "@/ultra-light/ultra-light";
import styles from "./dhcp-server-menu.module.css";

export function ReservationsSection() {

    function addReservation() {
        console.log("add reservation");
    }

    return UltraComponent({

        component: '<section></section>',

        className: [styles['reservations-section']],

        children: [

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="mac-for-reserve">MAC Address:</label>',
                    UltraComponent({
                        component: (`
                            <input 
                                type="text" 
                                id="mac-for-reserve" 
                                name="mac-for-reserve"
                                pattern="^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$"
                            />
                        `),
                    })
                ]
            }),

            UltraComponent({
                component: '<div></div>',
                children: [
                    '<label for="ip-to-reserve">IP Address (IPv4):</label>',
                    UltraComponent({
                        component: (`
                            <input 
                                type="text" 
                                id="ip-to-reserve" 
                                name="ip-to-reserve"
                                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                            />
                        `),
                    })
                ]
            }),

            UltraComponent({
                component: '<button type="button">Add</button>',
                className: ['btn-modern-blue', 'small'],
                eventHandler: {
                    "click": addReservation
                }
            }),

            UltraComponent({
                component: '<div></div>',
                className: [styles['reservations-table-wrapper']],
                children: [
                    UltraComponent({
                        component: '<table id="reservations-table"></table>',
                        className: [styles['inner-table']],
                        children: [
                            '<thead><tr><th>MAC</th><th>IP</th></tr></thead>',
                            UltraComponent({
                                component: '<tbody></tbody>'
                            })
                        ]
                    })
                ]
            })

        ]

    })

}