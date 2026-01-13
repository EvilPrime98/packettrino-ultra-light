export function isDragEvent(event: Event): event is DragEvent {
    return event.type === 'drag';
}