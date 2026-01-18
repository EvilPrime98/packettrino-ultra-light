type Props = {
    size?: number;
    color?: string;
    className?: string;
}

export default function DragIcon({
    size = 24,
    color = "currentColor",
    className = ""
}: Props) {

    return (
        `<svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="${size}"
            height="${size}"
            class="${className}"
            viewBox="0 0 24 24"
        >
            <title xmlns="">Press to drag</title>
            <path 
                fill="${color}"
                d="M7 19v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2zm-8-4v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2zm-8-4V9h2v2zm4 0V9h2v2zm4 0V9h2v2zM7 7V5h2v2zm4 0V5h2v2zm4 0V5h2v2z"/>
        </svg>`
    )

}