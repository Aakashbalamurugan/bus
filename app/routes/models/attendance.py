from .base import BaseSchema
from datetime import time, date

class Attendance(BaseSchema):
    student_id: int
    bus_id: int
    morning_status: int
    morning_time: time
    evening_status: int
    evening_time: time
    date: date
