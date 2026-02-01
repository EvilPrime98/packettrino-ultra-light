import {
    UltraComponent,
    ultraState,
    UltraActivity,
} from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/pc-menu-context";
import type { PcMenuFields } from "@/types/types";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { PcFormValidator } from "@/schemas/pc-menu-schema";
import InterfaceField from "./interface-field";
import styles from "./pc-menu.module.css";
import IpField from "./ip-field";
import NetmaskField from "./netmask-field";
import GatewayField from "./gateway-field";
import BasicButtons from "./basic-buttons";
import { ip_addr } from "@/services/ifaces_service";
import { ip_route } from "@/services/routing_service";
import { encodeCidr } from "@/utils/network_lib";
import PcMenuFrame from "./pc-menu-frame";
import Ipv4Forwarding from "./ipv4-forwarding";

export default function PcMenu() {

    const [getFields, setFields, subscribeFields] = ultraState<PcMenuFields>({
        interfaceField: "",
        ipField: "",
        netmaskField: "",
        gatewayField: "",
        dhcpField: false
    })

    const [eventCleaner, setEventCleaner] = ultraState<(() => void) | null>(null);

    function onStart() {

        setEventCleaner(onGlobalEvents());

        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaces = elementAPI.getIfaces();
        const initialIfaceId = Object.keys(ifaces)[0];

        setFields({
            interfaceField: initialIfaceId,
            ipField: ifaces[initialIfaceId].ip,
            netmaskField: ifaces[initialIfaceId].netmask,
            gatewayField: elementAPI.getDefaultGateway(),
            dhcpField: ifaces[initialIfaceId].dhcp
        })

    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
        if (event.key === "Enter") onSave();
    }

    function onClose() {
        onCleanup();
        pmCtx.get().update({
            isVisible: false,
            pcElementAPI: null,
        });
    }

    function onSave() {

        if (!pmCtx.get()?.isVisible) return;

        const { pcElementAPI } = pmCtx.get();

        if (!pcElementAPI) return;

        const {
            ipField: ip,
            netmaskField: netmask,
            gatewayField: gateway,
            interfaceField: ifaceId
        } = getFields();

        try {

            PcFormValidator({
                newIp: ip,
                newNetmask: netmask,
                newGateway: gateway,
                newDnsServers: []
            });

            ip_addr(pcElementAPI, {
                "add": encodeCidr(ip, netmask),
                "dev": ifaceId
            });

            if (gateway) {
                ip_route(pcElementAPI, {
                    "add": encodeCidr("0.0.0.0", "0.0.0.0"),
                    "via": gateway,
                    "dev": ifaceId
                });
            }

            toCtx.get()
                .createNotification(
                    `Interface ${getFields().interfaceField.toUpperCase()} updated successfully!`,
                    'success'
                )

        } catch (error: unknown) {

            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error';

            toCtx.get()
                .createNotification(
                    errorMessage,
                    'error'
                )

        }

    }

    function onGlobalEvents() {

        window.addEventListener("keydown", onKeydown);

        return () => {
            window.removeEventListener("keydown", onKeydown);
        }

    }

    function onCleanup() {

        eventCleaner()?.();

        setFields({
            interfaceField: "",
            ipField: "",
            netmaskField: "",
            gatewayField: "",
            dhcpField: false
        })

    }

    return UltraActivity({

        mode: {
            state: () => pmCtx.get()?.isVisible,
            subscriber: pmCtx.subscribe
        },

        component: `<form class="modal draggable-modal ${styles['pc-form']} "></form>`,

        children: [

            PcMenuFrame({ onClose }),

            UltraComponent({

                component: `<section class="basic-section"></section>`,

                children: [

                    InterfaceField({
                        getFields,
                        setFields,
                        subscribeFields
                    }),

                    IpField({ getFields, setFields, subscribeFields }),

                    NetmaskField({ getFields, setFields, subscribeFields }),

                    GatewayField({ getFields, setFields, subscribeFields }),

                    Ipv4Forwarding()

                ],

            }),

            BasicButtons({ saveHandler: onSave }),

        ],

        trigger: [{
            subscriber: pmCtx.subscribe,
            triggerFunction: (self: HTMLElement) => {
                self.classList.toggle(styles["hidden"], !pmCtx.get()?.isVisible);
                if (pmCtx.get()?.isVisible) onStart();
            }
        }]

    })

}