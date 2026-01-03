from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class MaterialModel(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
