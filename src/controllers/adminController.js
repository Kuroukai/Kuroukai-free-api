const path = require('path');
const fs = require('fs');
const Logger = require('../utils/logger');
const config = require('../config');

const logger = new Logger(config.logging.level);

class AdminController {
  /**
   * Serve admin dashboard HTML
   */
  getAdminDashboard(req, res) {
    try {
      // Path to built dashboard
      const dashboardPath = path.join(__dirname, '../../dashboard/dist/index.html');

      if (!fs.existsSync(dashboardPath)) {
        return res.status(500).json({
          success: false,
          message: 'Admin dashboard not built. Run "npm run build" in dashboard directory.'
        });
      }

      // Read and modify the HTML to include admin context
      let html = fs.readFileSync(dashboardPath, 'utf8');

      // Fix asset paths to use admin prefix
      html = html.replace(/\/assets\//g, '/admin/assets/');

      // Inject admin configuration into the page
      const adminConfig = `
        <script>
          window.ADMIN_MODE = true;
          window.API_BASE = '${req.protocol}://${req.get('host')}';
          window.ADMIN_SESSION = '${req.adminSession.id}';
        </script>
      `;

      html = html.replace('</head>', `${adminConfig}</head>`);

      res.send(html);
    } catch (error) {
      logger.error('Error serving admin dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error loading admin dashboard'
      });
    }
  }

  /**
   * Serve admin login page
   */
  getAdminLogin(req, res) {
    const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kuroukai Admin - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }

        .login-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: 100%;
            max-width: 400px;
        }

        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .login-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #fff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .login-header p {
            opacity: 0.8;
            font-size: 1.1rem;
        }

        .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-group label {
            font-weight: 600;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .form-group input {
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .login-button {
            padding: 14px 20px;
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
        }

        .login-button:active {
            transform: translateY(0);
        }

        .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .error-message {
            color: #fef2f2;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            font-size: 0.9rem;
            display: none;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>Kuroukai</h1>
            <p>Admin Dashboard</p>
        </div>

        <form class="login-form" id="loginForm">
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter admin password"
                    required
                >
            </div>

            <div class="error-message" id="errorMessage"></div>

            <button type="submit" class="login-button" id="loginButton">
                Sign In
            </button>
        </form>
    </div>

    <script>
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');
        const errorMessage = document.getElementById('errorMessage');

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }

        function setLoading(loading) {
            if (loading) {
                loginButton.disabled = true;
                loginButton.innerHTML = '<span class="loading"></span> Signing in...';
            } else {
                loginButton.disabled = false;
                loginButton.innerHTML = 'Sign In';
            }
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = passwordInput.value;
            if (!password) {
                showError('Please enter a password');
                return;
            }

            setLoading(true);

            try {
                const response = await fetch('/admin/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    window.location.href = '/admin';
                } else {
                    showError(data.message || 'Invalid password');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Connection error. Please try again.');
            } finally {
                setLoading(false);
            }
        });

        // Focus password input on load
        passwordInput.focus();
    </script>
</body>
</html>`;

    res.send(loginHtml);
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(req, res) {
    try {
      const keyService = require('../services/keyService');

      // Get various statistics
      const [
        totalKeys,
        activeKeys,
        expiredKeys,
        recentKeys
      ] = await Promise.all([
        keyService.getTotalKeysCount(),
        keyService.getActiveKeysCount(),
        keyService.getExpiredKeysCount(),
        keyService.getRecentKeys(24) // Last 24 hours
      ]);

      res.json({
        success: true,
        stats: {
          total_keys: totalKeys,
          active_keys: activeKeys,
          expired_keys: expiredKeys,
          recent_keys: recentKeys.length,
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          environment: config.nodeEnv
        }
      });
    } catch (error) {
      logger.error('Error getting admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving statistics'
      });
    }
  }
}

module.exports = new AdminController();
