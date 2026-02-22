type Props = {
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
}

export function RemoveIcon({
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 1.5
}: Props) {

    return (
        `<svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={${strokeWidth}}
            stroke="${color}"
            class="size-6 ${className}"
            width=${size}
            height=${size}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>`
    )

}