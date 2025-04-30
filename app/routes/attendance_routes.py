from fastapi import APIRouter, HTTPException
from ..database import get_db_connection
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/attendance", tags=["Attendance"])

# Attendance Model
class Attendance(BaseModel):
    enrollment_id: str
    bus_number: str
    morning_status: Optional[int] = 0  # 1 for Present, 0 for Absent
    evening_status: Optional[int] = 0  # 1 for Present, 0 for Absent

@router.post("/mark")
def mark_attendance(attendance: Attendance):
    current_date = datetime.now().date()
    current_time = datetime.now().time()
    
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM bus WHERE bus_number = %s", (attendance.bus_number,))
    bus = cursor.fetchone()

    if not bus:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Bus not found")

    bus_id = bus[0]

    cursor.execute("SELECT * FROM student WHERE enrollment_number = %s", (attendance.enrollment_id,))
    student = cursor.fetchone()

    if not student:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    student_id = student[0]
    student_name = student[2]

    cursor.execute("""
        SELECT id, morning_status, evening_status FROM attendance 
        WHERE student_id = %s AND date = %s
    """, (student_id, current_date))
    
    existing_record = cursor.fetchone()

    morning_time = current_time if attendance.morning_status == 1 else None
    evening_time = current_time if attendance.evening_status == 1 else None
    
    if existing_record:
        id, morning_status, evening_status = existing_record
        
        if attendance.evening_status == 1 and evening_status == 0:
            cursor.execute("""
                UPDATE attendance 
                SET evening_status = %s, evening_time = %s
                WHERE id = %s
            """, (attendance.evening_status, evening_time, id))
            conn.commit()
            message = "Evening attendance updated successfully."
        else:
            message = "Attendance already recorded for this student."
    else:
        cursor.execute("""
            INSERT INTO attendance (date, morning_status, morning_time, evening_status, evening_time, bus_id, student_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (current_date, attendance.morning_status, morning_time, 
              attendance.evening_status, evening_time, bus_id, student_id))
        conn.commit()
        message = "New attendance record created successfully."

    cursor.close()
    conn.close()
    
    return {"message": message, "student_name": student_name, "date": current_date}


@router.get("/report")
def get_attendance_report(start_date: str, end_date: str, bus_number: str = "all"):
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()

    # Restrict time frame to a maximum of 14 days
    max_allowed_range = timedelta(days=14)
    if end_date_obj - start_date_obj > max_allowed_range:
        raise HTTPException(status_code=400, detail="Time frame cannot exceed 14 days")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Handle all buses case
    if bus_number == "all":
        cursor.execute("""
            SELECT student.enrollment_number, student.name, bus.bus_number, date, 
                   morning_status, morning_time, evening_status, evening_time
            FROM attendance
            INNER JOIN student ON attendance.student_id = student.id
            INNER JOIN bus ON attendance.bus_id = bus.id
            WHERE date BETWEEN %s AND %s
            ORDER BY date DESC
        """, (start_date, end_date))
    else:
        cursor.execute("""
            SELECT student.enrollment_number, student.name, bus.bus_number, date, 
                   morning_status, morning_time, evening_status, evening_time
            FROM attendance
            INNER JOIN student ON attendance.student_id = student.id
            INNER JOIN bus ON attendance.bus_id = bus.id
            WHERE date BETWEEN %s AND %s
            AND bus.bus_number = %s
            ORDER BY date DESC
        """, (start_date, end_date, bus_number))

    records = cursor.fetchall()
    cursor.close()
    conn.close()

    if not records:
        raise HTTPException(status_code=404, detail="No attendance records found in this time frame")

    return {
        "start_date": start_date,
        "end_date": end_date,
        "bus_number": bus_number,
        "attendance": [
            {
                "enrollment_id": row[0],
                "name": row[1],
                "bus_number": row[2],
                "date": str(row[3]),
                "morning_status": row[4],
                "morning_time": row[5],
                "evening_status": row[6],
                "evening_time": row[7]
            }
            for row in records
        ]
    }

@router.get("/report/student/{enrollment_id}")
def get_student_attendance(enrollment_id: str):
    print(enrollment_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT student.enrollment_number, student.name, date, morning_status, morning_time, evening_status, evening_time, bus.bus_number
        FROM attendance
        INNER JOIN student ON attendance.student_id = student.id
        INNER JOIN bus ON attendance.bus_id = bus.id
        WHERE student.enrollment_number = %s
        ORDER BY date DESC
    """, (enrollment_id,))
    
    records = cursor.fetchall()
    cursor.close()
    conn.close()

    if not records:
        raise HTTPException(status_code=404, detail=f"No attendance records found for enrollment_id: {enrollment_id}")

    return {"enrollment_id": enrollment_id, "attendance": [
        {"date": str(row[2]),"morning_status": row[3], "morning_time": row[4], "evening_status": row[5], "evening_time": row[6], "bus_number": row[7]}
        for row in records
    ]}

@router.get("/report/monthly/{year}/{month}/{bus_number}")
def get_monthly_attendance_report(year: int, month: int, bus_number: str = "all"):
    print(year, month, bus_number)
    try:
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date()
        else:
            end_date = datetime(year, month + 1, 1).date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid year or month")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Handle all buses case
    if bus_number == "all":
        cursor.execute("""
            SELECT student.enrollment_number, student.name, bus.bus_number, date, 
                   morning_status, morning_time, evening_status, evening_time
            FROM attendance
            INNER JOIN student ON attendance.student_id = student.id
            INNER JOIN bus ON attendance.bus_id = bus.id
            WHERE date >= %s AND date < %s
            ORDER BY date DESC
        """, (start_date, end_date))
    else:
        cursor.execute("""
            SELECT student.enrollment_number, student.name, bus.bus_number, date, 
                   morning_status, morning_time, evening_status, evening_time
            FROM attendance
            INNER JOIN student ON attendance.student_id = student.id
            INNER JOIN bus ON attendance.bus_id = bus.id
            WHERE date >= %s AND date < %s
            AND bus.bus_number = %s
            ORDER BY date DESC
        """, (start_date, end_date, bus_number))

    records = cursor.fetchall()
    cursor.close()
    conn.close()

    if not records:
        raise HTTPException(status_code=404, detail="No attendance records found for this month")

    return {
        "year": year,
        "month": month,
        "bus_number": bus_number,
        "attendance": [
            {
                "enrollment_id": row[0],
                "name": row[1],
                "bus_number": row[2],
                "date": str(row[3]),
                "morning_status": row[4],
                "morning_time": row[5],
                "evening_status": row[6],
                "evening_time": row[7]
            }
            for row in records
        ]
    }
