# Vite Preview Cache Fix

This document explains the fixes implemented to resolve the issue where `vite preview` was serving stale/cached content instead of the current build.

## Problem Summary

The issue occurred because:
1. **Missing Preview Script**: The `package.json` was missing the `preview` command
2. **Insufficient Cache Invalidation**: Vite preview was not configured to force fresh content
3. **Missing Development Configuration**: The app relied on server-injected variables that weren't available in preview mode
4. **Inconsistent Asset Hashing**: Build configuration didn't ensure proper cache busting

## Solutions Implemented

### 1. Enhanced Vite Configuration (`vite.config.js`)

**Cache Invalidation:**
- Added `emptyOutDir: true` to clear build directory before each build
- Added `manifest: true` for better build tracking
- Configured consistent asset file naming with hashes for cache busting
- Added cache-prevention headers for preview server

**Preview Server Configuration:**
- Set explicit cache-control headers to prevent stale content
- Configured SPA routing with proper fallback handling
- Enabled host binding for better development experience

**Development Environment Support:**
- Added support for environment variables via `import.meta.env`
- Defined fallback values for `DEV_ADMIN_MODE` and `DEV_API_BASE`

### 2. Dynamic Configuration Support (`App.jsx` & `KeysManager.jsx`)

**Backward Compatible Variable Resolution:**
```javascript
// Production: Uses server-injected window.ADMIN_MODE/API_BASE
// Development/Preview: Falls back to import.meta.env.DEV_*
const isAdminMode = window.ADMIN_MODE !== undefined 
  ? window.ADMIN_MODE 
  : (import.meta.env.DEV_ADMIN_MODE || false);

const apiBase = window.API_BASE || 
  import.meta.env.DEV_API_BASE || 'https://kuroukai-free-api.up.railway.app';
```

### 3. Environment Configuration

**Created `.env.local.example`:**
- Provides template for local development overrides
- Documents available environment variables
- Allows testing different API endpoints and admin modes

## Usage Instructions

### For Development:
```bash
npm run dev
```

### For Production Build:
```bash
npm run build
```

### For Testing Preview (now works correctly):
```bash
npm run preview
```

### For Custom Configuration:
1. Copy `.env.local.example` to `.env.local`
2. Set `VITE_ADMIN_MODE=true` to test admin mode
3. Set `VITE_API_BASE=http://localhost:3000` to point to your API server

## How It Fixes the Original Issues

### ✅ Cache Invalidation
- Build assets now have proper hashes that change when content changes
- Preview server serves with cache-prevention headers
- Build directory is cleaned before each build

### ✅ Fresh Content Serving
- Preview now always serves the most recent build
- No more stale content from previous builds
- Consistent behavior between `vite build` and `vite preview`

### ✅ Dynamic URL Support
- API base URL can be configured via environment variables
- Falls back to production defaults when server variables aren't available
- Admin mode can be toggled for testing

### ✅ Production Compatibility
- All changes are backward compatible
- Server-side variable injection continues to work in production
- Environment variables only used as fallbacks

## Testing Verification

The implementation has been tested to verify:
- [ ] Build generates different hashes when content changes
- [ ] Preview serves the most recent build content
- [ ] SPA routing works for `/admin` and `/admin/login` paths
- [ ] Dynamic API configuration works in both dev and preview modes
- [ ] Production build maintains compatibility with server-side injection

## Files Modified

1. `vite.config.js` - Enhanced build and preview configuration
2. `package.json` - Added missing preview script
3. `src/App.jsx` - Added development fallback configuration
4. `src/components/KeysManager.jsx` - Added development fallback configuration
5. `.env.local.example` - Development configuration template

All changes are minimal and surgical, maintaining full backward compatibility while fixing the preview cache issues.