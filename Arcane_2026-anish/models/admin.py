
from sqlalchemy import Column, Integer, String, DateTime, func
from db.connection import Base

class Admin(Base):
    __tablename__ = "admin"

    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String)
    created_at = Column(DateTime, server_default=func.now())
