import { ultraDhcpClientConfig } from "@/hooks/ultraDHCPClientConfig";
import ultraDhcpServerConfig from "@/hooks/ultraDHCPServerConfig";
import type { TAvailablePackages, TLayer3Config, TPackageOptions } from "@/types/TConfig";
import { PACKAGES } from "@/types/TConfig";
import { extractIfaceConfig } from "@/types/TExtractor";

export function dpkg(
    elementAPI: TLayer3Config
) {

    const dpkgService = {
        install
    };

    const PACKAGE_CONFIG_MAP: Record<TAvailablePackages, any> = {
        'isc-dhcp-client': () => { return ultraDhcpClientConfig(extractIfaceConfig(elementAPI)) },
        'isc-dhcp-server': () => { return ultraDhcpServerConfig() }
    }

    function install(
        packageOptions: TPackageOptions
    ) {
        PACKAGES.forEach(packageName => {
            if (Object.hasOwn(packageOptions, packageName) 
                && packageOptions[packageName] === true) {
                elementAPI.editProperty('packageList',
                    [...elementAPI.properties().packageList, packageName]
                );
                elementAPI.install(PACKAGE_CONFIG_MAP[packageName]());
            }
        });
    }

    return dpkgService;

}