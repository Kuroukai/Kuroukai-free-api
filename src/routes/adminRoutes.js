const express = require('express');
const path = require('path');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Admin authentication routes (public)
router.post('/auth/login', [
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], adminAuth.authenticate.bind(adminAuth));

router.post('/auth/logout', adminAuth.logout.bind(adminAuth));

// Admin login page (public)
router.get('/login', adminController.getAdminLogin.bind(adminController));

// Serve static dashboard assets WITHOUT authentication (public assets)
router.use('/assets', express.static(path.join(__dirname, '../../dashboard/dist/assets')));

// Middleware to check auth for protected routes
function requireAuthOrRedirect(req, res, next) {
  const sessionToken = req.cookies?.admin_session;
  
  if (!sessionToken) {
    // Redirect to login page if no session
    return res.redirect('/admin/login');
  }
  
  // Use the auth middleware for validation
  adminAuth.requireAuth(req, res, next);
}

// Protected admin routes (require authentication)
router.use('/', requireAuthOrRedirect);

// Admin dashboard main page
router.get('/', adminController.getAdminDashboard.bind(adminController));

// Admin API endpoints
router.get('/api/stats', adminController.getAdminStats.bind(adminController));
router.get('/api/session', adminAuth.getSessionInfo.bind(adminAuth));
router.get('/api/sessions', adminAuth.getActiveSessions.bind(adminAuth));
router.delete('/api/sessions', adminAuth.clearAllSessions.bind(adminAuth));

module.exports = router;