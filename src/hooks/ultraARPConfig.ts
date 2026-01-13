import { ultraState } from "@ultra-light";

export default function ultraARPConfig() {
    
    const [properties, setProperties, subscribeToProperties] = ultraState<Record<string, string>>({});

    return {
        properties,
        subscribeToProperties,
        setProperties
    }

}