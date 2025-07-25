import React, { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, onShowRecent, showingRecent }) {
  const [searchType, setSearchType] = useState('key');
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(searchType, input.trim());
    }
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <select value={searchType} onChange={e => setSearchType(e.target.value)}>
          <option value="key">Key ID</option>
          <option value="user">User ID</option>
        </select>
        <input
          type="text"
          placeholder={searchType === 'key' ? 'Enter Key ID...' : 'Enter User ID...'}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit">Search</button>
        {onShowRecent && (
          <button type="button" onClick={onShowRecent} className="recent-btn">
            {showingRecent ? '🔄 Refresh Recent' : '📋 Show Recent'}
          </button>
        )}
      </form>
      {showingRecent && (
        <div className="recent-indicator">
          <span className="recent-icon">🕐</span>
          Showing recent keys
        </div>
      )}
    </div>
  );
}
