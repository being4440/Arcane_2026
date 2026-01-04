from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base

class Material(Base):
    __tablename__ = "material"

    material_id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organization.org_id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text)
    quantity = Column(Float)
    unit = Column(String)
    location = Column(String)
    availability_status = Column(String, default="available")  # available, requested, transferred
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="materials")
    requests = relationship("Request", back_populates="material")
    photos = relationship("MaterialPhoto", back_populates="material")

class MaterialPhoto(Base):
    __tablename__ = "material_photo"

    photo_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("material.material_id"), nullable=False)
    photo_url = Column(String, nullable=False)

    material = relationship("Material", back_populates="photos")