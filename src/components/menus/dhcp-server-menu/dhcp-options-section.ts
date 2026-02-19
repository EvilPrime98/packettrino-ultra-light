import { UltraComponent, ultraCompState, ultraState } from "@/ultra-light/ultra-light";
import styles from "./dhcp-server-menu.module.css";
import { DHCP_SERVER_MENU_CONTEXT as dsCtx } from "@/context/dhcp-server-menu-context";
import { hasDHCPServer } from "@/types/typeguards";
import { FormInput } from "@/components/core/form-input";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { iscDhcpServerValidator } from "@/schemas/dhcp-menu-schema";

export function DhcpOptionsSection() {

    const [getState, setState, subscribeToState] = ultraState(false);
    const [getEventsCleanup, setEventsCleanup, ] = ultraState<() => void>(() => {});

    const sectionState = ultraCompState({
        listenOnInterface: '',
        rangeStart: '',
        rangeEnd: '',
        offerNetmask: '',
        offerGateway: '',
        offerDns: '',
        offerLeaseTime: 0
    });

    /**
     * This function is executed when the DHCP-Server-Menu-Context visibility changes.
     * @returns 
     */
    function onLoad() {
        if (!dsCtx.get().isVisible) {
            onCleanup();
            return;
        }
        const serverAPI = dsCtx.get().serverAPI;
        if (serverAPI && hasDHCPServer(serverAPI)) {
            const serverProperties = serverAPI.dhcpserver.getProperties();
            setState(serverProperties.state);
            sectionState.listenOnInterface.set(serverProperties.listenOnIfaces.join(", "));
            sectionState.rangeStart.set(serverProperties.offerRangeStart);
            sectionState.rangeEnd.set(serverProperties.offerRangeEnd);
            sectionState.offerNetmask.set(serverProperties.offerNetmask);
            sectionState.offerGateway.set(serverProperties.offerGateway);
            sectionState.offerDns.set(serverProperties.offerDns);
            sectionState.offerLeaseTime.set(serverProperties.offerLeaseTime);
            setEventsCleanup(onGlobalEvents());
        }
    }

    function onCleanup() {
        setState(false);
        sectionState.listenOnInterface.set("");
        sectionState.rangeStart.set("");
        sectionState.rangeEnd.set("");
        sectionState.offerNetmask.set("");
        sectionState.offerGateway.set("");
        sectionState.offerDns.set("");
        sectionState.offerLeaseTime.set(0);
        getEventsCleanup()();
        setEventsCleanup(() => {});
    }

    function onSave() {
        const serverAPI = dsCtx.get().serverAPI;
        if (!serverAPI || !hasDHCPServer(serverAPI)) return;
        const newProperties = {
            state: getState(),
            listenOnIfaces: sectionState.listenOnInterface.get().split(",").map(x => x.trim()),
            offerRangeStart: sectionState.rangeStart.get(),
            offerRangeEnd: sectionState.rangeEnd.get(),
            offerNetmask: sectionState.offerNetmask.get(),
            offerGateway: sectionState.offerGateway.get(),
            offerDns: sectionState.offerDns.get(),
            offerLeaseTime: sectionState.offerLeaseTime.get()
        }
        try {
            iscDhcpServerValidator(
                serverAPI,
                newProperties
            );
            serverAPI.dhcpserver.updateProperties(newProperties);
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

    /**
     * This function adds global event listeners to the window.
     * @returns A function that removes the event listeners.
     */
    function onGlobalEvents(){
        
        function onKeyDown(
            event: Event
        ){
            const kEvent = event as KeyboardEvent;
            if (kEvent.key === 'Enter') {
                onSave();
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }

    }

    return UltraComponent({

        component: '<section></section>',

        className: [styles['dhcp-options-section']],

        children: [

            '<p>DHCP Options</p>',

            FormInput({
                id: "dhcp-state"
                , type: "checkbox"
                , name: "dhcp-state"
                , label: "State:"
                , changeSubscriber: subscribeToState
                , getValue: getState
                , onChange: (event: Event) => {
                    setState((event.target as HTMLInputElement).checked);
                }
            }),

            FormInput({
                id: "dhcp-listen-on-interfaces"
                , name: "dhcp-listen-on-interfaces"
                , getValue: sectionState.listenOnInterface.get
                , changeSubscriber: sectionState.listenOnInterface.subscribe
                , onInput: (event: Event) => {
                    sectionState.listenOnInterface.set((event.target as HTMLInputElement).value);
                }
                , label: "Listen on Interfaces:"
            }),

            FormInput({
                id: "range-start"
                , name: "range-start"
                , getValue: sectionState.rangeStart.get
                , changeSubscriber: sectionState.rangeStart.subscribe
                , onInput: (event: Event) => {
                    sectionState.rangeStart.set((event.target as HTMLInputElement).value);
                }
                , label: "Range Start:"
            }),

            FormInput({
                id: "range-end"
                , name: "range-end"
                , getValue: sectionState.rangeEnd.get
                , changeSubscriber: sectionState.rangeEnd.subscribe
                , onInput: (event: Event) => {
                    sectionState.rangeEnd.set((event.target as HTMLInputElement).value);
                }
                , label: "Range End:"
            }),

            FormInput({
                id: "dhcp-offer-netmask"
                , name: "dhcp-offer-netmask"
                , getValue: sectionState.offerNetmask.get
                , changeSubscriber: sectionState.offerNetmask.subscribe
                , onInput: (event: Event) => {
                    sectionState.offerNetmask.set((event.target as HTMLInputElement).value);
                }
                , label: "Offer Netmask:"
            }),

            FormInput({
                id: "dhcp-offer-gateway"
                , name: "dhcp-offer-gateway"
                , getValue: sectionState.offerGateway.get
                , changeSubscriber: sectionState.offerGateway.subscribe
                , onInput: (event: Event) => {  
                    sectionState.offerGateway.set((event.target as HTMLInputElement).value);
                }
                , label: "Offer Gateway:"
            }),

            FormInput({
                id: "dhcp-offer-dns"
                , name: "dhcp-offer-dns"
                , getValue: sectionState.offerDns.get
                , changeSubscriber: sectionState.offerDns.subscribe
                , onInput: (event: Event) => {
                    sectionState.offerDns.set((event.target as HTMLInputElement).value);
                }
                , label: "Offer DNS:"
            }),

            FormInput({
                id: "dhcp-offer-lease-time"
                , name: "dhcp-offer-lease-time"
                , getValue: sectionState.offerLeaseTime.get
                , changeSubscriber: sectionState.offerLeaseTime.subscribe
                , onInput: (event: Event) => {
                    sectionState.offerLeaseTime.set(parseInt((event.target as HTMLInputElement).value));
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
