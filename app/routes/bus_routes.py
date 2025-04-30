from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter()

class Bus(BaseModel):
    bus_number: str
    driver_contact: str
    driver_name: str

@router.post("/buses")
def create_bus(bus: Bus):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO bus (bus_number, driver_contact, driver_name) VALUES (%s, %s, %s)",
                   (bus.bus_number, bus.driver_contact, bus.driver_name))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Bus created successfully"}

@router.get("/buses")
def get_buses():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bus")
    buses = cursor.fetchall()
    cursor.close()
    conn.close()
    return buses

@router.get("/buses/{bus_id}")
def get_bus(bus_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bus WHERE bus_id = %s", (bus_id,))
    bus = cursor.fetchone()
    cursor.close()
    conn.close()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return bus

@router.put("/buses/{bus_id}")
def update_bus(bus_id: int, bus: Bus):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE bus SET bus_number = %s, driver_contact = %s, driver_name = %s WHERE bus_id = %s",
                   (bus.bus_number, bus.driver_contact, bus.driver_name, bus_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Bus updated successfully"}

@router.delete("/buses/{bus_id}")
def delete_bus(bus_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bus WHERE bus_id = %s", (bus_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Bus deleted successfully"}