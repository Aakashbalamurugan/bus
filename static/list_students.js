function fetchStudents() {
    fetch("/students")
        .then(response => response.json())
        .then(data => {
            const studentTables = document.getElementById("student-tables");
            studentTables.innerHTML = "";

            // Group students by bus number
            const buses = {};
            data.forEach(student => {
                if (!buses[student.bus_number]) {
                    buses[student.bus_number] = [];
                }
                buses[student.bus_number].push(student);
            });

            // Sort each bus's student list alphabetically by name
            for (const bus in buses) {
                buses[bus].sort((a, b) => a.name.localeCompare(b.name));
            }

            // Generate separate tables for each bus
            for (const bus in buses) {
                const tableContainer = document.createElement("div");
                tableContainer.classList.add("table-container");

                tableContainer.innerHTML = `
                    <div class="bus-title">Bus Number: ${bus}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Enrollment Number</th>
                                <th>Name</th>
                                <th>Parent Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${buses[bus].map(student => `
                                <tr>
                                    <td>${student.enrollment_number}</td>
                                    <td>${student.name}</td>
                                    <td>${student.parent_contact}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                studentTables.appendChild(tableContainer);
            }
        })
        .catch(error => console.error("Error fetching students:", error));
}

document.addEventListener("DOMContentLoaded", fetchStudents);
