import { ultraState } from "@ultra-light";
import type { IUltraDHCPServerConfig, TDhcpServerProperties, TDhcpServerReservations } from "@/types/TConfig";

export default function ultraDhcpServerConfig(): IUltraDHCPServerConfig {

    const initialProperties: TDhcpServerProperties = {
        "listenOnIfaces": ["enp0s3"],
        "offerRangeStart": "192.168.1.100",
        "offerRangeEnd": "192.168.1.150",
        "offerNetmask": "255.255.255.0",
        "offerGateway": "192.168.1.1",
        "offerDns": "8.8.8.8",
        "offerLeaseTime": 86400
    }
    
    const [
        getProperties
        , 
        ,subscribeToProperties
    ] = ultraState<TDhcpServerProperties>(initialProperties);

    const [
        getReservations
        ,setReservations
        ,
    ] = ultraState<TDhcpServerReservations>({})

    function addReservation(
        ip: string,
        mac: string,
        hostname: string
    ){
        const newReservations = {...getReservations() };
        newReservations[ip] = { mac, hostname };
        setReservations(newReservations);
    }

    function removeReservation(
        ip: string
    ) {
        const newReservations = {...getReservations() };
        delete newReservations[ip];
        setReservations(newReservations);
    }

    return {
        getDHCPServerProperties: getProperties,
        subscribeToDHCPServerProperties: subscribeToProperties,
        getDHCPReservations: getReservations,
        addDHCPReservation: addReservation,
        removeDHCPReservation: removeReservation
    }

}