import { useState } from 'react';
import './KeysManager.css';

function KeysManager() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('key');
  const [searchValue, setSearchValue] = useState('');

  // API base URL
  const API_BASE = window.API_BASE || 'http://localhost:3000';

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setLoading(true);
    setError('');
    setKeys([]);
    
    let url = '';
    if (searchType === 'key') {
      url = `${API_BASE}/api/keys/info/${searchValue}`;
    } else {
      url = `${API_BASE}/api/keys/user/${searchValue}`;
    }
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Not found or API error');
      const data = await res.json();
      
      // Normalize keys to snake_case for table
      const normalize = (item) => ({
        keyId: item.key_id,
        userId: item.user_id,
        expiry: item.expires_at,
        active: item.active !== false, // Default to true if not specified
        status: item.status || 'active',
        created: item.created_at,
        usage: item.usage_count || 0,
        lastAccessed: item.last_accessed
      });
      
      if (searchType === 'key') {
        // API returns { data: {...} }
        setKeys(data && data.data ? [normalize(data.data)] : []);
      } else {
        setKeys(Array.isArray(data) ? data.map(normalize) : []);
      }
    } catch (err) {
      setError('Error searching: ' + err.message);
      setKeys([]);
    }
    setLoading(false);
  };

  const handleDelete = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this key?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/keys/${keyId}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) throw new Error('Error deleting');
      
      setKeys(keys.filter(k => k.keyId !== keyId));
    } catch (err) {
      setError('Error deleting: ' + err.message);
    }
    setLoading(false);
  };

  const handleToggleActive = async (keyId) => {
    setLoading(true);
    setError('');
    
    try {
      const key = keys.find(k => k.keyId === keyId);
      const res = await fetch(`${API_BASE}/api/keys/${keyId}/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !key.active })
      });
      
      if (!res.ok) throw new Error('Error updating status');
      
      setKeys(keys.map(k => k.keyId === keyId ? { ...k, active: !k.active } : k));
    } catch (err) {
      setError('Error toggling active: ' + err.message);
    }
    setLoading(false);
  };

  const handleEditExpiry = async (keyId) => {
    const newExpiry = window.prompt('New expiration time (e.g.: 2025-12-31T23:59:59Z):');
    if (!newExpiry) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/keys/${keyId}/expiry`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiry: newExpiry })
      });
      
      if (!res.ok) throw new Error('Error editing expiry');
      
      setKeys(keys.map(k => k.keyId === keyId ? { ...k, expiry: newExpiry } : k));
    } catch (err) {
      setError('Error editing expiry: ' + err.message);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="keys-manager">
      <div className="manager-header">
        <h2>API Keys Manager</h2>
        <p>Search and manage API keys by key ID or user ID</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="search-type"
            >
              <option value="key">Search by Key ID</option>
              <option value="user">Search by User ID</option>
            </select>
            
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'key' ? 'Enter key ID...' : 'Enter user ID...'}
              className="search-input"
            />
            
            <button 
              type="submit" 
              className="search-button"
              disabled={loading}
            >
              {loading ? <span className="loading-icon">⏳</span> : '🔍'} Search
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>

      <div className="results-section">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {!loading && keys.length === 0 && searchValue && !error && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No keys found</h3>
            <p>Try searching with a different {searchType === 'key' ? 'key ID' : 'user ID'}</p>
          </div>
        )}

        {!loading && keys.length === 0 && !searchValue && !error && (
          <div className="empty-state">
            <div className="empty-icon">🔑</div>
            <h3>Ready to search</h3>
            <p>Enter a key ID or user ID above to get started</p>
          </div>
        )}

        {keys.length > 0 && (
          <div className="keys-table-container">
            <table className="keys-table">
              <thead>
                <tr>
                  <th>Key ID</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Usage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.keyId} className={isExpired(key.expiry) ? 'expired' : ''}>
                    <td className="key-id">
                      <code>{key.keyId}</code>
                    </td>
                    <td className="user-id">{key.userId}</td>
                    <td>
                      <span className={`status-badge ${key.active && !isExpired(key.expiry) ? 'active' : 'inactive'}`}>
                        {key.active && !isExpired(key.expiry) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(key.created)}</td>
                    <td className={isExpired(key.expiry) ? 'expired-date' : ''}>
                      {formatDate(key.expiry)}
                    </td>
                    <td>{key.usage || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleToggleActive(key.keyId)}
                          className={`action-btn ${key.active ? 'deactivate' : 'activate'}`}
                          title={key.active ? 'Deactivate key' : 'Activate key'}
                        >
                          {key.active ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleEditExpiry(key.keyId)}
                          className="action-btn edit"
                          title="Edit expiry date"
                        >
                          ⏰
                        </button>
                        <button
                          onClick={() => handleDelete(key.keyId)}
                          className="action-btn delete"
                          title="Delete key"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default KeysManager;