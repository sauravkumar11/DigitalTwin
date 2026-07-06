from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    auth,
    patients,
    organs,
    reports,
    medications,
    diet,
    timeline,
    share,
)
from app.api.routes import access
from app.core.config import settings
from app.db.session import Base, engine
from app.models import models  # noqa: F401 ensures models are registered
from app.api.routes import auth, patients, organs, reports, medications, diet, timeline

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # For demo purposes we auto-create tables. In production, use Alembic
    # migrations (see backend/alembic/) instead of create_all.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(patients.router, prefix=settings.API_V1_PREFIX)
app.include_router(organs.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(medications.router, prefix=settings.API_V1_PREFIX)
app.include_router(diet.router, prefix=settings.API_V1_PREFIX)
app.include_router(timeline.router, prefix=settings.API_V1_PREFIX)
app.include_router(share.router, prefix=settings.API_V1_PREFIX)
app.include_router(access.router, prefix=settings.API_V1_PREFIX)
