# Kuroukai Free API v2.0 - Restructuring Documentation

## Overview

This document outlines the major improvements and restructuring performed on the Kuroukai Free API to make it more secure, modular, and maintainable.

## Key Improvements

### 🔒 Security Enhancements

1. **Removed `eval()` vulnerability**:
   - The original code used `eval()` in the binding script generation
   - Replaced with safe DOM manipulation using `createElement()` and `textContent`

2. **Improved Content Security Policy**:
   - Removed unsafe directives (`'unsafe-inline'`, `'unsafe-eval'`)
   - Implemented proper CSP headers with restrictive policies

3. **Input Validation & Sanitization**:
   - Added comprehensive validation middleware for all inputs
   - UUID format validation for key IDs
   - User input sanitization to prevent XSS attacks
   - Proper bounds checking for numeric values

4. **Rate Limiting**:
   - Added express-rate-limit middleware to prevent abuse
   - Configurable limits via environment variables

### 🏗️ Modular Architecture

The monolithic `index.js` (407 lines) has been restructured into a clean modular architecture:

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

### 🛠️ Code Quality Improvements

1. **Separation of Concerns**:
   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Utilities provide reusable functions
   - Middleware handles cross-cutting concerns

2. **Error Handling**:
   - Centralized error handling with proper logging
   - Structured error responses with consistent format
   - Database error handling with appropriate status codes

3. **Configuration Management**:
   - Environment-based configuration
   - Centralized config with sensible defaults
   - Support for production and development environments

4. **Improved Logging**:
   - Structured logging with configurable levels
   - Request/response logging for debugging
   - Security event logging

### 🚀 Performance Improvements

1. **Better Database Management**:
   - Proper database connection lifecycle
   - Promise-based database operations
   - Improved error handling for database operations

2. **Graceful Shutdown**:
   - Proper cleanup of database connections
   - Graceful server shutdown with timeout

3. **Middleware Optimization**:
   - Logical middleware ordering
   - Request size limits
   - Static file serving optimization

## Migration Guide

### Using the New Version

The new version is fully backward compatible. All existing endpoints work exactly the same:

```bash
# Start the new version
npm start

# Or start the old version for comparison
npm run start:old
```

### Environment Variables

The new version supports additional configuration options:

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

## Security Considerations

### What Was Fixed

1. **XSS Prevention**: Removed `eval()` and implemented safe DOM manipulation
2. **Input Validation**: All inputs are validated and sanitized
3. **CSRF Protection**: Proper CORS configuration
4. **Rate Limiting**: Protection against brute force attacks
5. **Information Disclosure**: Proper error messages without stack traces in production

### Recommendations for Production

1. Set `NODE_ENV=production`
2. Configure appropriate `CORS_ORIGIN` instead of `*`
3. Set up proper rate limiting values for your use case
4. Use HTTPS in production
5. Consider adding authentication for sensitive operations
6. Monitor logs for security events

## Testing

The restructured code includes comprehensive testing:

```bash
# Run the test suite
npm test

# The test covers:
# - Health check
# - Key creation
# - Key validation
# - Key information retrieval
# - User key listing
# - Error handling
```

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Security** | `eval()`, unsafe CSP, no validation | Safe DOM manipulation, proper CSP, input validation |
| **Structure** | 407-line monolith | Modular architecture with separation of concerns |
| **Maintainability** | Hard to modify, mixed concerns | Easy to extend, clear responsibilities |
| **Error Handling** | Basic error responses | Comprehensive error handling with logging |
| **Configuration** | Hardcoded values | Environment-based configuration |
| **Testing** | Basic API test only | Comprehensive test coverage |
| **Documentation** | Minimal inline docs | Full JSDoc documentation |

## Future Enhancements

The new modular structure makes it easy to add:

1. **Authentication**: JWT token-based authentication
2. **Database Abstraction**: Support for multiple database types
3. **Caching**: Redis integration for performance
4. **Monitoring**: Metrics and health monitoring
5. **API Versioning**: Version management for API endpoints
6. **WebSocket Support**: Real-time key status updates

## Conclusion

The restructured Kuroukai Free API v2.0 maintains full backward compatibility while significantly improving security, maintainability, and code quality. The modular architecture provides a solid foundation for future enhancements.
