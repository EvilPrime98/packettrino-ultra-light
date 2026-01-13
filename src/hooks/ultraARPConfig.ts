import { ENV } from "@/context/env";
import { ultraState } from "@ultra-light";
import type { ArpCache, IUltraARPConfig } from "@/types/TConfig";

/**
 * Custom hook for managing the ARP cache of a network element.
 * @returns 
 */
export default function ultraARPConfig(): IUltraARPConfig {

    const [getARPCache, setArpCache, subscribeToArpCache] = ultraState<ArpCache>({});

    function addArpCache(ip: string, mac: string) {

        const currentArpCache = structuredClone(getARPCache());

        if (Object.hasOwn(currentArpCache, ip)) {
            const currentEntry = currentArpCache[ip];
            clearTimeout(currentEntry.timeOutId);
        }

        currentArpCache[ip] = {
            mac: mac,
            timeOutId: setTimeout(() => {
                deleteArpCache(ip);
            }, ENV.get().$ARPENTRYTTL * 1000)
        };

        setArpCache(currentArpCache);


    }

    function deleteArpCache(ip: string) {
        const currentArpCache = structuredClone(getARPCache());
        const { [ip]: _removed, ...remainingArpCache } = currentArpCache;
        setArpCache(remainingArpCache);
    }

    return {
        getARPCache,
        subscribeToArpCache,
        addArpCache,
        deleteArpCache
    }

}