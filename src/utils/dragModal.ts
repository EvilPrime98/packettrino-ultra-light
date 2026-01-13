export function dragModal(event: Event): void {

    event.preventDefault();

    const moveEvent = event as MouseEvent;
    const target = event.target as HTMLElement;
    if (!target) return;

    const $modal = target.closest<HTMLElement>(".draggable-modal");
    if (!$modal) return;

    const rect = $modal.getBoundingClientRect();
    const offsetX = moveEvent.clientX - rect.left;
    const offsetY = moveEvent.clientY - rect.top;

    $modal.style.left = `${rect.left}px`;
    $modal.style.top = `${rect.top}px`;
    $modal.style.transform = 'none';
    $modal.style.position = 'fixed';

    function moveModal(moveEvent: MouseEvent): void {
        if (!$modal) return;
        const x = moveEvent.clientX - offsetX;
        const y = moveEvent.clientY - offsetY;
        const maxX = window.innerWidth - $modal.offsetWidth;
        const maxY = window.innerHeight - $modal.offsetHeight;
        $modal.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        $modal.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        document.body.style.cursor = "grabbing";
    }

    function stopDraggingModal(): void {
        if (!$modal) return;
        document.body.style.cursor = "default";
        document.removeEventListener('mousemove', moveModal);
        document.removeEventListener('mouseup', stopDraggingModal);
        const input = $modal.querySelector<HTMLInputElement>('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveModal);
    document.addEventListener('mouseup', stopDraggingModal);
    
}