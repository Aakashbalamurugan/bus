function fetchBuses() {
    fetch("/buses")
    .then(response => response.json())
    .then(data => {
        const busList = document.getElementById("bus-list");
        busList.innerHTML = "";

        if (data.length === 0) {
            busList.innerHTML = "<tr><td colspan='3'>No buses found.</td></tr>";
            return;
        }

        data.forEach(bus => {
            const row = `<tr>
                <td>${bus.bus_number}</td>
                <td>${bus.driver_name}</td>
                <td>${bus.driver_contact}</td>
            </tr>`;
            busList.innerHTML += row;
        });
    })
    .catch(error => {
        console.error("Error fetching buses:", error);
    });
}

fetchBuses();
