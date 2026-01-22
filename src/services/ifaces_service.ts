import { TLayer3Config } from "@/types/TConfig";
import { getNetwork, isValidIp, parseCidr } from "@/utils/network_lib";
import { getBroadcast, netmaskToCidr } from "@/utils/network_lib";

/**
 * Allows interface configuration using the "ip addr" service. Returns the expected output,
 * or throws an error if the command is not valid in relation to the arguments or element API.
 *  It also creates and removes routing rules.
 * @param elementApi Network element API
 * @param $OPTS A valid "catchopts" object
 * @returns A string with the expected output
 * @throws Error if the command is not valid in relation to the element API
 */
export function ip_addr(
    elementApi: TLayer3Config,
    $OPTS: Record<string, string | number>
): string | undefined {

    if (!Object.hasOwn($OPTS, "add")
    && !Object.hasOwn($OPTS, "del")) {
        return getCurrIfaceInfo(elementApi);
    }

    const [ip, netmask] = parseCidr(
        $OPTS["add"]?.toString() 
        || $OPTS["del"]?.toString()
    );

    const ifaceId = $OPTS["dev"].toString();

    if (!isValidIp(ip)){
        throw new Error(`"${ip}" is not valid ipv4 address`);
    }

    if (!isValidIp(netmask)){
        throw new Error(`"${netmask}" is not valid ipv4 netmask`);
    }

    if (!Object.hasOwn(elementApi.getIfaces(), ifaceId)) {
        throw new Error(`Interface "${ifaceId}" not found`);
    }

    if (Object.hasOwn($OPTS, "add")) {
        
        elementApi
        .updateInterface(ifaceId, { 
            ip, 
            netmask 
        });

        elementApi
        .addRoutingRule({
            destinationIp: getNetwork(ip, netmask),
            destinationNetmask: netmask,
            gateway: ip,
            iface: ifaceId,
            nextHop: '0.0.0.0'
        });

        return `ip: added ${ip}/${netmask} to ${ifaceId}`;

    }

    if (Object.hasOwn($OPTS, "del")) {
        
        elementApi
        .updateInterface(ifaceId, { 
            ip: '', 
            netmask: '' 
        });

        elementApi
        .removeRoutingRule(
            getNetwork(ip, netmask),
            netmask
        );

        return `ip: deleted ${ip}/${netmask} from ${ifaceId}`;

    }

}

/**
 * Returns the information of the current interfaces.
 * @param elementApi 
 * @returns 
 */
function getCurrIfaceInfo(
    elementApi: TLayer3Config
): string {
    
    const ifaces = elementApi.getIfaces();
    const lines: string[] = [];

    lines.push("lo: <LOOPBACK,UP,LOWER_UP>");
    lines.push("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00");
    lines.push("    inet 127.0.0.1/8 scope host lo");
    lines.push("");

    for (const [ifaceName, ifaceData] of Object.entries(ifaces)) {

        const { ip, netmask, mac } = ifaceData;
        
        lines.push(`${ifaceName}: <BROADCAST,MULTICAST,UP,LOWER_UP>`);
        lines.push(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
        
        if (ip && netmask) {
            const cidr = netmaskToCidr(netmask);
            const broadcast = getBroadcast(ip, netmask);
            lines.push(`    inet ${ip}/${cidr} brd ${broadcast} scope global dynamic ${ifaceName}`);
        }
        
        lines.push("");

    }

    return lines.join("\n");

}