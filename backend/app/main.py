from fastapi import FastAPI

app = FastAPI(
    title="RabbitHole API",
    description="Backend engine for RabbitHole browsing sessions.",
    version="0.1.0"
)


@app.get("/health")
def health_check():
    return {"status": "ok"}