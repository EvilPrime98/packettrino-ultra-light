type Props = {
    size?: number;
    color?: string;
    className?: string;
}

export default function AddIcon({
    size = 24,
    color = "currentColor",
    className = ""
}: Props) {

    return (
        `<svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.1"
            stroke="currentColor"
            class="size-6 ${className}"
            style="width: ${size}px; height: ${size}px; color: ${color};"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>`
    )

}