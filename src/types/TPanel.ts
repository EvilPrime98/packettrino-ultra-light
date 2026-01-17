export interface TPanelItem {
    name: string;
    image: string;
    draggable: boolean;
    tooltip: string;
    onDragStart?: () => void;
    onClick?: () => void;
}