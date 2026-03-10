import { UltraComponent } from "ultra-light.js";
import styles from "./dhcp-server-menu.module.css";
import { TDhcpServerReservations } from "@/types/TConfig";

export function ReservationsTable({
    getReservations,
    subscribeToReservations
}: {
    getReservations: () => TDhcpServerReservations;
    subscribeToReservations: (fn: (value: TDhcpServerReservations) => void) => () => void;
}) {

    function onLoad($tbody: HTMLElement) {
        const reservations = getReservations();
        $tbody.replaceChildren(...Object.keys(reservations).map(ip => 
            ReservationsTableRow({
                ip,
                mac: reservations[ip].mac,
            })
        ));
    }

    return UltraComponent({

        component: '<div></div>',

        className: [styles['reservations-table-wrapper']],

        children: [

            UltraComponent({

                component: '<table id="reservations-table"></table>',

                className: [styles['inner-table']],

                children: [

                    (`<thead>
                        <tr>
                            <th>IP</th>
                            <th>MAC</th>
                        </tr>
                    </thead>`),

                    UltraComponent({
                        component: '<tbody></tbody>',
                        trigger: [
                            {
                                subscriber: subscribeToReservations,
                                triggerFunction: onLoad
                            }
                        ]
                    })

                ]
            })
        ]
    })
}

function ReservationsTableRow({
    ip,
    mac
}: {
    ip: string;
    mac: string;
}) {

    return UltraComponent({
        component: '<tr></tr>',
        children: [
            `<td>${ip}</td>`
            ,`<td>${mac}</td>`
        ]
    })
}