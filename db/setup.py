"""Create Postgres database and tables if they don't exist.

Run: `python db/setup.py`

Requires a `.env` at project root or POSTGRES_* env vars.
"""
from __future__ import annotations
import os
import sys
from urllib.parse import urlparse
import psycopg2

from dotenv import load_dotenv

load_dotenv()


def parse_database_url(url: str):
    # normalize async scheme if present
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://")
    parsed = urlparse(url)
    return {
        "user": parsed.username,
        "password": parsed.password,
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "dbname": parsed.path.lstrip("/") if parsed.path else None,
    }


def get_conn_params():
    # Prefer explicit POSTGRES_* env vars
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST")
    port = os.getenv("POSTGRES_PORT")
    dbname = os.getenv("POSTGRES_DB")

    if user and password and host and port and dbname:
        return {"user": user, "password": password, "host": host, "port": int(port), "dbname": dbname}

    database_url = os.getenv("DATABASE_URL")
    if database_url:
        params = parse_database_url(database_url)
        return {"user": params.get("user"), "password": params.get("password"), "host": params.get("host"), "port": params.get("port"), "dbname": params.get("dbname")}

    # Fallback to defaults
    return {"user": "postgres", "password": "", "host": "localhost", "port": 5432, "dbname": "upcycle_db"}


def create_database_if_not_exists(admin_params: dict, target_db: str):
    conn = None
    try:
        admin_db = os.getenv("PG_DEFAULT_DB", "postgres")
        conn = psycopg2.connect(dbname=admin_db, user=admin_params["user"], password=admin_params.get("password"), host=admin_params.get("host"), port=admin_params.get("port"))
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
        exists = cur.fetchone() is not None
        if exists:
            print(f"Database '{target_db}' already exists.")
        else:
            cur.execute(f"CREATE DATABASE \"{target_db}\"")
            print(f"Database '{target_db}' created.")
        cur.close()
    finally:
        if conn:
            conn.close()


def run_sql_on_target(db_params: dict, sql_statements: str):
    conn = None
    try:
        conn = psycopg2.connect(dbname=db_params["dbname"], user=db_params["user"], password=db_params.get("password"), host=db_params.get("host"), port=db_params.get("port"))
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql_statements)
        cur.close()
        print("Tables created/ensured in database.")
    finally:
        if conn:
            conn.close()


CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS organization (
    org_id SERIAL PRIMARY KEY,
    org_name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) NOT NULL,
    industry_type VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location (
    location_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    lat_approx DECIMAL(9,6),
    long_approx DECIMAL(9,6),
    lat_exact DECIMAL(9,6),
    long_exact DECIMAL(9,6)
);

CREATE TABLE IF NOT EXISTS buyer (
    buyer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material (
    material_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    quantity_value DECIMAL(10,2),
    quantity_unit VARCHAR(20),
    condition VARCHAR(50),
    availability_status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_photo (
    photo_id SERIAL PRIMARY KEY,
    material_id INT NOT NULL REFERENCES material(material_id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request (
    request_id SERIAL PRIMARY KEY,
    material_id INT NOT NULL REFERENCES material(material_id),
    buyer_id INT NOT NULL REFERENCES buyer(buyer_id),
    requested_quantity DECIMAL(10,2),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


def main():
    params = get_conn_params()
    target_db = os.getenv("TARGET_DB", "upcycle_db")

    # Admin params used to connect to 'postgres' to create DB if needed.
    admin_params = {"user": params.get("user"), "password": params.get("password"), "host": params.get("host"), "port": params.get("port")}

    create_database_if_not_exists(admin_params, target_db)

    # Ensure db_params point to the target database
    db_params = {"user": params.get("user"), "password": params.get("password"), "host": params.get("host"), "port": params.get("port"), "dbname": target_db}
    run_sql_on_target(db_params, CREATE_TABLES_SQL)
    print("ok connected")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Error:", e)
        sys.exit(1)
