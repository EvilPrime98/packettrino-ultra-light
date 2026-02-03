import { DhcpAck } from "@/types/packets";
import type { IUltraDhcpClientConfig, IUltraIfaceConfig, Lease } from "@/types/TConfig";
import { ultraState } from "@/ultra-light/ultra-light";

export function ultraDhcpClientConfig(
    ifaceApi: IUltraIfaceConfig
): Record<"dhcpClient", IUltraDhcpClientConfig> {

    const [
        getLeases
        , setLeases
        , subscribeToLeases
    ] = ultraState<Lease[]>([]);

    let intervalId: NodeJS.Timeout | null = null;

    function updateLeases(){
        intervalId = setInterval(() => {
            const leases = [...getLeases()];
            for (const lease of leases) {
                lease.leasetime -= 1;
                if (lease.leasetime <= 0) {
                    ifaceApi.updateInterface(lease.ifaceId, {
                        'ip': '',
                        'netmask': ''
                    });
                    leases.filter(l => l.ifaceId !== lease.ifaceId);
                }
            }
            if (leases.length === 0 
                && intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
            setLeases(leases);
        }, 1000);
    }

    function assignLeaseToIface(
        ifaceId: string,
        ackPacket: DhcpAck
    ){  

        const { netmask, leasetime, yiaddr, siaddr } = ackPacket;

        ifaceApi.updateInterface(ifaceId, {
            'ip': yiaddr,
            'netmask': netmask,
        })

        setLeases([...getLeases(), {
            ifaceId,
            leasetime,
            serverIp: siaddr
        }]);

        if (intervalId === null) updateLeases();

    }

    return {
        "dhcpClient": {
            assignIp: assignLeaseToIface,
            subscribeToLeases,
            getLeases
        }
    }

}