import { ultraState } from "@ultra-light";
import type { IRoutingRule, IUltraRoutingConfig } from "@/types/TConfig";

export default function ultraRoutingConfig(): IUltraRoutingConfig {

    const [
        routingRules, 
        setRoutingRules, 
        subscribeToRoutingRules
    ] = ultraState<IRoutingRule[]>([]);

    function getRule(
        destinationIp: string,
        destinationNetmask: string
    ){
        const rules = [...routingRules()];
        const rule = rules
        .find(r => 
            r.destinationIp === destinationIp
            && r.destinationNetmask === destinationNetmask
        ) || null;
        return rule;
    }

    function editRoutingRule(newRule: IRoutingRule) {
        const newRules = [...routingRules()];
        const currRule = newRules
        .find(r => 
            r.destinationIp === newRule.destinationIp
            && r.destinationNetmask === newRule.destinationNetmask
        );
        if (!currRule) throw new Error("Rule not found");
        Object.assign(currRule, newRule);
        setRoutingRules(newRules);
    }

    function addRoutingRule(rule: IRoutingRule) {

        const existingRule = getRule(
            rule.destinationIp, 
            rule.destinationNetmask
        );

        if (existingRule) {
            editRoutingRule(rule);
        }else {
            const newRules = [...routingRules(), rule];
            setRoutingRules(newRules);
        }
        
    }

    function removeRoutingRule(
        destinationIp: string,
        destinationNetmask: string,
    ) {
        const newRules = [...routingRules()]
        .filter(r => 
            r.destinationIp !== destinationIp
            || r.destinationNetmask !== destinationNetmask
        );
        setRoutingRules(newRules);
    }

    return {
        routingRules,
        subscribeToRoutingRules,
        addRoutingRule,
        removeRoutingRule,
        editRoutingRule
    }

}