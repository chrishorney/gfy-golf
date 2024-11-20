import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MCKINNEY_LAT = '33.1972';
  const MCKINNEY_LONG = '-96.6397';
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  useEffect(() => {
    const getFridayWeather = async () => {
      try {
        setLoading(true);
        
        // Log the API URL for debugging (remove in production)
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${MCKINNEY_LAT}&lon=${MCKINNEY_LONG}&appid=${API_KEY}&units=imperial`;
        console.log('Fetching weather from:', apiUrl);

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Weather API response:', data); // For debugging

        // Get today's date
        const today = new Date();
        
        // Find next Friday
        const nextFriday = new Date();
        nextFriday.setDate(today.getDate() + ((7 - today.getDay() + 5) % 7 || 7));
        nextFriday.setHours(15, 0, 0, 0); // Set to 3 PM

        console.log('Looking for forecast for:', nextFriday);

        // Find forecast closest to next Friday 3 PM
        const fridayForecast = data.list.reduce((closest, current) => {
          const forecastDate = new Date(current.dt * 1000);
          const closestDate = closest ? new Date(closest.dt * 1000) : null;
          
          if (!closest) return current;
          
          const currentDiff = Math.abs(forecastDate - nextFriday);
          const closestDiff = Math.abs(closestDate - nextFriday);
          
          return currentDiff < closestDiff ? current : closest;
        }, null);

        console.log('Found forecast:', fridayForecast);

        if (fridayForecast) {
          setWeather({
            temp: Math.round(fridayForecast.main.temp),
            feels_like: Math.round(fridayForecast.main.feels_like),
            description: fridayForecast.weather[0].main,
            icon: fridayForecast.weather[0].icon,
            wind: Math.round(fridayForecast.wind.speed),
            precipitation: Math.round(fridayForecast.pop * 100),
            date: new Date(fridayForecast.dt * 1000).toLocaleDateString()
          });
          setError(null);
        } else {
          throw new Error('No forecast found for Friday');
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(`Failed to load weather: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (API_KEY) {
      getFridayWeather();
    } else {
      setError('Weather API key not found');
      setLoading(false);
    }
  }, [API_KEY]);

  if (loading) return <div className="weather-widget loading">Loading weather...</div>;
  if (error) return (
    <div className="weather-widget error">
      <p>{error}</p>
      <p className="error-details">Please try refreshing the page</p>
    </div>
  );
  if (!weather) return null;

  return (
    <div className="weather-widget">
      <h3>Friday's Golf Weather ({weather.date})</h3>
      <div className="weather-content">
        <img 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
        />
        <div className="weather-details">
          <div className="temperature">{weather.temp}°F</div>
          <div className="description">{weather.description}</div>
          <div className="extra-details">
            Feels like: {weather.feels_like}°F
            <br />
            Wind: {weather.wind} mph
            <br />
            Rain chance: {weather.precipitation}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;