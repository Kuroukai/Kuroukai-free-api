const Logger = require('../utils/logger');
const config = require('../config');

const logger = new Logger(config.logging.level);

// Simple in-memory session store (for development)
// In production, use Redis or similar
const sessions = new Map();

// Default admin passwords (configurable via environment)
const adminPasswords = {
  default: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
  temp: process.env.ADMIN_TEMP_PASSWORD || 'temp456'
};

class AdminAuth {
  /**
   * Generate session token
   */
  generateSession() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Authenticate admin login
   */
  authenticate(req, res, next) {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password required'
      });
    }

    // Check if password matches any valid admin password
    const isValidPassword = Object.values(adminPasswords).includes(password);
    
    if (!isValidPassword) {
      logger.warn(`Failed admin login attempt from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Create session
    const sessionToken = this.generateSession();
    const sessionData = {
      id: sessionToken,
      createdAt: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    sessions.set(sessionToken, sessionData);

    // Set session cookie
    res.cookie('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    });

    logger.info(`Admin login successful from ${req.ip}`);
    
    return res.json({
      success: true,
      message: 'Authentication successful',
      sessionToken
    });
  }

  /**
   * Middleware to check if user is authenticated
   */
  requireAuth(req, res, next) {
    const sessionToken = req.cookies?.admin_session || req.headers['x-admin-session'];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const session = sessions.get(sessionToken);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Check session age (24 hours)
    const sessionAge = Date.now() - session.createdAt.getTime();
    if (sessionAge > 24 * 60 * 60 * 1000) {
      sessions.delete(sessionToken);
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    req.adminSession = session;
    next();
  }

  /**
   * Logout and destroy session
   */
  logout(req, res) {
    const sessionToken = req.cookies?.admin_session;
    
    if (sessionToken) {
      sessions.delete(sessionToken);
      res.clearCookie('admin_session');
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  /**
   * Get session info
   */
  getSessionInfo(req, res) {
    res.json({
      success: true,
      session: {
        id: req.adminSession.id,
        createdAt: req.adminSession.createdAt,
        ip: req.adminSession.ip
      }
    });
  }

  /**
   * List all active sessions (admin utility)
   */
  getActiveSessions(req, res) {
    const activeSessions = Array.from(sessions.values()).map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      ip: session.ip,
      userAgent: session.userAgent
    }));

    res.json({
      success: true,
      sessions: activeSessions,
      count: activeSessions.length
    });
  }

  /**
   * Clear all sessions (admin utility)
   */
  clearAllSessions(req, res) {
    const count = sessions.size;
    sessions.clear();
    
    logger.info(`Cleared ${count} admin sessions`);
    
    res.json({
      success: true,
      message: `Cleared ${count} sessions`
    });
  }
}

module.exports = new AdminAuth();