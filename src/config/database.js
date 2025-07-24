const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DATABASE_PATH || './keys.db';
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initialize().then(resolve).catch(reject);
        }
      });
    });
  }

  initialize() {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS access_keys (
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
        )
      `;

      this.db.serialize(() => {
        this.db.run(createTableSQL, (err) => {
          if (err) {
            console.error('Error creating table:', err.message);
            reject(err);
          } else {
            console.log('Database tables initialized');
            resolve();
          }
        });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getDb() {
    return this.db;
  }
}

module.exports = new Database();