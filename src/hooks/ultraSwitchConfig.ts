import { ultraState } from "@ultra-light";
import { MacRecord } from "@/types/types";
import { isValidMac } from "@/utils/network_lib";
import { AlignmentError, ConnectionAlreadyEstablishedError, InvalidMacAddressError, NotFoundMacRecord } from "@/errors";
import { ISwitchElementProperties, IUltraSwitchConfig, TConnection  } from "@/types/TConfig";
import { Packet } from "@/types/packets";
import { CANVAS_CONTEXT } from "@/components/core/svg-canvas";
import { ENV } from "@/context/env";
import { WORK_SPACE_CONTEXT } from "@/components/core/work-space";

export default function ultraSwitchConfig({ id }: { id: string }): IUltraSwitchConfig {

    const [properties, setProperties, subscribeToProperties] = ultraState<ISwitchElementProperties>({
        "elementId": `${id}`,
        "connections": []
    });

    const [getRecords, setRecords, subscribeToRecords] = ultraState<Record<string, MacRecord>>({});
    const [portIndex, setPortIndex,] = ultraState(0);

    const updateProperty = <K extends keyof ISwitchElementProperties>(
        key: K,
        value: ISwitchElementProperties[K]
    ) => {
        setProperties({
            ...properties(),
            [key]: value
        });
    }

    function updateMacRecords(packet: Packet, itemId: string){
        const newRecords = structuredClone(getRecords());
        newRecords[itemId].mac = packet.originMac;
        setRecords(newRecords);
    }

    async function visualize(itemId: string) {

        const originCoordinates = WORK_SPACE_CONTEXT.get().getCoordinatesByElementId(itemId);
        const destinationCoordinates = WORK_SPACE_CONTEXT.get().getCoordinatesByElementId(properties().elementId);

        if (!originCoordinates || !destinationCoordinates) return;

        await CANVAS_CONTEXT.get().createPacketAnimation(
            originCoordinates.x.toString(),
            originCoordinates.y.toString(),
            destinationCoordinates.x.toString(),
            destinationCoordinates.y.toString()
        );

    }

    function getElementApiByMac(destinationMac: string){
        const currentRecords = getRecords();
        for (const itemId of Object.keys(currentRecords)){
            const { mac } = currentRecords[itemId];
            if (!mac) continue;
            if (mac !== destinationMac) continue;
            const connection = properties().connections.find( connection => connection.itemId === itemId);
            const elementApi = connection?.api;
            if (!elementApi) continue;
            return elementApi;
        }
    }

    function deleteMacRecord(itemId: string) {
        const currentRecords = getRecords();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [itemId]: _, ...newRecords } = currentRecords;
        setRecords(newRecords);
    }
  
    function addMacRecord(itemId: string) {
        if (!itemId) throw new AlignmentError('No item ID provided.');
        if (Object.keys(getRecords()).includes(itemId)) throw new ConnectionAlreadyEstablishedError('This connection has already been established.');
        const newRecords = structuredClone(getRecords());
        newRecords[itemId] = { mac: '', port: `FE 0/${portIndex()}` }
        setRecords(newRecords);
        setPortIndex(portIndex() + 1);
    }

    function getAllRecords() {
        return getRecords();
    }

    function getRecordByMac(mac: string): MacRecord {

        if (!isValidMac(mac)) throw new InvalidMacAddressError(`${mac} is not a valid MAC address.`);

        const records = getRecords();

        for (const key in records) {
            if (records[key].mac === mac) {
                return records[key];
            }
        }

        throw new NotFoundMacRecord(`No record found for MAC address: ${mac}`);

    }

    function addConnection({ itemId, api }: TConnection) {

        updateProperty(
            'connections',
            [...properties().connections, { itemId, api }]
        )

    }

    function removeConnection(itemId: string) {
        const newConnections = properties().connections;
        const targetConnection = newConnections.find( connection => connection.itemId === itemId);
        if (!targetConnection) return;
        targetConnection.itemId = '';
        targetConnection.api = null;
        updateProperty('connections', newConnections);
        deleteMacRecord(itemId);
    }

    async function sendPacket(packet: Packet, itemId: string) {
        
        if (ENV.get().visualToggle) await visualize(itemId);
        
        updateMacRecords(packet, itemId);

        const elementApi = getElementApiByMac(packet.destinationMac);

        if (!elementApi) {
            broadcast(packet, itemId);
        }else {
            elementApi
            .sendPacket(packet, properties().elementId);
        }

    }

    async function broadcast(packet: Packet, itemId: string) {
        const connections = properties().connections;
        connections.forEach((connection: TConnection) => {
            if (connection.itemId === itemId) return; //we dont want to send the packet to the source
            connection.api?.sendPacket(packet, properties().elementId)
        })
    }

    return {
        properties,
        subscribeToProperties,
        subscribeToRecords,
        addMacRecord,
        getAllRecords,
        getRecordByMac,
        sendPacket,
        addConnection,
        removeConnection,
        broadcast
    }

}