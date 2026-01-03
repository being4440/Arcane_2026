from sqlalchemy import Column, Integer, String
from database import Base

class OrganizationModel(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)