import { WORK_SPACE_CONTEXT as wsCtx } from "@/context/workspace-context";
import { CANVAS_CONTEXT as csCtxd} from "@/components/core/svg-canvas";
import { Packet } from "@/types/packets";
import { IUltraAnimations } from "@/types/TConfig";

export default function ultraAnimations(): IUltraAnimations {
    
    async function visualize(
        itemId1: string,
        itemId2: string,
        packet: Packet
    ) {

        const originCoordinates = wsCtx.get().getCoordinatesByElementId(itemId1);
        const destinationCoordinates = wsCtx.get().getCoordinatesByElementId(itemId2);
        const packetType = (packet.destinationMac === 'ff:ff:ff:ff:ff:ff') ? 'broadcast' : 'unicast';

        if (!originCoordinates || !destinationCoordinates) return;

        await csCtxd.get().createPacketAnimation(
            originCoordinates.x.toString(),
            originCoordinates.y.toString(),
            destinationCoordinates.x.toString(),
            destinationCoordinates.y.toString(),
            packetType
        );

    }

    return {
        visualize
    }

}