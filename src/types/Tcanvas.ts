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
  ifaceId?: string;
}

export interface IUltraPacketConfig {
  getPositions: () => { x: string; y: string };
  updatePosition: (x: string, y: string) => void;
  subscribeToPositions: (fn: (value: { x: string; y: string }) => void) => () => void;
  deleteElement: () => void;
  subscribeToDeleteSignal: (fn: (value: boolean) => void) => () => void;
  startAnimation: () => Promise<void>;
}

export type TAnimatedPacket = "unicast" | "broadcast";
