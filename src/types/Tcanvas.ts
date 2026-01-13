import { TLayer2Config, TLayer3Config } from "./TConfig";

export interface UltraCanvasElement {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

export interface IDefaultCableProps {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  item1Api: TLayer3Config | TLayer2Config;
  item2Api: TLayer3Config | TLayer2Config;
}

export interface IUltraPacketConfig {
  getPositions: () => { x: string; y: string };
  updatePosition: (x: string, y: string) => void;
  subscribeToPositions: (fn: (value: { x: string; y: string }) => void) => () => void;
  deleteElement: () => void;
  subscribeToDeleteSignal: (fn: (value: boolean) => void) => () => void;
  startAnimation: () => Promise<void>;
}

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
  addCableElement: ((element: IDefaultCableProps) => void) | null;
  /**
   * Creates an animation for a packet between two points on the canvas.
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @returns
   */
  createPacketAnimation: (x1: string, y1: string, x2: string, y2: string) => Promise<void>;
}