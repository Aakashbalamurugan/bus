let attendanceData = {};

function fetchReport() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const dateContainer = document.getElementById("date-container");
    const reportContainer = document.getElementById("report-container");

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    fetch(`/attendance/report?start_date=${startDate}&end_date=${endDate}`)
    .then(response => response.json())
    .then(data => {
        if (data.attendance) {
            attendanceData = {};
            dateContainer.innerHTML = "";
            reportContainer.innerHTML = "";
            
            const dates = new Set();
            data.attendance.forEach(record => {
                if (!attendanceData[record.date]) {
                    attendanceData[record.date] = [];
                }
                attendanceData[record.date].push(record);
                dates.add(record.date);
            });
            
            dates.forEach(date => {
                let button = document.createElement("button");
                button.innerText = date;
                button.className = "date-button";
                button.onclick = () => displayReport(date);
                dateContainer.appendChild(button);
            });
        } else {
            dateContainer.innerHTML = "<h3>No records found.</h3>";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        dateContainer.innerHTML = "<h3>Error: Unable to fetch report</h3>";
    });
}

function displayReport(date) {
    const reportContainer = document.getElementById("report-container");
    reportContainer.innerHTML = "";
    
    if (attendanceData[date]) {
        let table = `<table><tr><th>Name</th><th>Morning Status</th><th>Morning Time</th><th>Evening Status</th><th>Evening Time</th></tr>`;
        attendanceData[date].forEach(record => {
            table += `<tr>
                        <td>${record.name}</td>
                        <td>${record.morning_status}</td>
                        <td>${convertTo12HrTime(record.morning_time) || "-"}</td>
                        <td>${record.evening_status}</td>
                        <td>${convertTo12HrTime(record.evening_time) || "-"}</td>
                      </tr>`;
        });
        table += `</table>`;
        reportContainer.innerHTML = table;
    } else {
        reportContainer.innerHTML = "<h3>No records available for this date.</h3>";
    }
}

// Function to convert time (in seconds) to 12-hour format
function convertTo12HrTime(seconds) {
    if (!seconds || isNaN(seconds)) {
        return "-";
    }

    let date = new Date(seconds * 1000); // Convert to milliseconds
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let secondsPart = date.getUTCSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 0 to 12
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secondsPart.toString().padStart(2, "0")} ${ampm}`;
}
