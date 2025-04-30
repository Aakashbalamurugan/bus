function preparePrint() {
    let selectedBus = document.getElementById("bus").value;
    let busText = selectedBus === "all" ? "All Buses" : "Bus No: " + selectedBus;

    document.getElementById("print-bus").innerText = busText;
    window.print();
}

function fetchReport() {
    let startDate = document.getElementById("start-date").value;
    let endDate = document.getElementById("end-date").value;
    let busNumber = document.getElementById("bus").value;

    fetch(`/attendance/report?start_date=${startDate}&end_date=${endDate}&bus_number=${busNumber}`)
        .then(response => response.json())
        .then(data => {
            let tableBody = document.querySelector("#attendanceTable tbody");
            tableBody.innerHTML = "";

            if (data.attendance.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="8">No records found.</td></tr>`;
                return;
            }

            let sortedData = data.attendance.sort((a, b) => {
                let dateComparison = new Date(a.date) - new Date(b.date);
                if (dateComparison !== 0) return dateComparison;

                let busComparison = a.bus_number - b.bus_number;
                if (busComparison !== 0) return busComparison;

                return a.name.localeCompare(b.name);
            });

            let lastDate = "";
            let dateRowSpan = {};

            sortedData.forEach((record, index, array) => {
                if (!dateRowSpan[record.date]) {
                    dateRowSpan[record.date] = array.filter(item => item.date === record.date).length;
                }

                let row = document.createElement("tr");

                if (lastDate !== record.date) {
                    row.innerHTML += `<td rowspan="${dateRowSpan[record.date]}" style="vertical-align: middle; font-weight: bold;">${record.date}</td>`;
                    lastDate = record.date;
                }

                row.innerHTML += `
                    <td>${record.enrollment_id}</td>
                    <td>${record.name}</td>
                    <td>${record.bus_number}</td>
                    <td>${record.morning_status === 1 ? "Present" : "Absent"}</td>
                    <td>8:15 AM</td>
                    <td>${record.evening_status === 1 ? "Present" : "Absent"}</td>
                    <td>3:45 PM</td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            alert("Error fetching data");
        });
}
