import { UltraContext, UltraFragment } from "@ultra-light";

const ENV = UltraContext({
    itemIndex: 0,
    darkMode: false,
    visualToggle: true,
    visualSpeed: 300,
    paused: false,
    ignoreArpTraffic: false,
    pcs: {},
    routers: {},
    switches: {},
    servers: {},
    $REQUEST_TIMEOUT: 300,
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
    quickPingObject: "",
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