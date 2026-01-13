export function macTable() {

    const $macTable = document.createElement("article");

    $macTable.classList.add("modal-table","mac-table");

    $macTable.innerHTML = `
        <table>
            <tr>
                <th>Dispositivo</th>
                <th>MAC</th>
                <th>Puerto Físico</th>
            </tr>
        </table>
        <button onclick="closeMacTable(event)">Cerrar</button>
    `;

    $macTable.setAttribute("onclick", "event.stopPropagation()");

    return $macTable;
    
}