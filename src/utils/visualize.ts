import { movePacket } from "@/animations/move-packet";

export async function visualize(originObject, destinationObjectId, packet) {

    await movePacket(
        $originObject.style.left, 
        $originObject.style.top, 
        $destinationObject.style.left, 
        $destinationObject.style.top, 
        type
    );

}