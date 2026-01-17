import { IUltraPcConfig } from "@/types/TConfig";
import { getNetwork, isValidIp, netmaskToCidr, parseCidr } from "@/utils/network_lib";

/**
 * Allows routing configuration using the "ip route" service. Returns the expected output,
 * or throws an error if the command is not valid in relation to the element API.
 * @param elementApi Network element API
 * @param $OPTS A valid "catchopts" object
 * @returns A string with the expected output
 * @throws Error if the command is not valid in relation to the element API
 */
export function ip_route(
    elementApi: IUltraPcConfig,
    $OPTS: Record<string, string | number>
): string | undefined {

    if (!Object.hasOwn($OPTS, "add")
    && !Object.hasOwn($OPTS, "del")) {
        return getCurrentRoutingRules(elementApi);
    }

    const [ip, netmask] = parseCidr($OPTS["add"]?.toString() || $OPTS["del"]?.toString());
    const nextHop = $OPTS["via"].toString();
    const ifaceId = $OPTS["dev"].toString();

    if (!isValidIp(ip)){
        throw new Error(`${ip} is not valid ipv4 address`);
    }

    if (!isValidIp(netmask)){
        throw new Error(`${netmask} is not valid ipv4 netmask`);
    }

    if (!isValidIp(nextHop)){
        throw new Error(`${nextHop} is not valid ipv4 address`);
    }

    if (!Object.hasOwn(elementApi.getIfaces(), ifaceId)) {
        throw new Error(`Interface ${ifaceId} not found`);
    }

    const iface = elementApi.getIfaces()[ifaceId]

    if (iface.ip === "" || iface.netmask === "") {
        throw new Error(`Interface ${ifaceId} is not configured`);
    }

    if (getNetwork(nextHop, iface.netmask) 
        !== getNetwork(iface.ip, iface.netmask)) {
        throw new Error(`Next hop ${nextHop} is unreachable from ${iface.ip}`);
    }

    if (Object.hasOwn($OPTS, "add")) {
                
        elementApi.addRoutingRule({
            destinationIp: ip,
            destinationNetmask: netmask,
            gateway: iface.ip,
            iface: ifaceId,
            nextHop: nextHop
        });

        return `ip: added ${ip}/${netmask} to ${ifaceId}`;

    }

    if (Object.hasOwn($OPTS, "del")) {

        elementApi.removeRoutingRule(
            ip, 
            netmask
        );

        return `ip: deleted ${ip}/${netmask} from ${ifaceId}`;

    }

}

/**
 * Returns the information of the current routing rules. A 0.0.0.0/0 rule
 * will be displayed as "default";
 * @param elementApi Network element API
 * @returns 
 */
function getCurrentRoutingRules(
    elementApi: IUltraPcConfig
): string {
    
    const rules = elementApi
    .routingRules();

    const lines: string[] = [];

    const defaultRule = rules.find(rule =>
        rule.destinationIp === "0.0.0.0"
        && rule.destinationNetmask === "0.0.0.0"
    )

    if (defaultRule) {
        lines.push('default' 
            + ` via ${defaultRule.gateway}` 
            + ` dev ${defaultRule.iface}`
        );
    }

    for (const rule of rules) {
        if (rule.destinationIp === "0.0.0.0") continue;
        const netmaskCIDR = netmaskToCidr(rule.destinationNetmask);
        lines.push(`${rule.destinationIp}/${netmaskCIDR}` 
            + ` via ${rule.gateway}` 
            + ` dev ${rule.iface}`
        );
    }

    return lines.join("\n");

}