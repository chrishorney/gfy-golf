import React, { useState, useEffect } from 'react';
import './WeeklyList.css';

function WeeklyList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOHUfMQr_hpi9TLq3Wi4MBnSJ9w0Yr6LYFM41pQPFS5jy-Qm0f5pSr1gZXqq-7hMTJ/exec'; // We'll create a new endpoint for this

  useEffect(() => {
    fetchWeeklyPlayers();
  }, []);

  const fetchWeeklyPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SCRIPT_URL}?action=getWeeklyPlayers`);
      const data = await response.json();
      setPlayers(data.players);
      setError(null);
    } catch (err) {
      setError('Failed to load players');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading players...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="weekly-list-container">
      <h2>This Week's Players</h2>
      <div className="players-list">
        {players.length === 0 ? (
          <p>No players signed up yet this week</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Handicap</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td>{player.firstName}</td>
                  <td>{player.lastName}</td>
                  <td>{player.handicap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default WeeklyList;