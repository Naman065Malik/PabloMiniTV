"""FastAPI application entry point.

Defines the FastAPI app instance, includes the routers, and exposes the
health-check endpoint used to verify the service is running.
"""

from __future__ import annotations

from fastapi import FastAPI

from app.api import api_router

app = FastAPI(
    title="Peblo TV Mini API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Return a simple status payload.

    Used by load balancers, orchestrators, and smoke tests to verify the
    service is alive. Always returns 200 when the process is running.
    """
    return {"status": "ok"}


app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
    )
