import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import './WeeklyList.css';

function WeeklyList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipedRowId, setSwipedRowId] = useState(null);
  const navigate = useNavigate();

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVcqK0UMRh53gQHjTYwpW0V2N69J-aTOl-Hc-aZxhshKQxiqxk5Vfa3Z4YJDXsBiBR/exec';

  // Create array of team numbers 1-10
  const teamNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  useEffect(() => {
    fetchWeeklyPlayers();
  }, []);

  const fetchWeeklyPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SCRIPT_URL}?action=getWeeklyPlayers`);
      const data = await response.json();
      setPlayers(data.players || []);
      setError(null);
    } catch (err) {
      setError('Failed to load players');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (rowIndex, teamNumber) => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateTeam',
          rowIndex: rowIndex,
          team: teamNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update team number');
      }

      // Update local state
      setPlayers(players.map(player => 
        player.rowIndex === rowIndex 
          ? { ...player, team: teamNumber }
          : player
      ));
    } catch (error) {
      console.error('Error updating team number:', error);
    }
  };

  const handleDelete = async (rowIndex) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await fetch(`${SCRIPT_URL}?action=deletePlayer&row=${rowIndex}`, {
          method: 'GET',
          mode: 'no-cors'
        });

        setSwipedRowId(null);
        await fetchWeeklyPlayers();

      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player. Please try again.');
      }
    }
  };

  const handleBackToSignup = () => {
    navigate('/');
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const row = eventData.event.target.closest('tr');
      if (row) {
        const index = parseInt(row.getAttribute('data-row-index'));
        console.log('Swiped left on row:', index);
        setSwipedRowId(index);
      }
    },
    onSwipedRight: () => {
      console.log('Swiped right, resetting');
      setSwipedRowId(null);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (loading) return <div className="loading">Loading players...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="weekly-list-container">
      <div className="header-section">
        <h2>This Week's Players</h2>
        <button 
          onClick={handleBackToSignup}
          className="back-button"
        >
          Back to Signup
        </button>
      </div>
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
                <th>Team</th>
              </tr>
            </thead>
            <tbody {...swipeHandlers}>
              {players.map((player, index) => (
                <tr 
                  key={index}
                  data-row-index={index}
                  className={`player-row ${swipedRowId === index ? 'swiped' : ''}`}
                >
                  <td>{player.firstName}</td>
                  <td>{player.lastName}</td>
                  <td>{player.handicap}</td>
                  
<td className="team-cell">
  <div className="team-content">
    <select
      value={player.team || ''}
      onChange={(e) => handleTeamChange(player.rowIndex, e.target.value)}
      className="team-select"
    >
      <option value="">Select Team</option>
      {teamNumbers.map(num => (
        <option key={num} value={num}>
          Team {num}
        </option>
      ))}
    </select>
    {player.team && (
      <span className="team-label">
        Team {player.team}
      </span>
    )}
  </div>
</td>
                  <td className="delete-action">
                    <button 
                      onClick={() => handleDelete(player.rowIndex)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
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