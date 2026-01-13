export const checkObjectClip = (x: number, y: number, workSpace: HTMLElement) => {

    const boardProperties = window.getComputedStyle(workSpace, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height"));
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const objectWidth = 80;
    const objectHeight = 80;
    const spareSpace = 10;
    let newX = x;
    let newY = y;

    //calculamos la posicion del objeto en funcion de su posicion en el tablero

    const objectLeft = (x - objectWidth / 2);
    const objectRight = (x + objectWidth / 2);
    const objectTop = (y - objectHeight / 2);
    const objectBot = (y + objectHeight / 2);

    if (objectLeft < 0) { //el objeto acaba oculto por la izquierda
        const diffLeft = Math.abs(objectLeft);
        newX = x + diffLeft + spareSpace;
    }

    if (objectRight > boardWidth) { //el objeto acaba oculto por la derecha
        const diffRight = Math.abs(objectRight - boardWidth);
        newX = x - diffRight - spareSpace;
    }

    if (objectTop < 0) { //el objeto acaba oculto por arriba
        const diffTop = Math.abs(objectTop);
        newY = y + diffTop + spareSpace;
    }

    if (objectBot > boardHeight) { //el objeto acaba oculto por abajo
        const diffBot = Math.abs(objectBot - boardHeight);
        newY = y - diffBot - spareSpace;
    }

    return [newX, newY];

}