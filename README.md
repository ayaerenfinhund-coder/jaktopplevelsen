# Jaktopplevelsen - Hunting Log Website

A comprehensive hunting log application that integrates with Garmin Alpha 200 dog tracking data.

## Features

- 📍 Import and display GPX tracks from Garmin Alpha 200 devices
- 🗓️ Log hunting days with detailed tracking information
- 🐕 Manage multiple dogs and their individual tracks
- 📷 Photo and note management for each hunt
- 📊 Data export capabilities (GPX, KML, JSON)
- 🗺️ Interactive mapping with track playback
- 🌙 Dark mode support with hunting-themed design

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Leaflet** for interactive maps
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **FastAPI** (Python) for REST API
- **SQLAlchemy** with PostgreSQL
- **Garmin Connect API** integration
- **JWT** authentication

### Storage
- PostgreSQL database
- Local file storage for photos
- GPX/GeoJSON track data

## Project Structure

```
jaktopplevelsen/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                  # Python FastAPI backend
│   ├── api/                 # API routes
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── garmin/              # Garmin integration
│   └── main.py              # Application entry point
├── database/                # Database migrations and schemas
└── docs/                    # Documentation and specifications
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Garmin Connect account

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Design System

### Colors
- **Primary:** Forest Green (#2D5016)
- **Secondary:** Earth Brown (#8B6914)
- **Accent:** Autumn Orange (#D4752E)
- **Background:** Charcoal (#1A1A1A)
- **Text:** Off-white (#F5F5F5)

### Typography
- **Headings:** Inter (Bold)
- **Body:** Inter (Regular)
- **Monospace:** JetBrains Mono

## License

MIT License - See LICENSE file for details
