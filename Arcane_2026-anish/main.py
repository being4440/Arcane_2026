
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routes import auth, material, request, map, admin, feedback, report, analytics

def create_application() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Register Routers
    app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
    app.include_router(material.router, prefix=f"{settings.API_V1_STR}/materials", tags=["materials"])
    app.include_router(request.router, prefix=f"{settings.API_V1_STR}", tags=["interactions"])
    app.include_router(map.router, prefix=f"{settings.API_V1_STR}/map", tags=["map"])
    app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
    app.include_router(feedback.router, prefix=f"{settings.API_V1_STR}/interactions", tags=["feedback"])
    app.include_router(report.router, prefix=f"{settings.API_V1_STR}/interactions", tags=["reports"])
    app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
    
    return app

app = create_application()

@app.get("/")
async def root():
    return {"message": "Welcome to Upcycle API", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
