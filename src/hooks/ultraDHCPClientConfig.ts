import { DhcpAck } from "@/types/Tpackets";
import type { 
    IUltraDhcpClientConfig, 
    IUltraIfaceConfig, 
    IUltraRoutingConfig, 
    Lease 
} from "@/types/TConfig";
import { ultraState } from "@/ultra-light/ultra-light";
import { InterfaceDoesNotExistError } from "@/errors";
import { getNetwork } from "@/utils/network_lib";

export function ultraDhcpClientConfig(
    ifaceApi: IUltraIfaceConfig,
    routingApi: IUltraRoutingConfig
): Record<"dhcpClient", IUltraDhcpClientConfig> {

    const [ getDhcpIfaces, setDhcpIfaces,] = ultraState<string[]>([]);
    const [ getLeases, setLeases, subscribeToLeases ] = ultraState<Lease[]>([]);
    let intervalId: NodeJS.Timeout | null = null;

    /**
     * This function updates the leases of the DHCP client. It decrements the lease time of each lease by 1.
     * If the lease time is less than or equal to 0, the interface is removed from the DHCP client and the 
     * lease is removed from the leases table.
     */
    function updateLeases(){
        intervalId = setInterval(() => {
            let leases = [...getLeases()];
            for (const lease of leases) {
                lease.leasetime -= 1;
                if (lease.leasetime <= 0) {
                    ifaceApi.updateInterface(lease.ifaceId, {
                        'ip': '',
                        'netmask': ''
                    });
                    leases = leases.filter(l => l.ifaceId !== lease.ifaceId);
                }
            }
            if (leases.length === 0 && intervalId !== null) {
                console.log('Clearing interval');
                clearInterval(intervalId);
                intervalId = null;
            }
            setLeases(leases);
        }, 1000);  
    }

    /**
     * Assigns a lease to an interface.
     * @param ifaceId Interface ID.
     * @param ackPacket DHCP ACK packet with the lease information.
     */
    function assignLeaseToIface(
        ifaceId: string,
        ackPacket: DhcpAck
    ){  
        //configures the interface
        const { netmask, leasetime, yiaddr, siaddr } = ackPacket;
        ifaceApi.updateInterface(ifaceId, {
            'ip': yiaddr,
            'netmask': netmask,
        })
        //adds direct routing rule
        routingApi.addRoutingRule({
            destinationIp: getNetwork(yiaddr, netmask),
            destinationNetmask: netmask,
            gateway: yiaddr,
            iface: ifaceId,
            nextHop: '0.0.0.0'
        });
        //adds lease to the leases table
        setLeases([...getLeases(), {
            ifaceId,
            leasetime,
            serverIp: siaddr
        }]);
        if (intervalId === null) updateLeases();
    }

    /**
     * Removes a lease from an interface.
     * @param ifaceId 
     */
    function removeLeaseFromIface(
        ifaceId: string
    ) {
        //deconfigures the interface
        ifaceApi.updateInterface(ifaceId, { 
            ip: '', 
            netmask: '' 
        });
        //removes routing rules for that interface
        const currRules = routingApi.routingRules();
        currRules.forEach(rule => {
            if (rule.iface !== ifaceId) return;
            routingApi.removeRoutingRule(
                rule.destinationIp,
                rule.destinationNetmask
            );
        });
        //removes the lease from the leases table
        const currLeases = getLeases();
        setLeases(currLeases.filter(lease => lease.ifaceId !== ifaceId));
    }

    /**
     * Enables the dhcp client functionality on a given interface.
     * @param ifaceId Interface ID.
     */
    function addDhcpIface(
        ifaceId: string
    ){
        const ifaceIds = Object.keys({ ...ifaceApi.getIfaces()});
        if (!ifaceIds.includes(ifaceId)) {
            throw new InterfaceDoesNotExistError(ifaceId);
        }
        setDhcpIfaces([...getDhcpIfaces(), ifaceId]);
    }

    /**
     * Disables the dhcp client functionality on a given interface.
     * It does NOT emit a release packet for any lease.
     * @param ifaceId Interface ID.
     */
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
            removeIp: removeLeaseFromIface,
            subscribeToLeases,
            getLeases,
            addDhcpIface,
            removeDhcpIface
        }
    }

}