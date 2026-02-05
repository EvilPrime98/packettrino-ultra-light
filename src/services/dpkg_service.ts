import { ultraDhcpClientConfig } from "@/hooks/ultraDHCPClientConfig";
import ultraDhcpServerConfig from "@/hooks/ultraDHCPServerConfig";
import type { TAvailablePackages, TLayer3Config, TPackageOptions } from "@/types/TConfig";
import { PACKAGES } from "@/types/TConfig";
import { extractIfaceConfig } from "@/types/TExtractor";

export function dpkg(
    elementAPI: TLayer3Config,
    packageOptions: TPackageOptions
){

    const PACKAGE_CONFIG_MAP: Record<TAvailablePackages, any> = {
        'isc-dhcp-client': () => { return ultraDhcpClientConfig(extractIfaceConfig(elementAPI)) },
        'isc-dhcp-server': () => { return ultraDhcpServerConfig() }
    }
    
    PACKAGES.forEach(packageName => {

        if (Object.hasOwn(packageOptions, packageName) && packageOptions[packageName] === true) {
            
            elementAPI.editProperty('packageList', 
                [...elementAPI.properties().packageList, packageName]
            );

            elementAPI.install(PACKAGE_CONFIG_MAP[packageName]());
            
        }

    });

}