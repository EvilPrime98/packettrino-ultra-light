type Props = {
    size?: number;
    color?: string;
    className?: string;
}

export default function CrossIcon({
    size = 24,
    color = "currentColor",
    className = ""
}: Props) {

    return (
        `<svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            class="${className}"
            style="width: ${size}px; height: ${size}px; color: ${color};"
        >
            <circle cx="50" cy="50" r="45" fill="#f44336" />
            <line x1="35" y1="35" x2="65" y2="65" stroke="white" stroke-width="6" stroke-linecap="round"/>
            <line x1="65" y1="35" x2="35" y2="65" stroke="white" stroke-width="6" stroke-linecap="round"/>
        </svg>`
    )

}