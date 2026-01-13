export function dhcpTable() {

    const $dhcpTable = document.createElement("article");

    $dhcpTable.classList.add("modal-table","dhcp-table");

    $dhcpTable.innerHTML = `
        <table>
            <tr>
                <th>IP</th>
                <th>MAC</th>
                <th>Host</th>
                <th>Tiempo de Alquiler</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.dhcp-table')">Cerrar</button>
    `;

    $dhcpTable.setAttribute("onclick", "event.stopPropagation();");

    return $dhcpTable;
    
}