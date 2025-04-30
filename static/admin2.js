function fetchReport() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const responseContainer = document.getElementById("report-container");

    // Basic validation for dates
    if (!startDate || !endDate) {
        showMessage("Please select both start and end dates.", "error");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showMessage("Start date cannot be later than end date.", "error");
        return;
    }

    fetch(`/attendance/report?start_date=${startDate}&end_date=${endDate}`)
    .then(response => response.json())
    .then(data => {
        responseContainer.style.display = "block";
        responseContainer.innerHTML = "";

        if (data.attendance) {
            responseContainer.className = "success";
            let table = `<table><tr><th>Date</th><th>Name</th><th>Morning Status</th><th>Morning Time</th><th>Evening Status</th><th>Evening Time</th><th>Absence Reason</th></tr>`;
            data.attendance.forEach(record => {
                table += `<tr>
                            <td>${record.date}</td>
                            <td>${record.name}</td>
                            <td>${record.morning_status}</td>
                            <td>${record.morning_time || "-"}</td>
                            <td>${record.evening_status}</td>
                            <td>${record.evening_time || "-"}</td>
                            <td>${record.absence_reason || "-"}</td>
                          </tr>`;
            });
            table += `</table>`;
            responseContainer.innerHTML = table;
        } else {
            showMessage("No records found.", "error");
        }
    })
    .catch(error => {
        showMessage("Error: Unable to fetch report", "error");
        console.error("Error:", error);
    });
}

function fetchStudentReport() {
    const studentId = document.getElementById("student-id").value;
    const responseContainer = document.getElementById("report-container");

    if (!studentId) {
        showMessage("Please enter an enrollment ID.", "error");
        return;
    }

    fetch(`/attendance/report/student/${studentId}`)
    .then(response => response.json())
    .then(data => {
        responseContainer.style.display = "block";
        responseContainer.innerHTML = "";

        if (data.attendance) {
            responseContainer.className = "success";
            let table = `<table><tr><th>Date</th><th>Morning Status</th><th>Morning Time</th><th>Evening Status</th><th>Evening Time</th><th>Absence Reason</th></tr>`;
            data.attendance.forEach(record => {
                table += `<tr>
                            <td>${record.date}</td>
                            <td>${record.morning_status}</td>
                            <td>${record.morning_time || "-"}</td>
                            <td>${record.evening_status}</td>
                            <td>${record.evening_time || "-"}</td>
                            <td>${record.absence_reason || "-"}</td>
                          </tr>`;
            });
            table += `</table>`;
            responseContainer.innerHTML = table;
        } else {
            showMessage("No records found for this student.", "error");
        }
    })
    .catch(error => {
        showMessage("Error: Unable to fetch student report", "error");
        console.error("Error:", error);
    });
}

function showMessage(message, type) {
    const responseContainer = document.getElementById("report-container");
    responseContainer.style.display = "block";
    responseContainer.className = type;
    responseContainer.innerHTML = `<h3>${message}</h3>`;

    // Hide message after 3 seconds
    setTimeout(() => {
        responseContainer.style.display = "none";
    }, 3000);
}
