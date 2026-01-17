import { IUltraPcConfig } from "@/types/TConfig";
import { UltraContext, UltraFragment } from "@ultra-light";

interface IEnv {
    /**
     * Returns the next available item index.
     */
    itemIndex: number;
    /**
     * Returns true or false whether dark mode is enabled.
     */
    darkMode: boolean;
    /**
     * Returns true or false whether visual effects are enabled.
     */
    visualToggle: boolean;
    /**
     * Returns the speed of visual effects.
     */
    visualSpeed: number;
    paused: boolean;
    ignoreArpTraffic: boolean;
    /**
     * Returns true or false whether to track traffic.
     */
    trackTraffic: boolean;
    pcs: Record<string, string>;
    routers: Record<string, string>;
    switches: Record<string, string>;
    servers: Record<string, string>;
    $REQUEST_TIMEOUT: number;
    $ARPENTRYTTL: number;
    $MACENTRYTTL: number;
    arpFlag: Record<string, boolean>;
    icmpFlag: Record<string, boolean>;
    dhcpDiscoverFlag: Record<string, boolean>;
    dhcpRequestFlag: Record<string, boolean>;
    dnsRequestFlag: Record<string, boolean>;
    tcpSyncFlag: Record<string, boolean>;
    traceFlag: Record<string, boolean>;
    quickPingMode: boolean;
    quickPingObject: Array<IUltraPcConfig>;
    trace: Record<string, string>;
    traceReturn: Record<string, string>;
    nodes: Record<string, string>;
    nodesNetmask: Record<string, string>;
    nodesIp: Record<string, string>;
    defaultNetwork: string;
    buffer: Record<string, string>;
    httpBuffer: Record<string, string>;
    dhcpOfferBuffer: Record<string, string>;
    tcpBuffer: Record<string, string>;
    traceBuffer: Record<string, string>;
    trafficBuffer: Array<string>;
    routerChangesBuffer: Record<string, string>;
    serverLeaseTimers: Record<string, ReturnType<typeof setTimeout>>;
    clientLeaseTimers: Record<string, ReturnType<typeof setTimeout>>;
    arpEntryTimers: Record<string, ReturnType<typeof setTimeout>>;
    macEntryTimers: Record<string, ReturnType<typeof setTimeout>>;
    dnsCacheTimers: Record<string, ReturnType<typeof setTimeout>>;
    connTrack: Record<string, string>;
}

const ENV = UltraContext<IEnv>({
    itemIndex: 0,
    darkMode: false,
    visualToggle: true,
    visualSpeed: 300,
    paused: false,
    ignoreArpTraffic: false,
    trackTraffic: true,
    pcs: {},
    routers: {},
    switches: {},
    servers: {},
    $REQUEST_TIMEOUT: 100000,
    $ARPENTRYTTL: 120,
    $MACENTRYTTL: 120,
    arpFlag: {},
    icmpFlag: {},
    dhcpDiscoverFlag: {},
    dhcpRequestFlag: {},
    dnsRequestFlag: {},
    tcpSyncFlag: {},
    traceFlag: {},
    quickPingMode: false,
    quickPingObject: [],
    trace: {},
    traceReturn: {},
    nodes: {},
    nodesNetmask: {},
    nodesIp: {},
    defaultNetwork: "",
    buffer: {},
    httpBuffer: {},
    dhcpOfferBuffer: {},
    tcpBuffer: {},
    traceBuffer: {},
    trafficBuffer: [],
    routerChangesBuffer: {},
    serverLeaseTimers: {},
    clientLeaseTimers: {},
    arpEntryTimers: {},
    macEntryTimers: {},
    dnsCacheTimers: {},
    connTrack: {}
});

export { ENV as ENV };

export function ENV_PROVIDER(...children: string[] | HTMLElement[] | Node[]) {

    return (
        UltraFragment(
            ...children
        )
    )

}