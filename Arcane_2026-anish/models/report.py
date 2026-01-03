
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from db.connection import Base

class SellerReport(Base):
    __tablename__ = "seller_report"

    report_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request.request_id", ondelete="SET NULL"), nullable=True)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Integer, ForeignKey("organization.org_id", ondelete="CASCADE"), nullable=False)
    reason = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    request = relationship("Request", back_populates="reports")
    buyer = relationship("Buyer")
    organization = relationship("Organization")
