# Prom Matchmaking App

A Tinder-style matchmaking web application for school prom, built with React.js, FastAPI, Supabase, and Hugging Face embeddings for intelligent profile matching.

## 🎯 Features

- **Authentication**: Google OAuth and email/password authentication via Supabase
- **Profile Setup**: Comprehensive profile creation with image upload
- **Smart Matching**: AI-powered compatibility scoring using Hugging Face embeddings and pgvector
- **Swipe Interface**: Tinder-style card swiping with smooth animations
- **Real-time Matches**: Instant notifications when mutual likes occur
- **Social Integration**: Connect via Instagram, Snapchat, and Twitter
- **Responsive Design**: Beautiful UI with TailwindCSS and Framer Motion
- **Account Management**: Complete account deletion with data cleanup

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: TailwindCSS for utility-first styling
- **Animations**: Framer Motion for smooth interactions
- **Authentication**: Supabase Auth with Google OAuth
- **Storage**: Supabase Storage for profile pictures
- **State Management**: React hooks and context

### Backend (FastAPI)
- **Framework**: FastAPI for high-performance API
- **Database**: PostgreSQL with pgvector extension for vector similarity search
- **AI Matching**: Hugging Face sentence-transformers for embeddings
- **Vector Search**: Database-level vector similarity using pgvector (blazing fast!)
- **CORS**: Configured for frontend communication
- **Rate Limiting**: SlowAPI integration for API protection
- **Error Handling**: Comprehensive exception handling with logging

### AI Matching Algorithm
- Uses `sentence-transformers/all-MiniLM-L6-v2` model
- Generates embeddings from profile descriptions and Q&A responses
- Calculates cosine similarity for compatibility scoring
- Hybrid scoring: 70% AI similarity + 30% shared hobbies
- Hard filters: Gender preferences + Grade filtering
- Returns ranked recommendations based on similarity

## 📁 Project Structure

```
PromMatch/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── SwipeCard.jsx
│   │   │   ├── MatchPopup.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── SkeletonCard.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SwipeDeck.jsx
│   │   │   └── ProfileSetup.jsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useAuth.jsx
│   │   ├── lib/             # Utilities
│   │   │   └── supabase.js
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   └── endpoints/
│   │   │       ├── users.py
│   │   │       ├── matches.py
│   │   │       └── questionnaire.py
│   │   ├── core/            # Configuration
│   │   │   ├── config.py
│   │   │   └── exceptions.py
│   │   ├── models/          # Pydantic schemas
│   │   │   └── schemas.py
│   │   ├── services/        # Business logic
│   │   │   ├── database.py
│   │   │   ├── embeddings.py
│   │   │   ├── matching.py
│   │   │   ├── compatibility_engine.py
│   │   │   └── questionnaire.py
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── env.template
├── database/                 # Database schema
│   ├── schema.sql           # PostgreSQL schema with pgvector
│   └── migration_add_compatibility_score.sql
├── docker-compose.yml        # Docker configuration
├── Dockerfile.backend       # Backend Dockerfile
├── Dockerfile.frontend       # Frontend Dockerfile
├── nginx.conf                # Nginx configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account and project
- Hugging Face account with API key

### 1. Clone and Setup

```bash
git clone https://github.com/tejask-dev/PromMatch.git
cd PromMatch
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy and execute `database/schema.sql`
   - Run `database/migration_add_compatibility_score.sql` if needed
3. Enable pgvector extension (should be automatic)
4. Get your API keys from Project Settings → API

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.template .env
# Edit .env with your actual values:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - HUGGINGFACE_API_KEY

# Run the backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.template .env
# Edit .env with your Supabase config:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable Authentication (Google + Email/Password)
3. Enable Storage for profile pictures
4. Run the database schema from `database/schema.sql`
5. Get your API keys from Project Settings → API

### Hugging Face Setup

1. Create an account at [huggingface.co](https://huggingface.co)
2. Generate an API token
3. Add it to your backend `.env` file

### Environment Variables

#### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Hugging Face API Key
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here

# FastAPI Debug Mode
DEBUG=False
```

#### Frontend (.env)
```env
# Supabase Configuration (PUBLIC keys only!)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 📊 API Endpoints

### Backend API (FastAPI)

- `GET /health` - Health check endpoint
- `POST /users/profile` - Create/update user profile
- `GET /users/profile/{auth_id}` - Get user profile
- `DELETE /users/account/{auth_id}` - Delete user account
- `GET /recommendations` - Get profile recommendations
- `POST /swipe` - Record swipe action (yes/no/super)
- `GET /matches` - Get user's matches
- `GET /questionnaire/questions` - Get questionnaire questions
- `POST /questionnaire/submit-answers` - Submit questionnaire answers

### Example API Usage

```javascript
// Get recommendations
const response = await axios.get('http://localhost:8000/recommendations', {
  headers: { Authorization: `Bearer ${token}` }
});
const recommendations = response.data;

// Record a swipe
await axios.post('http://localhost:8000/swipe', {
  target_user_id: 'user456',
  action: 'yes'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## 🎨 UI Components

### SwipeCard
- Draggable cards with gesture recognition
- Real-time visual feedback during swiping
- Compatibility percentage display
- Smooth animations with Framer Motion

### MatchPopup
- Celebration animation for mutual matches
- Social media integration
- Quick access to contact information

### ProfileSetup
- Multi-step form with progress indicator
- Image upload with preview
- Comprehensive questionnaire for better matching
- Form validation and error handling

## 🔒 Security Features

- Supabase Authentication with Google OAuth
- Row Level Security (RLS) policies in database
- Secure API endpoints with CORS configuration
- Input validation with Pydantic models
- Environment variable protection
- Secure file upload to Supabase Storage
- Rate limiting with SlowAPI
- JWT token verification

## 🚀 Deployment

### Docker Deployment

The application is fully containerized:

```bash
docker-compose up --build
```

Access:
- Frontend: `http://localhost` (port 80)
- Backend: `http://localhost:8000`

### Manual Production Deployment

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

### Environment Variables for Production

Update the CORS origins in `backend/app/core/config.py`:
```python
BACKEND_CORS_ORIGINS: List[str] = [
    "https://your-frontend-domain.com",
    # ... other origins
]
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest
```

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop (1920x1080+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎯 Key Features

- **Enterprise Architecture**: Modular backend with clean separation of concerns
- **Vector Search**: Database-level pgvector similarity search (blazing fast!)
- **Hybrid Matching**: AI embeddings + compatibility scoring + shared interests
- **Questionnaire System**: 25+ questions across 8 categories for better matching
- **Account Deletion**: Complete account removal with data cleanup
- **Production Ready**: Docker support, rate limiting, error handling, logging

## 📚 Documentation

- `SUPABASE_SETUP_GUIDE.md` - Detailed Supabase setup instructions
- `FINAL_SETUP_CHECKLIST.md` - Quick setup checklist
- `MATCHING_SYSTEM_DESIGN.md` - Matching algorithm documentation
- `PRODUCTION_READY.md` - Production deployment guide
- `ENTERPRISE_README.md` - Enterprise architecture overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Ensure Supabase and Hugging Face services are properly configured
4. Check the API endpoints are accessible
5. Review the setup guides in the documentation

## 🎉 Acknowledgments

- [React](https://reactjs.org/) for the frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API
- [Supabase](https://supabase.com/) for authentication, database, and storage
- [Hugging Face](https://huggingface.co/) for AI embeddings
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [pgvector](https://github.com/pgvector/pgvector) for vector similarity search
