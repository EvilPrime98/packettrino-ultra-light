import { Packet } from "@/types/Tpackets";
import { UltraContext } from "ultra-light.js";

export type TracerMenuCtx = {
  /**
   * Returns true or false based on whether the tracer is visible.
   */
  isVisible: boolean;
  /**
   * Adds a new packet to the traffic table.
   * @param packet The packet to be added.
   * @param originId The ID of the device that sent the packet.
   */
  addPacket: (packet: Packet, originId: string) => void;
}

export const TRACER_MENU_CTX = UltraContext<TracerMenuCtx>({
  isVisible: false,
  addPacket: () => { }
});