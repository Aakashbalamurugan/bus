function getStudentReport() {
    const enrollmentId = document.getElementById("enrollment-id").value.trim();

    if (!enrollmentId) {
        alert("Please enter a valid enrollment ID.");
        return;
    }

    document.getElementById("loading").style.display = "block";

    fetch(`/attendance/report/student/${enrollmentId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loading").style.display = "none";

            if (!data.attendance || data.attendance.length === 0) {
                alert("No attendance records found for this student.");
                return;
            }

            document.getElementById("bus-container").style.display = "block";
            document.getElementById("display_bus").innerText = data.attendance[0].bus_number;

            document.getElementById("report-table").style.display = "table";
            const reportBody = document.getElementById("report-body");
            reportBody.innerHTML = "";

            // Convert seconds to time
            function formatTime(seconds) {
                if (!seconds || seconds === 0) return "-";

                const date = new Date(null);
                date.setSeconds(seconds);
                let hours = date.getUTCHours();
                let minutes = date.getUTCMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
            }

            data.attendance.forEach(record => {
                const row = `<tr>
                    <td>${record.date}</td>
                    <td>${record.morning_status === 1 ? "Present" : "Absent"}</td>
                    <td>${formatTime(record.morning_time)}</td>
                    <td>${record.evening_status === 1 ? "Present" : "Absent"}</td>
                    <td>${formatTime(record.evening_time)}</td>
                </tr>`;
                reportBody.innerHTML += row;
            });
        })
        .catch(error => {
            document.getElementById("loading").style.display = "none";
            alert("Error fetching data. Please try again later.");
            console.error(error);
        });
}
