# Videoparty

A watch party platform that allows users to create rooms and watch videos together without requiring login or passwords.

## Features

- Create and join watch party rooms with simple room codes
- Auto-detect streaming platforms (YouTube, Vimeo, Twitch)
- Playlist mode for queuing multiple videos
- AI-powered content recommendations
- Real-time video synchronization
- No authentication required

## Tech Stack

- **Frontend**: React, React Router DOM, Axios
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Database**: SQLite (development)

## Quick Start

### Backend Setup

```bash
cd backend_python
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/{code}` - Get room details
- `POST /api/rooms/{code}/join` - Join a room
- `PUT /api/rooms/{code}/state` - Update room state
- `POST /api/video/analyze` - Analyze video URL
- `GET /api/recommendations/smart` - Get smart recommendations
- `GET /api/recommendations/trending` - Get trending content
- `GET /api/recommendations/mood` - Get mood-based recommendations

## Usage

1. Create a room by entering a room name and optional video URL
2. Share the generated room code with others
3. Join rooms using the room code
4. Add videos to the playlist
5. Use AI recommendations to discover new content

## Development

The backend uses FastAPI with SQLite for development. The frontend is a React application with a black and white theme.

## License

MIT License
