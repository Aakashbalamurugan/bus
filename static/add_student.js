function addStudent() {
    const enrollment_number = document.getElementById("enrollment_number").value.trim();
    const name = document.getElementById("name").value.trim();
    const parent_contact = document.getElementById("parent_contact").value.trim();
    const bus_assigned_id = document.getElementById("bus_assigned_id").value.trim();
    const responseContainer = document.getElementById("response-container");
    
    // Input validations
    if (!enrollment_number || !name || !parent_contact || !bus_assigned_id) {
        showMessage("All fields are required!", "error");
        return;
    }

    // Check if Parent Contact is exactly 10 digits
    if (!/^\d{10}$/.test(parent_contact)) {
        showMessage("Parent Contact must be exactly 10 digits!", "error");
        return;
    }
    
    const requestData = { enrollment_number, name, parent_contact, bus_assigned_id };
    
    fetch("/student", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showMessage(data.message, "success");
            clearInputs(); // Clear input fields after success
        } else {
            showMessage(data.detail || "Failed to add student", "error");
        }
    })
    .catch(error => {
        showMessage("Error: Unable to add student", "error");
        console.error("Error:", error);
    });
}

function showMessage(message, type) {
    const responseContainer = document.getElementById("response-container");
    responseContainer.style.display = "block";
    responseContainer.className = type;
    responseContainer.innerHTML = `<h3>${message}</h3>`;
    
    // Hide message after 3 seconds
    setTimeout(() => {
        responseContainer.style.display = "none";
    }, 3000);
}

function clearInputs() {
    document.getElementById("enrollment_number").value = "";
    document.getElementById("name").value = "";
    document.getElementById("parent_contact").value = "";
    document.getElementById("bus_assigned_id").value = "";
}
