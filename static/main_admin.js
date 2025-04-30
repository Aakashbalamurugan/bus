document.addEventListener('DOMContentLoaded', function() {
    console.log("JavaScript Loaded Successfully"); // Debugging

    const sendNotificationButton = document.getElementById("send_notification");
    if (sendNotificationButton) {
        sendNotificationButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = "/send_notification";
        });
    }

    const saveBusNumberButton = document.getElementById("load_bus_number");
    if (saveBusNumberButton) {
        saveBusNumberButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = "/load_bus_number";
        });
    }
});
