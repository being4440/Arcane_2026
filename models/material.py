from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Material(Base):
    __tablename__ = "material"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
    quantity = Column(Integer)
    organization_id = Column(Integer, ForeignKey("organization.id"))
