// Restrict Bus Number input to digits only
document.getElementById("bus_number").addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, '');  // Remove non-numeric characters
});

// Restrict Driver Contact input to exactly 10 digits
document.getElementById("driver_contact").addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, '');  // Remove non-numeric characters
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);  // Limit to 10 characters
    }
});

function addBus() {
    const busNumber = document.getElementById("bus_number").value.trim();
    const driverName = document.getElementById("driver_name").value.trim();
    const driverContact = document.getElementById("driver_contact").value.trim();
    const responseContainer = document.getElementById("response-container");

    // Validate inputs
    if (!busNumber || !driverName || !driverContact) {
        showMessage("Please fill in all fields.", "error");
        return;
    }
    if (!/^\d+$/.test(busNumber)) {
        showMessage("Bus number must contain only digits.", "error");
        return;
    }
    if (!/^\d{10}$/.test(driverContact)) {
        showMessage("Driver contact must be exactly 10 digits.", "error");
        return;
    }

    const requestData = { 
        bus_number: busNumber, 
        driver_name: driverName, 
        driver_contact: driverContact 
    };

    fetch("/buses", {  // Ensure this matches your FastAPI endpoint
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
            clearInputFields();
        } else {
            showMessage("Failed to add bus", "error");
        }
    })
    .catch(error => {
        showMessage("Error: Unable to add bus", "error");
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

function clearInputFields() {
    document.getElementById("bus_number").value = "";
    document.getElementById("driver_name").value = "";
    document.getElementById("driver_contact").value = "";
}
