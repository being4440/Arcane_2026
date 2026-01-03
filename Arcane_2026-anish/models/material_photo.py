
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from db.connection import Base

class MaterialPhoto(Base):
    __tablename__ = "material_photo"

    photo_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("material.material_id", ondelete="CASCADE"), nullable=False)
    photo_url = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    # Relationships
    material = relationship("Material", back_populates="photos")
