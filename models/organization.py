from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Request(Base):
    __tablename__ = "request"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("material.id"))
    buyer_id = Column(Integer, ForeignKey("buyer.id"))
    status = Column(String)
