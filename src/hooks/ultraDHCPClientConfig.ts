import { DhcpAck } from "@/types/Tpackets";
import type { IUltraDhcpClientConfig, IUltraIfaceConfig, Lease } from "@/types/TConfig";
import { ultraState } from "@/ultra-light/ultra-light";
import { InterfaceDoesNotExistError } from "@/errors";

export function ultraDhcpClientConfig(
    ifaceApi: IUltraIfaceConfig
): Record<"dhcpClient", IUltraDhcpClientConfig> {

    const [
        getDhcpIfaces
        , setDhcpIfaces
        ,
    ] = ultraState<string[]>([]);

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
            console.log(leases[0]);
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

    function addDhcpIface(
        ifaceId: string
    ){
        const ifaceIds = Object.keys({ ...ifaceApi.getIfaces()});
        if (!ifaceIds.includes(ifaceId)) {
            throw new InterfaceDoesNotExistError(ifaceId);
        }
        setDhcpIfaces([...getDhcpIfaces(), ifaceId]);
    }

    function removeDhcpIface(
        ifaceId: string
    ){
        const ifaceIds = Object.keys({ ...ifaceApi.getIfaces()});
        if (!ifaceIds.includes(ifaceId)) {
            throw new InterfaceDoesNotExistError(ifaceId);
        }
        setDhcpIfaces(getDhcpIfaces().filter(iface => iface !== ifaceId));
    }

    return {
        "dhcpClient": {
            getDhcpIfaces,
            assignIp: assignLeaseToIface,
            subscribeToLeases,
            getLeases,
            addDhcpIface,
            removeDhcpIface
        }
    }

}