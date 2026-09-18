# PowerIQ Backend

Python FastAPI backend for the PowerIQ factory energy management dashboard.

## Setup

1. Create a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and update values.

```bash
cp .env.example .env
```

4. Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

5. Start Celery worker in a separate terminal:

```bash
celery -A services.scheduler worker --loglevel=info
```

## Seed mock data

```bash
curl http://localhost:8000/dev/seed
```

## API docs

Open:

- http://localhost:8000/docs
- http://localhost:8000/redoc

## Testing

```bash
pytest tests/
```

## Notes

- The backend exposes the same data shape used by the React frontend so the frontend can swap from mock data to live API data without code changes.
- Default supervisor PIN is `1234`.
- The app includes a lightweight in-memory state for demonstration use when no database is available.
