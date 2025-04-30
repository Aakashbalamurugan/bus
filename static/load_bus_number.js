function loadBusNumber() {
    const savedBusNumber = localStorage.getItem("busNumber");
    document.getElementById("bus-number").value = savedBusNumber ? savedBusNumber : "";
}

function saveBusNumber() {
    const busNumber = document.getElementById("bus-number").value.trim();
    if (busNumber) {
        localStorage.setItem("busNumber", busNumber);
        alert("Bus number saved successfully!");
    } else {
        alert("Please enter a valid bus number.");
    }
}

loadBusNumber();
