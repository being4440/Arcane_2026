
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from db.connection import Base

class Location(Base):
    __tablename__ = "location"

    location_id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organization.org_id", ondelete="CASCADE"), nullable=False)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    lat_approx = Column(DECIMAL(9, 6))
    long_approx = Column(DECIMAL(9, 6))
    lat_exact = Column(DECIMAL(9, 6))
    long_exact = Column(DECIMAL(9, 6))

    # Relationships
    organization = relationship("Organization", back_populates="location")
