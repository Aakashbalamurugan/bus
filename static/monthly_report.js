// Populate year dropdown
const yearDropdown = document.getElementById("year");
const currentYear = new Date().getFullYear();
for (let i = currentYear - 5; i <= currentYear; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    if (i === currentYear) option.selected = true;
    yearDropdown.appendChild(option);
}

// Populate month dropdown
const monthDropdown = document.getElementById("month");
const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
const currentMonth = new Date().getMonth() + 1;

for (let i = 1; i <= 12; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = months[i - 1];
    if (i === currentMonth) option.selected = true;
    monthDropdown.appendChild(option);
}

// Populate bus numbers
function populateBusNumbers() {
    const busDropdown = document.getElementById("bus");
    busDropdown.innerHTML = '<option value="all">All Buses</option>';
    for (let i = 1; i <= 7; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = `Bus No: ${i}`;
        busDropdown.appendChild(option);
    }
}
populateBusNumbers();

// Fetch attendance data
function fetchAttendance() {
    let year = document.getElementById("year").value;
    let month = document.getElementById("month").value;
    let busNumber = document.getElementById("bus").value;

    document.getElementById("printYear").textContent = year;
    document.getElementById("printMonth").textContent = months[month - 1];
    document.getElementById("printBus").textContent = busNumber;

    fetch(`/attendance/report/monthly/${year}/${month}/${busNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("No data found");
            }
            return response.json();
        })
        .then(data => {
            document.querySelector("#attendanceTable tbody").innerHTML = "";
            processAttendanceData(data.attendance);
        })
        .catch(error => {
            alert(error.message);
        });
}

// Process attendance data and render table
function processAttendanceData(data) {
    let tableBody = document.querySelector("#attendanceTable tbody");
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8">No records found.</td></tr>`;
        return;
    }

    function formatTime(seconds) {
        if (!seconds) return "-";
        let date = new Date(seconds * 1000);
        let hours = date.getUTCHours();
        return hours < 12 ? "8:15 AM" : "3:45 PM";
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentDate = "";
    data.forEach(record => {
        let showDate = record.date !== currentDate;
        currentDate = record.date;

        let tr = `<tr>
            ${showDate ? `<td rowspan="${data.filter(r => r.date === record.date).length}" style="vertical-align: middle; font-weight: bold;">${record.date}</td>` : ""}
            <td>${record.enrollment_id}</td>
            <td>${record.name}</td>
            <td>${record.bus_number}</td>
            <td>${record.morning_status === 1 ? "Present" : "Absent"}</td>
            <td>${formatTime(record.morning_time)}</td>
            <td>${record.evening_status === 1 ? "Present" : "Absent"}</td>
            <td>${formatTime(record.evening_time)}</td>
        </tr>`;
        tableBody.innerHTML += tr;
    });
}

// Print report
function printReport() {
    window.print();
}
