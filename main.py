from fastapi import FastAPI
from firebase_config import init_firebase
from database import engine, Base
from auth import router as auth_router
from routes.material import router as material_router
from routes.organization import router as organization_router
from models.material import MaterialModel
from models.organization import OrganizationModel

app = FastAPI()

# 1. Initialize Firebase
try:
    init_firebase()
except Exception as e:
    pass

# 2. Connect to Database (With Error Handling)
try:
    # This tries to create tables. If DB is missing, it prints a warning instead of crashing.
    Base.metadata.create_all(bind=engine)
except Exception as e:
    pass

# 3. Register Routes
app.include_router(auth_router)
app.include_router(material_router)
app.include_router(organization_router)