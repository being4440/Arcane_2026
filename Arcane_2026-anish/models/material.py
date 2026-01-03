
from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from db.connection import Base

class Material(Base):
    __tablename__ = "material"

    material_id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organization.org_id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text)
    quantity_value = Column(DECIMAL(10, 2))
    quantity_unit = Column(String)
    condition = Column(String)
    availability_status = Column(String, default="available")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="materials")
    photos = relationship("MaterialPhoto", back_populates="material", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="material", cascade="all, delete-orphan")
