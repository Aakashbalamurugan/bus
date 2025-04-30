from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import student_routes, attendance_routes, bus_routes, sms
from app.face_recognition import predict_faces

from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

app = FastAPI()

# Allow all origins for simplicity (you can restrict it later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (you can restrict this to specific origins)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Set up template rendering
templates = Jinja2Templates(directory="templates")

# Serve static files (JavaScript, CSS, images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Route to serve the main index page
@app.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Route to serve the main admin page
@app.get("/admin", response_class=HTMLResponse)
async def main_admin_page(request: Request):
    return templates.TemplateResponse("main_admin.html", {"request": request})

# Route to serve the secondary admin page
@app.get("/load_bus_number", response_class=HTMLResponse)
async def admin_page(request: Request):
    return templates.TemplateResponse("load_bus_number.html", {"request": request})

# Route to send notifications
@app.get("/send_notification", response_class=HTMLResponse)
async def send_notification(request: Request):
    return templates.TemplateResponse("absent_Notifications.html", {"request": request})

# Route for student report
@app.get("/student_report", response_class=HTMLResponse)
async def student_report(request: Request):
    return templates.TemplateResponse("student_report.html", {"request": request})

# Route for date range report
@app.get("/date_range_report", response_class=HTMLResponse)
async def date_range_report(request: Request):
    return templates.TemplateResponse("date_range_report.html", {"request": request})

# Route for monthly report
@app.get("/monthly_report", response_class=HTMLResponse)
async def monthly_report(request: Request):
    return templates.TemplateResponse("monthly_report.html", {"request": request})

# Route to add a student
@app.get("/add_student", response_class=HTMLResponse)
async def add_student(request: Request):
    return templates.TemplateResponse("add_student.html", {"request": request})

# Route to list all students
@app.get("/list_students", response_class=HTMLResponse)
async def list_students(request: Request):
    return templates.TemplateResponse("list_students.html", {"request": request})
    
# Route to add a bus
@app.get("/add_bus", response_class=HTMLResponse)
async def add_bus(request: Request):
    return templates.TemplateResponse("add_bus.html", {"request": request})

# Route to list all buses
@app.get("/list_buses", response_class=HTMLResponse)
async def list_buses(request: Request):
    return templates.TemplateResponse("list_buses.html", {"request": request})


# Include route handlers
app.include_router(student_routes.router)
app.include_router(attendance_routes.router)
app.include_router(bus_routes.router)
app.include_router(predict_faces.router)
app.include_router(sms.router)

@app.get("/status")
def root():
    return {"message": "Bus Attendance API is running"}
