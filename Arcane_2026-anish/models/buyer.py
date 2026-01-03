
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from db.connection import Base

class Buyer(Base):
    __tablename__ = "buyer"

    buyer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    phone = Column(String)
    city = Column(String)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    requests = relationship("Request", back_populates="buyer", cascade="all, delete-orphan")
