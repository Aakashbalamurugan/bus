from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter()

class Student(BaseModel):
    enrollment_number: str
    name: str
    parent_contact: str
    bus_assigned_id: int

@router.post("/student")
def create_student(student: Student):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bus WHERE bus_number =%s", (student.bus_assigned_id,))
    bus = cursor.fetchone()

    if not bus:
        cursor.close()
        conn.close() 
        raise HTTPException(status_code = 404, detail = "bus not found")

    bus_id = bus[0]
    cursor.execute("INSERT INTO student (enrollment_number, name, parent_contact, bus_assigned_id) VALUES (%s, %s, %s, %s)",
                   (student.enrollment_number, student.name, student.parent_contact, bus_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Student created successfully"}

@router.get("/students")
def get_students():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM student s JOIN bus b ON s.bus_assigned_id = b.id ORDER BY s.name ASC")
    students = cursor.fetchall()
    cursor.close()
    conn.close()
    return students

@router.get("/student/{student_id}")
def get_student(student_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT s.name, s.enrollement_number, s.parent_contact, b.bus_number FROM student s join bus b on s.bus_assigned_id = b.id WHERE id = %s", (student_id,))
    student = cursor.fetchone()
    cursor.close()
    conn.close()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student     

@router.put("/student/{student_id}")
def update_student(student_id: int, student: Student):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE student SET enrollment_number = %s, name = %s, parent_contact = %s, bus_assigned_id = %s WHERE id = %s",
                   (student.enrollment_number, student.name, student.parent_contact, student.bus_assigned_id, student_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Student updated successfully"}

@router.delete("/student/{student_id}")
def delete_student(student_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student WHERE id = %s", (student_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Student deleted successfully"}
