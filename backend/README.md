# TypinVibin Backend API

Node.js + Express backend for the TypinVibin typing practice application.

## Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Run Production Server
```bash
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5174
```

## API Endpoints

### Health Check
```
GET /api/health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "TypinVibin Backend is running"
}
```

### Get All Topics
```
GET /api/topics
```

Returns all 8 typing topics with full context text.

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 0,
      "name": "Nature",
      "difficulty": "easy",
      "context": "..."
    },
    ...
  ]
}
```

### Get Single Topic
```
GET /api/topics/:id
```

Get a specific topic by ID (0-7).

**Response:**
```json
{
  "success": true,
  "id": 0,
  "data": {
    "id": 0,
    "name": "Nature",
    "difficulty": "easy",
    "context": "..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Topic not found",
  "message": "Topic ID must be between 0 and 7"
}
```

## Project Structure

```
backend/
├── server.js                    # Express server & middleware
├── routes/
│   └── topics.js                # Topic API routes
├── controllers/
│   └── topicController.js       # Business logic for topics
├── models/
│   └── Topic.js                 # Topic data & helpers
├── package.json                 # Dependencies & scripts
├── .env.example                 # Environment template
└── README.md                    # This file
```

## Features

- ✅ Express.js HTTP server
- ✅ CORS support for frontend communication
- ✅ RESTful API design
- ✅ All 8 typing topics with difficulty levels
- ✅ Error handling middleware
- ✅ Health check endpoint
- ✅ Environment configuration

## Future Enhancements

- [ ] User authentication & accounts
- [ ] Score storage & leaderboards
- [ ] Statistics & analytics
- [ ] Custom topic creation
- [ ] Real-time multiplayer
- [ ] Advanced caching
- [ ] API rate limiting
- [ ] Database integration (PostgreSQL/MongoDB)

## Testing

### Manual Testing with curl
```bash
# Health check
curl http://localhost:3000/api/health

# Get all topics
curl http://localhost:3000/api/topics

# Get single topic
curl http://localhost:3000/api/topics/0
```

### Using Frontend
The frontend at `http://localhost:5174` can call these endpoints.

## Running Frontend & Backend Together

**Terminal 1 - Frontend:**
```bash
cd .. # Go to project root
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

Now you have:
- Frontend: http://localhost:5174
- Backend: http://localhost:3000

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **nodemon** - Auto-reload on file changes (dev only)

## License

MIT
