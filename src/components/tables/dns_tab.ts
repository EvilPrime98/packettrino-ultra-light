export function dnsTable() {
    
    const $dnsTable = document.createElement("article");

    $dnsTable.classList.add("modal-table","dns-table");
    $dnsTable.innerHTML = `
                <table>
                    <tr>
                        <th>Dominio</th>
                        <th>Tipo de Registro</th>
                        <th>Valor</th>
                    </tr>
                </table>
                <button onclick="closeObjectModalTable(event, '.dns-table')">Cerrar</button>`;


    $dnsTable.setAttribute("onclick", "event.stopPropagation()");

    return $dnsTable;

}