import { useState, useEffect } from 'react';
import './AdminSettings.css';

function AdminSettings() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempPasswordDuration, setTempPasswordDuration] = useState('24h');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/admin/api/sessions', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      setError('Error fetching sessions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllSessions = async () => {
    if (!window.confirm('Are you sure you want to clear all admin sessions? This will log out all users.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/admin/api/sessions', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Redirect to login since our session will be cleared too
        window.location.href = '/admin/login';
      } else {
        throw new Error('Failed to clear sessions');
      }
    } catch (error) {
      setError('Error clearing sessions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTempPassword = () => {
    // Generate a secure random password using crypto.randomUUID()
    const randomId = crypto.randomUUID();
    // Take first 12 characters and add some special chars for security
    const password = randomId.slice(0, 8) + randomId.slice(-4);
    setTempPassword(password);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Password copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy password:', err);
      alert('Failed to copy password. Please copy manually.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h2>Admin Settings</h2>
        <p>Manage admin sessions and system configuration</p>
      </div>

      <div className="settings-sections">
        {/* Authentication Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h3>🔐 Authentication</h3>
            <p>Manage admin passwords and temporary access</p>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <h4>Admin Password Configuration</h4>
              <p>For security, admin passwords are not displayed here. To change the admin password:</p>
              <div className="password-config-steps">
                <ol>
                  <li>Edit your <code>.env</code> file</li>
                  <li>Set <code>ADMIN_DEFAULT_PASSWORD=your_secure_password</code></li>
                  <li>Restart the application</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <h4>Generate Temporary Password</h4>
              <p>Create secure temporary passwords for other users</p>
              <div className="temp-password-controls">
                <div className="duration-control">
                  <label htmlFor="duration">Duration:</label>
                  <select 
                    id="duration"
                    value={tempPasswordDuration} 
                    onChange={(e) => setTempPasswordDuration(e.target.value)}
                  >
                    <option value="1h">1 hour</option>
                    <option value="2h">2 hours</option>
                    <option value="6h">6 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="3d">3 days</option>
                    <option value="5d">5 days</option>
                    <option value="7d">7 days</option>
                  </select>
                </div>
                <button 
                  onClick={generateTempPassword}
                  className="generate-btn"
                >
                  🔑 Generate Password
                </button>
              </div>
              {tempPassword && (
                <div className="generated-password">
                  <label>Generated Password:</label>
                  <div className="password-display">
                    <code>{tempPassword}</code>
                    <button 
                      onClick={() => copyToClipboard(tempPassword)}
                      className="copy-btn"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                  <p className="password-note">
                    ⚠️ This password is valid for {tempPasswordDuration}. Store it securely and share only with authorized users.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <h4>Environment Variables</h4>
              <p>Configure authentication via environment variables</p>
              <div className="env-vars">
                <code>ADMIN_DEFAULT_PASSWORD=your_secure_password</code>
                <code>SESSION_SECRET=your_session_secret</code>
                <code>JWT_SECRET=your_jwt_secret</code>
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="settings-section">
          <div className="section-header">
            <h3>👥 Active Sessions</h3>
            <p>Monitor and manage active admin sessions</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="sessions-controls">
            <button 
              onClick={fetchSessions} 
              className="refresh-btn"
              disabled={loading}
            >
              {loading ? '🔄' : '🔄'} Refresh Sessions
            </button>
            
            <button 
              onClick={clearAllSessions} 
              className="danger-btn"
              disabled={loading}
            >
              🗑️ Clear All Sessions
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading sessions...</p>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.length === 0 ? (
                <div className="empty-sessions">
                  <div className="empty-icon">👤</div>
                  <h4>No Active Sessions</h4>
                  <p>No admin sessions are currently active</p>
                </div>
              ) : (
                <div className="sessions-table">
                  <div className="table-header">
                    <div className="header-cell">Session ID</div>
                    <div className="header-cell">IP Address</div>
                    <div className="header-cell">Created</div>
                    <div className="header-cell">User Agent</div>
                  </div>
                  {sessions.map((session) => (
                    <div key={session.id} className="table-row">
                      <div className="table-cell session-id">
                        <code>{session.id.substring(0, 12)}...</code>
                      </div>
                      <div className="table-cell ip-address">
                        {session.ip}
                      </div>
                      <div className="table-cell created-date">
                        {formatDate(session.createdAt)}
                      </div>
                      <div className="table-cell user-agent">
                        <span title={session.userAgent}>
                          {session.userAgent?.substring(0, 50)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="settings-section">
          <div className="section-header">
            <h3>💻 System Information</h3>
            <p>Current system configuration and status</p>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <h4>API Version</h4>
              <p>Current version of Kuroukai Free API</p>
              <code className="version-display">v2.0.0</code>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <h4>Documentation</h4>
              <p>Links to documentation and resources</p>
              <div className="links">
                <a href="https://github.com/Kuroukai/Kuroukai-free-api" target="_blank" rel="noopener noreferrer" className="doc-link">
                  📚 GitHub Repository
                </a>
                <a href="/health" target="_blank" rel="noopener noreferrer" className="doc-link">
                  🏥 API Health Check
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;