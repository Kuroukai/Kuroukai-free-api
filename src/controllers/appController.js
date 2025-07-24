const Logger = require('../utils/logger');
const config = require('../config');

const logger = new Logger(config.logging.level);

class AppController {
  /**
   * Health check endpoint
   */
  healthCheck(req, res) {
    res.json({
      msg: 'Kuroukai Free API is running',
      code: 200,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: config.nodeEnv
    });
  }

  /**
   * Root endpoint with API documentation
   */
  getApiInfo(req, res) {
    res.json({
      msg: 'Kuroukai Free API',
      code: 200,
      version: '2.0.0',
      endpoints: {
        'POST /api/keys/create': 'Create new access key',
        'GET /api/keys/validate/:keyId': 'Validate a key',
        'GET /api/keys/info/:keyId': 'Get key information',
        'GET /api/keys/user/:userId': 'Get all keys for user',
        'GET /bind/:keyId.js': 'Get validation JS file',
        'GET /test/:keyId': 'Test validation with visual interface',
        'GET /health': 'Health check'
      },
      documentation: {
        github: 'https://github.com/Kuroukai/Kuroukai-free-api',
        readme: 'See README.md for detailed usage instructions'
      }
    });
  }

  /**
   * Test endpoint for visual validation
   */
  getTestPage(req, res) {
    const { keyId } = req.params;
    
    // Validate keyId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(keyId)) {
      return res.status(400).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kuroukai Key Validation - Error</title>
</head>
<body style="background-color: #000000; color: #ff0000; font-family: monospace; padding: 20px;">
    <pre>Error: Invalid key ID format</pre>
</body>
</html>
      `);
    }
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kuroukai Key Validation</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
</head>
<body>
    <script>
      // Load the validation script safely
      fetch('/bind/${keyId}.js')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load validation script');
          }
          return response.text();
        })
        .then(scriptContent => {
          // Create script element instead of using eval
          const script = document.createElement('script');
          script.textContent = scriptContent;
          document.head.appendChild(script);
        })
        .catch(error => {
          document.body.style.backgroundColor = '#000000';
          document.body.style.color = '#ff0000';
          document.body.style.fontFamily = 'monospace';
          document.body.style.padding = '20px';
          document.body.innerHTML = '<pre>Error loading validation script: ' + error.message + '</pre>';
          console.error('Validation error:', error);
        });
    </script>
</body>
</html>`;
    
    res.send(html);
  }
}

module.exports = new AppController();