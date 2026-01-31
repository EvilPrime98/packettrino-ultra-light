import { UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import styles from "./dhcp-server-menu.module.css";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import { hasDHCPServer } from "@/types/TConfig";
import { FormInput } from "@/components/core/form-input";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { iscDhcpServerValidator } from "@/services/isc-dhcp-service";
import { FormCheckBox } from "@/components/core/form-checkbox";

export function DhcpOptionsSection() {

    const [getState, setState, subscribeToState] = ultraState(false);
    const [getListenOnInterfaces, setListenOnInterfaces, subscribeToListenOnInterfaces] = ultraState("");
    const [getRangeStart, setRangeStart, subscribeToRangeStart] = ultraState("");
    const [getRangeEnd, setRangeEnd, subscribeToRangeEnd] = ultraState("");
    const [getOfferNetmask, setOfferNetmask, subscribeToOfferNetmask] = ultraState("");
    const [getOfferGateway, setOfferGateway, subscribeToOfferGateway] = ultraState("");
    const [getOfferDns, setOfferDns, subscribeToOfferDns] = ultraState("");
    const [getOfferLeaseTime, setOfferLeaseTime, subscribeToOfferLeaseTime] = ultraState(0);

    function onLoad() {
        if (!dsCtx.get().isVisible) {
            onCleanup();
            return;
        }
        const serverAPI = dsCtx.get().serverAPI;
        if (serverAPI && hasDHCPServer(serverAPI)) {
            const serverProperties = serverAPI.getDHCPServerProperties();
            setState(serverProperties.state);
            setListenOnInterfaces(serverProperties.listenOnIfaces.join(", "));
            setRangeStart(serverProperties.offerRangeStart);
            setRangeEnd(serverProperties.offerRangeEnd);
            setOfferNetmask(serverProperties.offerNetmask);
            setOfferGateway(serverProperties.offerGateway);
            setOfferDns(serverProperties.offerDns);
            setOfferLeaseTime(serverProperties.offerLeaseTime);
        }
    }

    function onCleanup() {
        setState(false);
        setListenOnInterfaces("");
        setRangeStart("");
        setRangeEnd("");
        setOfferNetmask("");
        setOfferGateway("");
        setOfferDns("");
        setOfferLeaseTime(0);
    }

    function onSave() {
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI || !hasDHCPServer(serverAPI)) return;
        const newProperties = {
            state: getState(),
            listenOnIfaces: getListenOnInterfaces().split(",").map(x => x.trim()),
            offerRangeStart: getRangeStart(),
            offerRangeEnd: getRangeEnd(),
            offerNetmask: getOfferNetmask(),
            offerGateway: getOfferGateway(),
            offerDns: getOfferDns(),
            offerLeaseTime: getOfferLeaseTime()
        }
        try {
            iscDhcpServerValidator(
                serverAPI,
                newProperties
            );
            serverAPI.updateDHCPServerProperties(newProperties);
            toCtx.get().createNotification(
                'DHCP Server Options Saved',
                'success'
            )
        } catch (e) {
            const errorMessage = e instanceof Error
            ? e.message
            : 'Error Saving DHCP Server Options';
            toCtx.get().createNotification(
                errorMessage,
                'error'
            )
        }
    }

    return UltraComponent({

        component: '<section></section>',

        className: [styles['dhcp-options-section']],

        children: [

            '<p>DHCP Options</p>',

            FormCheckBox({
                id: "dhcp-state"
                , name: "dhcp-state"
                , label: "State:"
                , subscriber: subscribeToState
                , getValue: getState
                , onChange: (event: Event) => {
                    setState((event.target as HTMLInputElement).checked);
                }
            }),

            FormInput({
                id: "dhcp-listen-on-interfaces"
                , name: "dhcp-listen-on-interfaces"
                , getValue: getListenOnInterfaces
                , changeSubscriber: subscribeToListenOnInterfaces
                , onInput: (event: Event) => {
                    setListenOnInterfaces((event.target as HTMLInputElement).value);
                }
                , label: "Listen on Interfaces:"
            }),

            FormInput({
                id: "range-start"
                , name: "range-start"
                , getValue: getRangeStart
                , changeSubscriber: subscribeToRangeStart
                , onInput: (event: Event) => {
                    setRangeStart((event.target as HTMLInputElement).value);
                }
                , label: "Range Start:"
            }),

            FormInput({
                id: "range-end"
                , name: "range-end"
                , getValue: getRangeEnd
                , changeSubscriber: subscribeToRangeEnd
                , onInput: (event: Event) => {
                    setRangeEnd((event.target as HTMLInputElement).value);
                }
                , label: "Range End:"
            }),

            FormInput({
                id: "dhcp-offer-netmask"
                , name: "dhcp-offer-netmask"
                , getValue: getOfferNetmask
                , changeSubscriber: subscribeToOfferNetmask
                , onInput: (event: Event) => {
                    setOfferNetmask((event.target as HTMLInputElement).value);
                }
                , label: "Offer Netmask:"
            }),

            FormInput({
                id: "dhcp-offer-gateway"
                , name: "dhcp-offer-gateway"
                , getValue: getOfferGateway
                , changeSubscriber: subscribeToOfferGateway
                , onInput: (event: Event) => {
                    setOfferGateway((event.target as HTMLInputElement).value);
                }
                , label: "Offer Gateway:"
            }),

            FormInput({
                id: "dhcp-offer-dns"
                , name: "dhcp-offer-dns"
                , getValue: getOfferDns
                , changeSubscriber: subscribeToOfferDns
                , onInput: (event: Event) => {
                    setOfferDns((event.target as HTMLInputElement).value);
                }
                , label: "Offer DNS:"
            }),

            FormInput({
                id: "dhcp-offer-lease-time"
                , name: "dhcp-offer-lease-time"
                , getValue: getOfferLeaseTime
                , changeSubscriber: subscribeToOfferLeaseTime
                , onInput: (event: Event) => {
                    setOfferLeaseTime(parseInt((event.target as HTMLInputElement).value));
                }
                , label: "Offer Lease Time:"
            }),

            UltraComponent({
                component: '<button type="button">Save</button>',
                className: ['btn-modern-blue', 'dark'],
                eventHandler: { click: onSave }
            })

        ],

        trigger: [
            { subscriber: dsCtx.subscribe, triggerFunction: onLoad }
        ]

    })

}
