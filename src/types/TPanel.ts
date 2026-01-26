import { TCreatableElement } from "./TWorkSpace";

export type TPanelItemType = TCreatableElement 
| "note" 
| "traffic" 
| "settings";

export interface TPanelItem {
    name: TPanelItemType;
    image: string;
    draggable: boolean;
    tooltip: string;
    onDragStart?: () => void;
    onClick?: () => void;
}