import { IDefaultCableProps, IUltraPacketConfig, TAnimatedPacket } from "@/types/Tcanvas";
import { UltraContext } from "ultra-light.js";

export type CanvasContextInterface = {
  
    /**
   * The API of the target element.
   */
  elementApi: IUltraPacketConfig | null;
  
  /**
   * The promise that resolves when the current animation completes.
   */
  animationPromise: Promise<void> | null;
  
  /**
   * Adds a new cable element to the canvas.
   */
  addCableElement: (element: IDefaultCableProps) => void;

  /**
   * Creates an animation for a packet between two points on the canvas.
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @param type
   * @returns
   */
  createPacketAnimation: (x1: string, y1: string, x2: string, y2: string, type?: TAnimatedPacket) => Promise<void>;

}

export const CANVAS_CONTEXT = UltraContext<CanvasContextInterface>({
    elementApi: null,
    animationPromise: null,
    addCableElement: () => {},
    createPacketAnimation: async () => {},
});