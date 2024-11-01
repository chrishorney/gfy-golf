import React, { useState, useEffect } from 'react';
import './WeeklyList.css';

function WeeklyList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7zpTM85fM2fXyu6MF-0XsRJ1-DJzRFlc2vxGopHlAovcRVi1xaVGCVeaZLlob0GWG/exec';

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

  const handleDelete = async (rowIndex) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await fetch(`${SCRIPT_URL}?action=deletePlayer&row=${rowIndex}`, {
          method: 'GET',  // Changed from DELETE to GET
          mode: 'no-cors'
        });

        // Refresh the list after deletion
        await fetchWeeklyPlayers();

      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player. Please try again.');
      }
    }
  };

        // Since we can't read the response due to no-cors, we'll assume success
        // Remove player from local state
        setPlayers(currentPlayers => 
          currentPlayers.filter((_, index) => index !== rowIndex)
        );

      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player. Please try again.');
      }
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td>{player.firstName}</td>
                  <td>{player.lastName}</td>
                  <td>{player.handicap}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(index)}
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