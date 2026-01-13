import { PcFormValidationError } from "@/errors";
import { PcFormValidatorData } from "@/types/types";
import { isValidIp } from "@/utils/network_lib";

type ValidationRule = {
    value: string | string[] | undefined;
    fieldName: string;
    validator: (value: string) => boolean;
};

/**
 * Validates the form data of the PC menu. Throws an error if the data is invalid.
 * @param data
 * @throws PcFormValidationError
 */
export function PcFormValidator(data: PcFormValidatorData): void {

    const rules: ValidationRule[] = [
        { value: data.newIp, fieldName: "IP address", validator: isValidIp },
        { value: data.newNetmask, fieldName: "Netmask", validator: isValidIp },
        { value: data.newGateway, fieldName: "Gateway", validator: isValidIp },
    ];

    for (const { value, fieldName, validator } of rules) {
        if (value && !validator(value as string)) {
            throw new PcFormValidationError(`Invalid ${fieldName}: "${value}"`);
        }
    }

    if (data.newDnsServers?.length > 0) {

        const invalidDns = data.newDnsServers.filter(dns => !isValidIp(dns));
        
        if (invalidDns.length > 0) {
            throw new PcFormValidationError(
                `Invalid DNS server(s): ${invalidDns.join(", ")}`
            );
        }

    }
    
}