import { TLayer3Config } from "@/types/TConfig";
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
    /**
     * Returns true or false whether to track traffic.
     */
    trackTraffic: boolean;
    /**
     * Returns true or false whete ARP traffic is ignored.
     */
    ignoreArpTraffic: boolean;
    /**
     * Returns the current request timeout in seconds.
     */
    $REQUEST_TIMEOUT: number;
    /**
     * Returns the current ARP entry TTL in seconds.
     */
    $ARPENTRYTTL: number;
    /**
     * Returns the minimum ARP entry TTL in seconds.
     */
    $MINARPENTRYTTL: number;
    /**
     * Returns the maximum ARP entry TTL in seconds.
     */
    $MAXARPENTRYTTL: number;
    /**
     * Returns the current MAC entry TTL in seconds.
     */
    $MACENTRYTTL: number;
    /**
     * Returns true or false whether Quick Ping mode is enabled.
     */
    quickPingMode: boolean;
    /**
     * Returns the current Quick Ping object.
     */
    quickPingObject: Array<TLayer3Config>;
}

const ENV = UltraContext<IEnv>({
    itemIndex: 0,
    darkMode: false,
    visualToggle: true,
    visualSpeed: 300,
    ignoreArpTraffic: false,
    trackTraffic: true,
    $REQUEST_TIMEOUT: 100000,
    $ARPENTRYTTL: 400,
    $MINARPENTRYTTL: 120,
    $MAXARPENTRYTTL: 600,
    $MACENTRYTTL: 120,
    quickPingMode: false,
    quickPingObject: []
});

export { ENV as ENV };

export function ENV_PROVIDER(...children: string[] | HTMLElement[] | Node[]) {

    return (
        UltraFragment(
            ...children
        )
    )

}