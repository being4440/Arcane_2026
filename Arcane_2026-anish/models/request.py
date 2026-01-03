
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Text, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from db.connection import Base

class Request(Base):
    __tablename__ = "request"

    request_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("material.material_id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="CASCADE"), nullable=False)
    requested_quantity = Column(DECIMAL(10, 2))
    message = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    status = Column(String, default="pending")

    __table_args__ = (
        UniqueConstraint('material_id', 'buyer_id', name='unique_request_per_buyer_material'),
    )

    # Relationships
    material = relationship("Material", back_populates="requests")
    buyer = relationship("Buyer", back_populates="requests")
    feedback = relationship("RequestFeedback", back_populates="request", uselist=False, cascade="all, delete-orphan")
    reports = relationship("SellerReport", back_populates="request")
