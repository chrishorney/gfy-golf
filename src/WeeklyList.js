import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import './WeeklyList.css';
import WeatherWidget from './components/WeatherWidget';

function WeeklyList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipedRowId, setSwipedRowId] = useState(null);
  const [updatingGuest, setUpdatingGuest] = useState(false);
  const navigate = useNavigate();

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZ2uOPLvYzSOaDydSFzbq5TLR5TerR-c2StKxYExRaizS5P9ZvaLV31o4OW-kxZGsQ/exec';

  // Create array of team numbers 1-10
  const teamNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  useEffect(() => {
    fetchWeeklyPlayers();
  }, []);

  // Add the grouping function
  const groupPlayersByTeam = (players) => {
    return [...players].sort((a, b) => {
      if (!a.team && !b.team) return 0;
      if (!a.team) return -1;
      if (!b.team) return 1;
      return parseInt(a.team) - parseInt(b.team);
    });
  };

  const fetchWeeklyPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SCRIPT_URL}?action=getWeeklyPlayers`);
      const data = await response.json();
      console.log('Fetched players:', data.players);
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
      console.log('Attempting to update team:', { rowIndex, teamNumber });
  
      const response = await fetch(`${SCRIPT_URL}?action=updateTeam&row=${rowIndex}&team=${teamNumber}`, {
        method: 'GET',
        mode: 'no-cors',
      });
  
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.rowIndex === rowIndex 
            ? { ...player, team: teamNumber }
            : player
        )
      );
  
      setTimeout(() => {
        fetchWeeklyPlayers();
      }, 1000);
  
    } catch (error) {
      console.error('Error updating team number:', error);
      alert('Failed to update team. Please try again.');
    }
  };

  const handleDelete = async (rowIndex) => {
    if (window.confirm('Bitching out?')) {
      try {
        console.log('Attempting to delete row:', rowIndex);
        const response = await fetch(`${SCRIPT_URL}?action=deletePlayer&row=${rowIndex}`, {
          method: 'GET',
          mode: 'no-cors'
        });

        setTimeout(async () => {
          await fetchWeeklyPlayers();
          setSwipedRowId(null);
        }, 1000);

      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player. Please try again.');
      }
    }
  };

  const handleGuestChange = async (rowIndex, invitedBy) => {
    try {
      if (updatingGuest) return; // Prevent multiple simultaneous updates
      setUpdatingGuest(true);
      console.log('Updating guest status:', { rowIndex, invitedBy });

      // Optimistically update UI
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.rowIndex === rowIndex 
            ? { ...player, invitedBy: invitedBy }
            : player
        )
      );

      // Make API call
      const url = `${SCRIPT_URL}?action=updateGuest&row=${rowIndex}&invitedBy=${encodeURIComponent(invitedBy)}`;
      console.log('Calling API:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
      });
      
      console.log('API response received');

      // Wait before refreshing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh the list
      await fetchWeeklyPlayers();
      console.log('Player list refreshed');

    } catch (error) {
      console.error('Error updating guest status:', error);
      alert('Failed to update guest status. Please try again.');
    } finally {
      setUpdatingGuest(false);
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
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false }
  });

  if (loading) return <div className="loading">Loading players...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <WeatherWidget />
      <div className="weekly-list-container">
        <div className="header-section">
          <div className="title-count">
            <h2>This Week's Players ({players.length})</h2>
          </div>
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
                  <th>Hcp</th>
                  <th>Guest Of</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody {...swipeHandlers}>
                {groupPlayersByTeam(players).map((player, index) => (
                  <tr 
                    key={index}
                    data-row-index={player.rowIndex}
                    className={`player-row ${swipedRowId === player.rowIndex ? 'swiped' : ''} ${
                      player.invitedBy ? 'guest-row' : ''
                    }`}
                    {...swipeHandlers}
                  >
                    <td>{player.firstName}</td>
                    <td>{player.lastName}</td>
                    <td>{player.handicap}</td>
                    <td className="guest-cell">
                      <select
                        value={player.invitedBy || ''}
                        onChange={(e) => handleGuestChange(player.rowIndex, e.target.value)}
                        className="guest-select-full"
                        disabled={updatingGuest}
                      >
                        <option value="">Not a Guest</option>
                        {players
                          .filter(p => !p.invitedBy)
                          .map(member => (
                            <option key={member.rowIndex} value={member.firstName + ' ' + member.lastName}>
                              {member.firstName} {member.lastName}
                            </option>
                        ))}
                      </select>
                    </td>
                    <td className="team-cell">
                      <select
                        value={player.team || ''}
                        onChange={(e) => handleTeamChange(player.rowIndex, e.target.value)}
                        className="team-select-full"
                      >
                        <option value="">Select Team</option>
                        {teamNumbers.map(num => (
                          <option key={num} value={num}>
                            Team {num}
                          </option>
                        ))}
                      </select>
                    </td>
                    <div className="delete-action">
                      <button 
                        onClick={() => handleDelete(player.rowIndex)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyList;