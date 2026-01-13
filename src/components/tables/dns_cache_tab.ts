export function cacheDnsTable() {

    const $cacheDnsTable = document.createElement("article");

    $cacheDnsTable.classList.add("modal-table","cache-dns-table");

    $cacheDnsTable.innerHTML = `
        <table>
            <tr>
                <th>Dominio</th>
                <th>Tipo de Registro</th>
                <th>Valor</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.cache-dns-table')">Cerrar</button>
    `;

    $cacheDnsTable.setAttribute("onclick", "event.stopPropagation();");

    return $cacheDnsTable;
    
}