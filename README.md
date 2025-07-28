# Kuroukai Free API v2.0

## Overview

API for generating and managing temporary access keys. Token-based authentication system with automatic expiration.

### 🏗️ Modular Architecture

#### Dashboard Structure
```
dashboard/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx    # Main dashboard component
│   │   ├── AdminSettings.jsx     # Settings panel
│   │   ├── DashboardStats.jsx    # Statistics display
│   │   ├── KeysManager.jsx       # Key management interface
│   │   ├── KeysTable.jsx         # Keys table component
│   │   ├── SearchBar.jsx         # Search functionality
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   └── StatusBar.jsx         # Status indicators
│   ├── App.jsx                   # Main React app
│   └── main.jsx                  # Entry point
├── dist/                         # Built files for production
└── package.json
```

#### API Structure
```
src/
├── app.js                 # Main application entry point
├── config/
│   ├── index.js          # Configuration management
│   └── database.js       # Database connection and setup
├── controllers/
│   ├── keyController.js  # Key-related endpoints
│   └── appController.js  # App-related endpoints (health, info)
├── middleware/
│   ├── validation.js     # Input validation middleware
│   └── errorHandler.js   # Error handling and logging
├── services/
│   └── keyService.js     # Business logic for key operations
├── routes/
│   ├── keyRoutes.js      # Key API routes
│   └── appRoutes.js      # App routes
└── utils/
    ├── keyUtils.js       # Key utility functions
    └── logger.js         # Logging utility
```

### Environment Variables


```bash
# Copy and configure environment variables
cp .env.example .env

# Key environment variables:
PORT=3000
NODE_ENV=production
DATABASE_PATH=./keys.db
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX=100    # requests per window
DEFAULT_KEY_HOURS=24
MAX_KEY_HOURS=168
LOG_LEVEL=info
```

### API Compatibility

All existing API endpoints remain unchanged:

- `POST /api/keys/create` - Create new access key
- `GET /api/keys/validate/:keyId` - Validate a key
- `GET /api/keys/info/:keyId` - Get key information
- `GET /api/keys/user/:userId` - Get all keys for user
- `GET /bind/:keyId.js` - Get validation JS file (now secure!)
- `GET /test/:keyId` - Test validation with visual interface
- `GET /health` - Health check (enhanced)
- `DELETE /api/keys/:keyId` - Delete a key

### Next Features

Planned features and improvements in [NEXT.md](./NEXT.md)

---

> Project made by [Kuroukai](https://github.com/Kuroukai)
