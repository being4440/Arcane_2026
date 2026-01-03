from fastapi import FastAPI
from routes.material import router as material_router

app = FastAPI()

app.include_router(material_router)
