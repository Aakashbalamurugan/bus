from .base import BaseSchema

class Student(BaseSchema):
    id: int
    enrollment_number: str
    name: str
    parent_contact: str
    bus_assigned_id: int
