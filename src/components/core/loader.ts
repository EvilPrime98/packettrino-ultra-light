import { UltraComponent } from "ultra-light.js";
import styles from './loader.module.css';

export function Loader({
    size,
    color,
    borderColor,
    border,
    customClassName
}: {
    size?: number,
    color?: string,
    borderColor?: string,
    border?: number,
    customClassName?: string[] | string
} = {}) {
    
    return UltraComponent({
        component: '<div></div>',
        className: [
            styles['loader'], 
            ...(customClassName instanceof Array ? customClassName : [customClassName])
        ],
        styles: {
            width: `${size || 120}px`,
            height: `${size}px`,
            border: `${border || 16}px solid ${borderColor || '#f3f3f3'}`,
            borderTop: `${border || 16}px solid ${color || '#3498db'}`,
        }
    })

}