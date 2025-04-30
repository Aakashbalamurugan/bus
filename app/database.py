import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Database Configuration from .env
db_config = {
      "host":DB_HOST,
        "port":DB_PORT,
        "user":DB_USER,
        "password":DB_PASSWORD,
        "database":DB_NAME
}

def get_db_connection():
    print(db_config)
    return mysql.connector.connect(**db_config)
