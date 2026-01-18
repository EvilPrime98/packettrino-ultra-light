import { AlreadyExistsError, NoAvailableInterfaceError } from "@/errors";
import { iface, IUltraIfaceConfig, TConnection } from "@/types/TConfig";
import { getRandomMac } from "@/utils/network_lib";
import { ultraState } from "@ultra-light";

type props = {
    initialIfaces?: number;
}

export default function ultraIfaceConfig({ 
    initialIfaces = 1 
}: props): IUltraIfaceConfig {

    const [
        getIfaces,
        setIfaces,
        subscribeToIfaces
    ] = ultraState<Record<string, iface>>({});

    function getNewIfaceId(){
        const currIfaces = getIfaces();
        const ifaceIds = Object.keys(currIfaces);
        if (ifaceIds.length === 0) return 'enp0s3';
        const maxIndex = ifaceIds
        .map(ifaceId => Number(ifaceId.split('enp0s')[1]))
        .sort((a, b) => b - a)[0];
        return `enp0s${maxIndex + 1}`;
    }

    function removeInterface(interfaceId: string) {
        const { [interfaceId]: _removed, ...remainingIfaces } = getIfaces();
        setIfaces(remainingIfaces);
    }

    function getAvailableInterface(): string {
        const ifaces = getIfaces();
        for (const ifaceId of Object.keys(ifaces)) {
            const ifaceProperties = ifaces[ifaceId];
            if (ifaceProperties.connection.itemId === '') return ifaceId;
        }
        return '';
    }

    function updateInterface(interfaceId: string, updates: Partial<iface>) {
        const currIfaces = getIfaces();
        setIfaces({
            ...currIfaces,
            [interfaceId]: {
                ...currIfaces[interfaceId],
                ...updates
            }
        });
    }

    function updateInterfaceByIndex(index: number, updates: Partial<iface>) {
        const ifaceKeys = Object.keys(getIfaces());
        const interfaceId = ifaceKeys[index];
        if (interfaceId) {
            updateInterface(interfaceId, updates);
        }
    }

    function addInterface(interfaceId: string) {
        
        const currIfaces = getIfaces();

        if (Object.keys(currIfaces).includes(interfaceId)) {
            throw new AlreadyExistsError(`Interface ${interfaceId} already exists`);
        }

        const newInterface: iface = {
            ip: "",
            netmask: "",
            mac: getRandomMac(),
            dhcp: false,
            connection: {
                itemId: '',
                api: null
            },
            promiscuousMode: false,
            partialPromiscuousMode: false
        };

        setIfaces({
            ...currIfaces,
            [interfaceId]: newInterface
        });

    }

    function addConnection({ itemId, api }: TConnection): string {
        const availableIface = getAvailableInterface();
        if (!availableIface) {
            throw new NoAvailableInterfaceError("The Element Does Not Have An Available Interface.")
        }
        setIfaces({
            ...getIfaces(),
            [availableIface]: {
                ...getIfaces()[availableIface],
                connection: { itemId, api }
            }
        });
        return availableIface;
    }

    function removeConnection(itemId: string) {
        const ifaces = getIfaces();
        const newIfaces: Record<string, iface> = {};
        for (const ifaceId of Object.keys(ifaces)) {
            newIfaces[ifaceId] = {
                ...ifaces[ifaceId],
                connection: ifaces[ifaceId].connection.itemId === itemId
                    ? { itemId: '', api: null }
                    : ifaces[ifaceId].connection
            };
        }
        setIfaces(newIfaces);
    }

    function editInterfaceId(
        interfaceId: string, 
        newId: string
    ) {

        if (interfaceId === newId) return;
        
        const currIfaces = getIfaces();
        
        if (!currIfaces[interfaceId]) {
            throw new Error(`Interface "${interfaceId}" does not exist`);
        }
        
        if (currIfaces[newId]) {
            throw new Error(`ID "${newId}" is already in use!`);
        }
        
        const newIfaces = { ...currIfaces };
        newIfaces[newId] = currIfaces[interfaceId];
        delete newIfaces[interfaceId];   
        setIfaces(newIfaces);

    }

    function partialPromiscousMode(ifaceId: string, value: boolean) {
        const currIfaces = getIfaces();
        setIfaces({
            ...currIfaces,
            [ifaceId]: {
                ...currIfaces[ifaceId],
                dhcp: value
            }
        });
    }

    function promiscuousMode(ifaceId: string, value: boolean) {
        const currIfaces = getIfaces();
        setIfaces({
            ...currIfaces,
            [ifaceId]: {
                ...currIfaces[ifaceId],
                dhcp: value
            }
        });
    }

    for (let i = 0; i < initialIfaces; i++) {
        addInterface(getNewIfaceId());
    }

    return {
        getIfaces,
        subscribeToIfaces,
        removeInterface,
        getAvailableInterface,
        updateInterface,
        updateInterfaceByIndex,
        addInterface,
        addConnection,
        removeConnection,
        getNewIfaceId,
        editInterfaceId,
        partialPromiscousMode,
        promiscuousMode
    }

}