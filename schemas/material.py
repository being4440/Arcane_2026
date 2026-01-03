from pydantic import BaseModel

class MaterialBase(BaseModel):
    name: str
    category: str
    quantity: int
    organization_id: int

class MaterialCreate(MaterialBase):
    pass

class MaterialOut(MaterialBase):
    id: int

    class Config:
        from_attributes = True
