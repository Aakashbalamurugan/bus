from .base import BaseSchema

class Bus(BaseSchema):
    bus_id: int
    bus_number: str
    driver_contact: str
    driver_name: str
    
