import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WeeklyList.css';
import WeatherWidget from './components/WeatherWidget';

const CORS_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

function WeeklyList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingGuest, setUpdatingGuest] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const longPressTimer = useRef(null);
  const longPressTimeout = 800; // Increased to 800ms for easier testing
  const navigate = useNavigate();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollStartPosition = useRef(null);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6WIq-j8mnCzGFnU6hGY0nCCMY1lxKHD98DB4lltOrx9jLMoau2BVdX4F-ZLhQn50I/exec';

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
      console.log('Fetching players...');
      
      // Single request with JSONP approach
      const script = document.createElement('script');
      const callbackName = 'jsonpCallback_' + Date.now();
      
      // Create a promise to handle the JSONP response
      const jsonpPromise = new Promise((resolve, reject) => {
        window[callbackName] = (data) => {
          delete window[callbackName];
          document.body.removeChild(script);
          resolve(data);
        };
        
        script.onerror = () => {
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error('Failed to load players'));
        };
      });

      // Add script to page
      script.src = `${SCRIPT_URL}?action=getWeeklyPlayers&callback=${callbackName}`;
      document.body.appendChild(script);
      
      // Wait for response with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });

      // Race between response and timeout
      const data = await Promise.race([jsonpPromise, timeoutPromise]);
      
      if (data && data.players) {
        console.log('Fetched players:', data.players);
        setPlayers(data.players);
        setError(null);
      } else {
        throw new Error('No players data received');
      }
    } catch (err) {
      setError('Failed to load players');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (rowIndex, teamNumber) => {
    try {
      console.log('Attempting to update team:', { rowIndex, teamNumber });
  
      // First request with no-cors
      await fetch(`${SCRIPT_URL}?action=updateTeam&row=${rowIndex}&team=${teamNumber}`, {
        method: 'GET',
        mode: 'no-cors'
      });

      // Update local state immediately
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.rowIndex === rowIndex 
            ? { ...player, team: teamNumber }
            : player
        )
      );
  
      // Wait and refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchWeeklyPlayers();
  
    } catch (error) {
      console.error('Error updating team number:', error);
      alert('Failed to update team. Please try again.');
    }
  };

  const handleGuestChange = async (rowIndex, invitedBy) => {
    try {
      if (updatingGuest) return;
      setUpdatingGuest(true);

      console.log('------- GUEST UPDATE PROCESS START -------');
      console.log('1. Update Request:', { rowIndex, invitedBy });
      
      const fullUrl = `${SCRIPT_URL}?action=updateGuest&row=${rowIndex}&invitedBy=${encodeURIComponent(invitedBy)}`;
      console.log('2. Request URL:', fullUrl);
  
      // First request with no-cors
      await fetch(fullUrl, {
        method: 'GET',
        mode: 'no-cors'
      });
  
      // Update local state
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.rowIndex === rowIndex 
            ? { ...player, invitedBy: invitedBy }
            : player
        )
      );

      // Wait and refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchWeeklyPlayers();
  
    } catch (error) {
      console.error('CRITICAL ERROR:', error);
      alert('Failed to update guest status. Please try again.');
    } finally {
      setUpdatingGuest(false);
      console.log('------- GUEST UPDATE PROCESS END -------');
    }
};

  const handleBackToSignup = () => {
    navigate('/');
  };

  // Prevent context menu on long press
  const preventContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleTouchStart = (player, e) => {
    // Store initial touch position
    scrollStartPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    longPressTimer.current = setTimeout(() => {
      // Only show delete popup if we haven't scrolled
      if (!isScrolling) {
        setSelectedPlayer(player);
        setShowDeletePopup(true);
      }
    }, longPressTimeout);
  };

  const handleTouchMove = (e) => {
    if (!scrollStartPosition.current) return;

    const deltaX = Math.abs(e.touches[0].clientX - scrollStartPosition.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - scrollStartPosition.current.y);

    // If user has moved finger more than 10px, consider it a scroll
    if (deltaX > 10 || deltaY > 10) {
      setIsScrolling(true);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsScrolling(false);
    scrollStartPosition.current = null;
  };

  const handleDelete = async (rowIndex) => {
    try {
      console.log('Attempting to delete row:', rowIndex);
      
      // Make the delete request
      await fetch(`${SCRIPT_URL}?action=deletePlayer&row=${rowIndex}`, {
        method: 'GET',
        mode: 'no-cors'
      });

      // Clear popup state
      setShowDeletePopup(false);
      setSelectedPlayer(null);

      // Refresh the player list
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchWeeklyPlayers();

    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player. Please try again.');
    }
  };

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
                  <th>Invited By</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {groupPlayersByTeam(players).map((player, index) => (
                  <tr 
                    key={index}
                    data-row-index={player.rowIndex}
                    className={`player-row ${player.invitedBy ? 'guest-row' : ''}`}
                    onTouchStart={(e) => handleTouchStart(player, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onContextMenu={preventContextMenu}
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <>
          <div className="popup-overlay" onClick={() => setShowDeletePopup(false)} />
          <div className="delete-popup">
            <h3 className="popup-title">Delete Player</h3>
            <p>Are you sure you want to delete {selectedPlayer?.firstName} {selectedPlayer?.lastName}?</p>
            <div className="popup-buttons">
              <button className="popup-button cancel-delete" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </button>
              <button 
                className="popup-button confirm-delete" 
                onClick={() => handleDelete(selectedPlayer.rowIndex)}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WeeklyList;