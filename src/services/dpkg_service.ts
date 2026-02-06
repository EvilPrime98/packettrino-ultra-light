import { ultraDhcpClientConfig } from "@/hooks/ultraDHCPClientConfig";
import ultraDhcpServerConfig from "@/hooks/ultraDHCPServerConfig";
import type { TAvailablePackages, TLayer3Config, TPackageOptions } from "@/types/TConfig";
import { PACKAGES } from "@/types/TConfig";
import { extractIfaceConfig } from "@/types/TExtractor";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";

interface IDpkgInstallOptions {
    verbose?: boolean;
}

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
        packageOptions: TPackageOptions,
        options?: IDpkgInstallOptions
    ) {

        if (!options) options = {
            verbose: false
        };
        
        for (const key of Object.keys(packageOptions)){
            const packageName = key as TAvailablePackages;
            if (PACKAGES.includes(packageName)){
                if (packageOptions[packageName] === true){
                    elementAPI.install(PACKAGE_CONFIG_MAP[packageName]());
                    elementAPI.editProperty('packageList',
                        [...elementAPI.properties().packageList, packageName]
                    );
                    if (options.verbose === true) tCtx.get().write(`Package ${packageName} installed successfully.`);
                }
            }else{
                throw new Error(`Package "${packageName}" is not available.`);
            }
        }

    }

    return dpkgService;

}