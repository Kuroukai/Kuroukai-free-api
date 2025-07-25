import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import StatusBar from './components/StatusBar';
import SearchBar from './components/SearchBar';
import KeysTable from './components/KeysTable';

function App() {
  const [count, setCount] = useState(0);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API base URL (change as needed)
  const API_BASE = 'https://kuroukai-free-api.up.railway.app'; // 'http://localhost:3000' or 'https://kuroukai-free-api.up.railway.app'

  // Search function integrated with API
  const handleSearch = async (type, value) => {
    setLoading(true);
    setError('');
    setKeys([]);
    let url = '';
    if (type === 'key') {
      url = `${API_BASE}/api/keys/info/${value}`;
    } else {
      url = `${API_BASE}/api/keys/user/${value}`;
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
        active: item.active
      });
      if (type === 'key') {
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

  // Action functions integrated with API
  const handleDelete = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this key?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/keys/${keyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting');
      setKeys(keys.filter(k => k.keyId !== keyId));
    } catch (err) {
      setError('Error deleting: ' + err.message);
    }
    setLoading(false);
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Block this user?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/keys/block/${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Error blocking user');
      // Optionally: update key list if needed
    } catch (err) {
      setError('Error blocking: ' + err.message);
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

  return (
    <div className="dashboard-container">
      <StatusBar apiBase={API_BASE} />
      <h1 className="dashboard-title">API Keys Control Panel</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <div className="dashboard-loading">Loading...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      <KeysTable
        keys={keys}
        onDelete={handleDelete}
        onBlockUser={handleBlockUser}
        onToggleActive={handleToggleActive}
        onEditExpiry={handleEditExpiry}
      />
    </div>
  );
}

export default App
