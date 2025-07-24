const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./keys.db');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS access_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_accessed DATETIME,
    usage_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    ip_address TEXT,
    created_by TEXT DEFAULT 'api'
  )`);
});

// Helper functions
function generateKey() {
  return uuidv4();
}

function getExpirationDate(hours = 24) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry.toISOString();
}

function isKeyValid(key) {
  const now = new Date().toISOString();
  return key.status === 'active' && key.expires_at > now;
}

function getRemainingTime(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  
  if (diff <= 0) return { expired: true, remaining: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    expired: false,
    remaining: diff,
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`
  };
}

// Routes

// Create new key for a user
app.post('/api/keys/create', (req, res) => {
  const { user_id, hours = 24 } = req.body;
  
  if (!user_id) {
    return res.status(400).json({
      error: 'user_id is required',
      code: 400
    });
  }

  const keyId = generateKey();
  const expiresAt = getExpirationDate(hours);
  const ipAddress = req.ip || req.connection.remoteAddress;

  db.run(
    `INSERT INTO access_keys (key_id, user_id, expires_at, ip_address) 
     VALUES (?, ?, ?, ?)`,
    [keyId, user_id, expiresAt, ipAddress],
    function(err) {
      if (err) {
        return res.status(500).json({
          error: 'Failed to create key',
          code: 500
        });
      }

      res.json({
        msg: 'Key created successfully',
        code: 200,
        data: {
          key_id: keyId,
          user_id,
          expires_at: expiresAt,
          valid_for_hours: hours
        }
      });
    }
  );
});

// Validate key
app.get('/api/keys/validate/:keyId', (req, res) => {
  const { keyId } = req.params;

  db.get(
    'SELECT * FROM access_keys WHERE key_id = ?',
    [keyId],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          error: 'Database error',
          code: 500
        });
      }

      if (!row) {
        return res.status(404).json({
          error: 'Key not found',
          code: 404
        });
      }

      const valid = isKeyValid(row);
      const timeInfo = getRemainingTime(row.expires_at);

      // Update usage statistics
      if (valid) {
        db.run(
          'UPDATE access_keys SET usage_count = usage_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE key_id = ?',
          [keyId]
        );
      }

      res.json({
        valid,
        key_id: keyId,
        user_id: row.user_id,
        status: row.status,
        created_at: row.created_at,
        expires_at: row.expires_at,
        time_remaining: timeInfo,
        usage_count: row.usage_count + (valid ? 1 : 0),
        code: valid ? 200 : 410
      });
    }
  );
});

// Get key info and remaining time
app.get('/api/keys/info/:keyId', (req, res) => {
  const { keyId } = req.params;

  db.get(
    'SELECT * FROM access_keys WHERE key_id = ?',
    [keyId],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          error: 'Database error',
          code: 500
        });
      }

      if (!row) {
        return res.status(404).json({
          error: 'Key not found',
          code: 404
        });
      }

      const valid = isKeyValid(row);
      const timeInfo = getRemainingTime(row.expires_at);

      res.json({
        msg: valid ? 'Key is active' : 'Key is expired or inactive',
        code: valid ? 200 : 410,
        data: {
          key_id: keyId,
          user_id: row.user_id,
          valid,
          status: row.status,
          created_at: row.created_at,
          expires_at: row.expires_at,
          time_remaining: timeInfo,
          usage_count: row.usage_count,
          last_accessed: row.last_accessed
        }
      });
    }
  );
});

// Get all keys for a user
app.get('/api/keys/user/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT * FROM access_keys WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: 'Database error',
          code: 500
        });
      }

      const keys = rows.map(row => {
        const valid = isKeyValid(row);
        const timeInfo = getRemainingTime(row.expires_at);
        
        return {
          key_id: row.key_id,
          valid,
          status: row.status,
          created_at: row.created_at,
          expires_at: row.expires_at,
          time_remaining: timeInfo,
          usage_count: row.usage_count,
          last_accessed: row.last_accessed
        };
      });

      res.json({
        msg: `Found ${keys.length} keys for user`,
        code: 200,
        user_id: userId,
        keys
      });
    }
  );
});

// Test endpoint - serves HTML page with JS validation
app.get('/test/:keyId', (req, res) => {
  const { keyId } = req.params;
  
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kuroukai Key Validation</title>
</head>
<body>
    <script>
      // Load the validation script
      fetch('/bind/${keyId}.js')
        .then(response => response.text())
        .then(scriptContent => {
          eval(scriptContent);
        })
        .catch(error => {
          document.body.style.backgroundColor = '#000000';
          document.body.style.color = '#ff0000';
          document.body.style.fontFamily = 'monospace';
          document.body.style.padding = '20px';
          document.body.innerHTML = '<pre>Error loading validation script: ' + error.message + '</pre>';
        });
    </script>
</body>
</html>
  `);
});

// Special endpoint - serves .js file with validation response
app.get('/bind/:keyId.js', (req, res) => {
  const { keyId } = req.params;

  db.get(
    'SELECT * FROM access_keys WHERE key_id = ?',
    [keyId],
    (err, row) => {
      if (err || !row) {
        const errorResponse = {
          msg: "Binding failed, key not found.",
          code: 404
        };
        
        res.set('Content-Type', 'application/javascript');
        return res.send(`
// Kuroukai Free API - Key Validation
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';
document.body.style.fontFamily = 'monospace';
document.body.style.padding = '20px';
document.body.innerHTML = '<pre>' + JSON.stringify(${JSON.stringify(errorResponse)}, null, 2) + '</pre>';
console.log(${JSON.stringify(errorResponse)});
        `);
      }

      const valid = isKeyValid(row);
      let response;

      if (valid) {
        // Update usage statistics
        db.run(
          'UPDATE access_keys SET usage_count = usage_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE key_id = ?',
          [keyId]
        );

        response = {
          msg: "Binding is ok, you can now use it normally.",
          code: 200
        };
      } else {
        response = {
          msg: "Binding failed, key has expired.",
          code: 410
        };
      }

      res.set('Content-Type', 'application/javascript');
      res.send(`
// Kuroukai Free API - Key Validation
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';
document.body.style.fontFamily = 'monospace';
document.body.style.padding = '20px';
document.body.innerHTML = '<pre>' + JSON.stringify(${JSON.stringify(response)}, null, 2) + '</pre>';
console.log(${JSON.stringify(response)});
      `);
    }
  );
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    msg: 'Kuroukai Free API is running',
    code: 200,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    msg: 'Kuroukai Free API',
    code: 200,
    endpoints: {
      'POST /api/keys/create': 'Create new access key',
      'GET /api/keys/validate/:keyId': 'Validate a key',
      'GET /api/keys/info/:keyId': 'Get key information',
      'GET /api/keys/user/:userId': 'Get all keys for user',
      'GET /bind/:keyId.js': 'Get validation JS file',
      'GET /test/:keyId': 'Test validation with visual interface',
      'GET /health': 'Health check'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    code: 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 404
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Kuroukai Free API running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});