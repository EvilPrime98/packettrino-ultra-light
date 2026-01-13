import { 
    UltraComponent, 
    ultraState, 
    UltraActivity,
    ultraEffect
} from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/modals";
import type { PcMenuFields } from "@/types/types";
import { TOASTER_CONTEXT as toCtx } from "@/components/core/toaster";
import { PcFormValidator } from "@/schemas/pc-menu-schema";
import { dragModal } from "../../../utils/dragModal";
//import { DhcpMode, WebServerMode } from "./modes";
import InterfaceField from "./interface-field";
import InterfaceEditor from "./interface-editor";
import styles from "./pc-menu.module.css";
//import type { Props } from "./pc-menu-types";
import IpField from "./ip-field";
import NetmaskField from "./netmask-field";
import GatewayField from "./gateway-field";
//import DhcpButtons from "./dhcp-buttons";
import BasicButtons from "./basic-buttons";
import { ip_addr } from "@/services/ifaces_service";
import { ip_route } from "@/services/routing_service";
import { encodeCidr } from "@/utils/network_lib";

export default function pc_menu() {

    const [getFields, setFields, subscribeFields] = ultraState<PcMenuFields>({
        interfaceField: "",
        ipField: "",
        netmaskField: "",
        gatewayField: "",
        dhcpField: false
    })

    const [isEditing, setIsEditing, subscribeIsEditing] = ultraState(false);
    const initialClass = `${(pmCtx.get()?.isVisible) 
    ? '' 
    : styles['hidden']}`;

    function dataDumpHandler() {
        
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaces = elementAPI?.properties().ifaces;     
        const initialIfaceId = Object.keys(ifaces)[0];
        
        setFields({
            interfaceField: initialIfaceId,
            ipField: ifaces[initialIfaceId].ip,
            netmaskField: ifaces[initialIfaceId].netmask,
            gatewayField: elementAPI.getDefaultGateway(),
            dhcpField: ifaces[initialIfaceId].dhcp
        })

    }

    function pcKeyboardHandler(event: KeyboardEvent) {
        if (event.key === "Escape") closeHandler();
        if (event.key === "Enter") saveHandler();
    }

    function closeHandler() {

        pmCtx.set({
            isVisible: false,
            pcElementAPI: null,
        });

        setFields({
            interfaceField: "",
            ipField: "",
            netmaskField: "",
            gatewayField: "",
            dhcpField: false
        })

        window.removeEventListener("keydown", pcKeyboardHandler);

    }

    function saveHandler() {

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

    const effectCleanup = ultraEffect(() => {
        if (!pmCtx.get()?.isVisible) return;
        window.addEventListener("keydown", pcKeyboardHandler);
    }, [pmCtx.subscribe]);

    return (

        UltraComponent({

            component: `<form class="modal draggable-modal pc-form ${initialClass}"></form>`,

            children: [

                PcMenuFrame(),

                UltraComponent({
                    
                    component: `<section class="basic-section"></section>`,
                    
                    children: [
                        
                        InterfaceField({ 
                            getFields, 
                            setFields, 
                            subscribeFields, 
                            isEditing, 
                            setIsEditing 
                        }),

                        UltraActivity({
                            component: InterfaceEditor(),
                            mode: {
                                state: isEditing,
                                subscriber: subscribeIsEditing
                            },
                            type: 'display'
                        }),
                        
                        IpField({ getFields, setFields, subscribeFields }),
                        NetmaskField({ getFields, setFields, subscribeFields }),
                        GatewayField({ getFields, setFields, subscribeFields }),

                    ],

                }),

                //ModesWrapper({ getFields, setFields, subscribeFields }),
                //DhcpButtons({ getFields, setFields, subscribeFields }),
                BasicButtons({ closeHandler, saveHandler }),

            ],

            trigger: [{
                subscriber: pmCtx.subscribe,
                triggerFunction: (self: HTMLElement) => {
                    self.classList.toggle(styles["hidden"], !pmCtx.get()?.isVisible);
                    if (pmCtx.get()?.isVisible) dataDumpHandler();
                }
            }],
            
            cleanup: [effectCleanup]

        })

    )

}

function PcMenuFrame() {

    const { subscribe: subscribePcInfo } = pmCtx;

    const titleHandler = (self: HTMLElement) => {
        const menuData = pmCtx.get();
        if (!menuData?.isVisible) return;
        const { pcElementAPI: propertiesHandler } = menuData;
        if (!propertiesHandler) return;
        self.innerHTML = propertiesHandler.properties().elementId;
    }

    return (
        UltraComponent({
            component: `<div class="window-frame"></div>`,
            eventHandler: { "mousedown": dragModal },
            trigger: [{ subscriber: subscribePcInfo, triggerFunction: titleHandler }]
        })
    )

}

// function ModesWrapper({ getFields, setFields, subscribeFields }: Props) {

//     return (
//         UltraComponent({
            
//             component: `<section class="modes-wrapper"></section>`,

//             children: [
//                 DhcpMode({ getFields, setFields, subscribeFields }),
//                 WebServerMode()
//             ],

//         })
//     )

// }