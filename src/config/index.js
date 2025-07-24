const config = {
  // Server configuration
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    path: process.env.DATABASE_PATH || './keys.db'
  },
  
  // Security configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    helmetOptions: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  },
  
  // Key configuration
  keys: {
    defaultHours: parseInt(process.env.DEFAULT_KEY_HOURS) || 24,
    maxHours: parseInt(process.env.MAX_KEY_HOURS) || 168, // 7 days
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;