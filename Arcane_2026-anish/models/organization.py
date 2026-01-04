
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from db.connection import Base

class Organization(Base):
    __tablename__ = "organization"

    org_id = Column(Integer, primary_key=True, index=True)
    org_name = Column(String, nullable=False)
    org_type = Column(String, nullable=False)
    industry_type = Column(String)
    email = Column(String, unique=True, nullable=False, index=True)
    contact_number = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    verification_status = Column(String, default="pending")
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    verified_at = Column(DateTime)

    # Relationships
    location = relationship("Location", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="organization", cascade="all, delete-orphan")
