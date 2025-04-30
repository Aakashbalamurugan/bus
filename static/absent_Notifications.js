const today = new Date().toISOString().split('T')[0];
document.getElementById("date").value = today;

const hour = new Date().getHours();
document.getElementById("session").value = hour < 12 ? "morning" : "evening";

function sendNotification() {
    const date = document.getElementById("date").value;
    const session = document.getElementById("session").value;
    const responseContainer = document.getElementById("response-container");

    if (!date || !session) {
        responseContainer.style.display = "block";
        responseContainer.className = "error";
        responseContainer.innerHTML = `<h3>Please select date and session.</h3>`;
        return;
    }

    const requestData = { date, session };

    fetch("/send-absence-notifications", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        responseContainer.style.display = "block";
        responseContainer.innerHTML = "";

        if (data.status === "success") {
            responseContainer.className = "success";
            let buses = {};

            data.absent_students.forEach(student => {
                if (!buses[student.bus_number]) {
                    buses[student.bus_number] = [];
                }
                buses[student.bus_number].push(student);
            });

            responseContainer.innerHTML += `<h3>${data.message}</h3>`;

            Object.keys(buses).sort().forEach(bus_number => {
                let students = buses[bus_number].sort((a, b) => a.name.localeCompare(b.name));
                responseContainer.innerHTML += `
                    <h4>Bus ${bus_number}</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Parent Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr>
                                    <td>${student.name}</td>
                                    <td>${student.parent_contact}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                `;
            });
        } else {
            responseContainer.className = "error";
            responseContainer.innerHTML = `<h3>Failed to send notifications</h3>`;
        }
    })
    .catch(error => {
        responseContainer.style.display = "block";
        responseContainer.className = "error";
        responseContainer.innerHTML = `<h3>Error: Unable to send notifications</h3>`;
        console.error("Error:", error);
    });
}
