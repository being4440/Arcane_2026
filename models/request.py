from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base

class Request(Base):
    __tablename__ = "request"

    request_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("material.material_id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected, completed
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    material = relationship("Material", back_populates="requests")
    buyer = relationship("Buyer", back_populates="requests")
    feedbacks = relationship("RequestFeedback", back_populates="request")

class RequestFeedback(Base):
    __tablename__ = "request_feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request.request_id"), nullable=False)
    rating = Column(Integer)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("Request", back_populates="feedbacks")