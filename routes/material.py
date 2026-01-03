from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.material import Material
from schemas.material import MaterialCreate, MaterialOut

router = APIRouter(prefix="/materials", tags=["Materials"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# READ
@router.get("/", response_model=list[MaterialOut])
def list_materials(db: Session = Depends(get_db)):
    return db.query(Material).all()

# CREATE
@router.post("/", response_model=MaterialOut)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    db_material = Material(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

# UPDATE  ← THIS IS WHERE YOUR FUNCTION GOES
@router.put("/{material_id}", response_model=MaterialOut)
def update_material(
    material_id: int,
    material: MaterialCreate,
    db: Session = Depends(get_db)
):
    db_material = db.query(Material).filter(Material.material_id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")

    for key, value in material.dict().items():
        setattr(db_material, key, value)

    db.commit()
    db.refresh(db_material)
    return db_material

# DELETE
@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.material_id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")

    db.delete(db_material)
    db.commit()
    return {"message": "Material deleted"}
