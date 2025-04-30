from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from twilio.rest import Client
import os
import mysql.connector
from typing import List
from app.database import get_db_connection

router = APIRouter()

# Twilio Credentials (Replace with actual values)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio Client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Request model
class AbsenceNotificationRequest(BaseModel):
    date: str  # YYYY-MM-DD
    session: str  # "morning" or "evening"

@router.post("/send-absence-notifications")
def send_absence_notifications(request: AbsenceNotificationRequest):
    if request.session not in ["morning", "evening"]:
        raise HTTPException(status_code=400, detail="Invalid session. Choose 'morning' or 'evening'.")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Query absent students for the given session
    session_column = f"{request.session}_status"

    query = f"""
         SELECT s.name, s.parent_contact, a.{session_column}
         FROM student s
         LEFT JOIN attendance a ON a.student_id = s.id AND a.date = %s
         WHERE (a.{session_column} = 0 OR a.{session_column} IS NULL)
        """

    cursor.execute(query, (request.date,))
    absent_students = cursor.fetchall()

    cursor.close()
    conn.close()

    if not absent_students:
        return {"message": f"No students were absent in the {request.session} session on {request.date}."}

    # Send SMS to parents
    failed_messages = []
    for student in absent_students:
        message_body = f"Dear Parent, your child {student['name']} was absent on {request.date} during the {request.session} session."

        try:
            message = client.messages.create(
                body=message_body,
                from_=TWILIO_PHONE_NUMBER,
                to="+91" + student['parent_contact']
            )
        except Exception as e:
            failed_messages.append({"student_id": student['name'], "error": str(e)})

    if failed_messages:
        return {"status": "partial_success", "failed_messages": failed_messages}
    
    return {"status": "success", "message": f"SMS sent to {len(absent_students)} parents for the {request.session} session.", "absent_students": absent_students}
