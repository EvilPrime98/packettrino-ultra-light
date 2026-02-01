import { UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import styles from "./dhcp-server-menu.module.css";
import { ReservationsTable } from "./reservations-table";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import { TDhcpServerReservations } from "@/types/TConfig";
import { FormInput } from "@/components/core/form-input";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";

export function ReservationsSection() {

    const [
        getReservations
        ,setReservations
        ,subscribeToReservations
    ] = ultraState<TDhcpServerReservations>({});

    const [
        getFields
        , setFields
        , subscribeToFields
    ] = ultraState({
        mac: "",
        ip: ""
    });

    function onLoad() {
        if (!dsCtx.get().isVisible) {
            onCleanup();
            return;
        }
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        const reservations = serverAPI.getDHCPReservations();
        setReservations(reservations);
    }

    function addReservation() {
        const { ip, mac } = getFields();
        if (!ip || !mac) return;
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI) return;
        try {
            serverAPI.addDHCPReservation(ip, mac);
            setFields({
                ip: "",
                mac: ""
            });
            toCtx.get().createNotification(
                'Reservation added successfully!'
                , 'success'
            )
            setReservations({
                ...getReservations(),
                [ip]: { mac }
            });
        }catch(e) {
            toCtx.get().createNotification(
               (e instanceof Error) 
               ? e.message
               : 'Error adding reservation!'
                , 'error'
            )
        }
    }

    function onCleanup() {
        setReservations({});
    }

    return UltraComponent({

        component: '<section></section>',

        className: [styles['reservations-section']],

        children: [

            FormInput({
                id: "mac-for-reserve"
                , label: "MAC Address:"
                , name: "mac-for-reserve"
                , getValue: () => getFields().mac
                , changeSubscriber: subscribeToFields
                , onInput: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    setFields({
                        ...getFields(),
                        mac: target.value
                    })
                }
            }),

            FormInput({
                id: "ip-to-reserve"
                , label: "IP Address (IPv4):"
                , name: "ip-to-reserve"
                , getValue: () => getFields().ip
                , changeSubscriber: subscribeToFields
                , onInput: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    setFields({
                        ...getFields(),
                        ip: target.value
                    })
                }
            }),

            UltraComponent({
                component: '<button type="button">Add</button>',
                className: ['btn-modern-blue', 'small'],
                eventHandler: {
                    "click": addReservation
                }
            }),

            ReservationsTable({
                getReservations: getReservations,
                subscribeToReservations: subscribeToReservations
            })

        ],

        trigger: [
            { subscriber: dsCtx.subscribe, triggerFunction: onLoad }
        ]

    })

}