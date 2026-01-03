
from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, func, CheckConstraint
from sqlalchemy.orm import relationship
from db.connection import Base

class RequestFeedback(Base):
    __tablename__ = "request_feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request.request_id", ondelete="CASCADE"), unique=True, nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Integer, ForeignKey("organization.org_id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint('rating BETWEEN 1 AND 5', name='rating_check'),
    )

    # Relationships
    request = relationship("Request", back_populates="feedback")
    buyer = relationship("Buyer")
    organization = relationship("Organization")
