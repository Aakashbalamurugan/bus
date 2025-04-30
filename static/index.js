const webcamElement = document.getElementById("webcam");
const captureButton = document.getElementById("captureBtn");
const photoContainer = document.getElementById("photoContainer");
const photoElement = document.getElementById("photo");
const retakeButton = document.getElementById("retakeBtn");
const markAttendanceButton = document.getElementById("markAttendanceBtn");
const apiResponseElement = document.getElementById("response");
const attendanceForm = document.getElementById("attendanceForm");
const submitAttendanceButton = document.getElementById("submitAttendance");

let recognizedName = "";

// Start Webcam
async function startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamElement.srcObject = stream;
}

startWebcam();

// Capture Image
captureButton.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);

    // Convert to Base64
    const imageDataURL = canvas.toDataURL("image/png");

    // Hide Webcam, Show Captured Image
    webcamElement.style.display = "none";
    photoElement.src = imageDataURL;
    photoContainer.style.display = "block";
    captureButton.style.display = "none";

    // Upload & Recognize Face
    uploadToCloudinary(imageDataURL);
});

// Retake Button
retakeButton.addEventListener("click", () => {
    photoContainer.style.display = "none";
    webcamElement.style.display = "block";
    captureButton.style.display = "block";
    apiResponseElement.textContent = "";
    retakeButton.style.display = "none";

    startWebcam();
});

async function uploadToCloudinary(imageDataURL) {
    const CLOUD_NAME = 'drzuihshy';
    const uploadPreset = 'ml_default';
    const formData = new FormData();
    formData.append('file', imageDataURL);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
        recognizeFace(response.data.secure_url);
        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
}

function recognizeFace(imageURL) {
    axios.post("/api/recognize_faces", { image_url: imageURL })
    .then(response => {
        if (response.data.faces.length > 0) {
            recognizedName = response.data.faces[0].name;
            showSuccess(recognizedName);
        } else {
            showError("No face recognized. Please retake the photo.");
        }
    })
    .catch(error => {
        console.error("Face Recognition Error:", error);
        showError("Recognition failed. Please try again.");
    });
}

function showSuccess(name) {
    apiResponseElement.textContent = `Recognized: ${name}`;
    document.getElementById("apiResponse").style.display = "block";
    markAttendanceButton.style.display = "block";
    retakeButton.style.display = "block";
}

function showError(message) {
    apiResponseElement.textContent = message;
    document.getElementById("apiResponse").style.display = "block";
    retakeButton.style.display = "block";
    markAttendanceButton.style.display = "none";
}

markAttendanceButton.addEventListener("click", () => {
    attendanceForm.style.display = "block";
    loadBusNumber();
});

function loadBusNumber() {
    const savedBusNumber = localStorage.getItem("busNumber");
    document.getElementById("bus-number").value = savedBusNumber ? savedBusNumber : "";
    attendanceForm.style.display = "block";
    const hour = new Date().getHours();
    const defaultSession = hour < 12 ? "morning" : "evening";
    document.getElementById(defaultSession).checked = true;
    submitAttendanceButton.style.display = "block";
}

submitAttendanceButton.addEventListener("click", () => {
    const busNumber = document.getElementById("bus-number").value;
    const session = document.querySelector('input[name="session"]:checked')?.value;

    if (!busNumber || !session) {
        alert("Please enter bus number and select a session.");
        return;
    }

    axios.post("/attendance/mark", {
        "enrollment_id": recognizedName, 
        "bus_number": busNumber,
        "morning_status": session === "morning" ? 1 : 0,
        "evening_status": session === "evening" ? 1 : 0
    }, { "Content-Type": "application/json" })
    .then(response => {
        alert('Attendance Marked Successfully!\nStudent: ' + response.data.student_name);
        window.location.reload();
    })
    .catch(error => {
        alert("Failed to mark attendance.");
    });
});
