# 🏢 Enterprise Prom Matchmaking Architecture

This project has been upgraded to a production-ready, enterprise-grade architecture.

## 🏗 Architecture Overview

### Backend (FastAPI)
- **Modular Design**: Code split into `api`, `core`, `models`, and `services`.
- **Resilience**: 
  - `tenacity` for retrying external API calls (Hugging Face).
  - Global Exception Handlers for consistent error responses.
- **Configuration**: `pydantic-settings` for robust environment variable management.
- **Rate Limiting**: `slowapi` integrated to prevent abuse.
- **Type Safety**: Pydantic V2 models used throughout for strict validation.

### Frontend (React + Vite)
- **UX Improvements**: Skeleton loaders for better perceived performance.
- **Feedback**: Toast notifications for user actions.
- **Animations**: polished Framer Motion interactions.

## 🚀 Deployment

### Docker
The application is fully containerized.

1. **Build and Run**:
   ```bash
   docker-compose up --build
   ```

2. **Access**:
   - Frontend: `http://localhost` (port 80)
   - Backend: `http://localhost:8000`

### Manual Production Run

**Backend**:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend**:
```bash
cd frontend
npm run build
# Serve the 'dist' folder using nginx or serve
```

## 📁 New Structure

```
backend/
├── app/
│   ├── api/           # API Routes (clean separation)
│   ├── core/          # Config & Security
│   ├── models/        # Pydantic Schemas
│   ├── services/      # Business Logic (Matching, Firestore)
│   └── main.py        # App Factory
```

## 🛡 Security Features
- Environment variable validation on startup.
- Service Account Key priority loading.
- CORS configuration for trusted origins only.

