import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MCKINNEY_LAT = '33.1972';
  const MCKINNEY_LONG = '-96.6397';
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const TARGET_HOUR = 13; // 1 PM in 24-hour format

  useEffect(() => {
    const getFridayWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${MCKINNEY_LAT}&lon=${MCKINNEY_LONG}&appid=${API_KEY}&units=imperial`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Get next Friday's date
        const today = new Date();
        const nextFriday = new Date();
        nextFriday.setDate(today.getDate() + ((7 - today.getDay() + 5) % 7 || 7));
        nextFriday.setHours(TARGET_HOUR, 0, 0, 0);

        console.log('Looking for forecast for:', nextFriday);

        // Find forecast closest to next Friday at 3 PM
        const fridayForecast = data.list.reduce((closest, current) => {
          const forecastDate = new Date(current.dt * 1000);
          const closestDate = closest ? new Date(closest.dt * 1000) : null;
          
          // Only consider forecasts on Friday
          if (forecastDate.getDay() !== 5) return closest;
          
          // If we don't have a closest yet, use this one
          if (!closest) return current;
          
          // Calculate time differences
          const currentDiff = Math.abs(forecastDate.getHours() - TARGET_HOUR);
          const closestDiff = Math.abs(closestDate.getHours() - TARGET_HOUR);
          
          return currentDiff < closestDiff ? current : closest;
        }, null);

        console.log('Found forecast:', fridayForecast);

        if (fridayForecast) {
          const forecastDate = new Date(fridayForecast.dt * 1000);
          setWeather({
            temp: Math.round(fridayForecast.main.temp),
            feels_like: Math.round(fridayForecast.main.feels_like),
            description: fridayForecast.weather[0].main,
            icon: fridayForecast.weather[0].icon,
            wind: Math.round(fridayForecast.wind.speed),
            precipitation: Math.round(fridayForecast.pop * 100),
            date: forecastDate.toLocaleDateString(),
            time: forecastDate.toLocaleTimeString([], { 
              hour: 'numeric', 
              minute: '2-digit'
            })
          });
        } else {
          throw new Error('No forecast found for Friday');
        }
        
        setError(null);
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
      <h3>Friday's Golf Weather</h3>
      <div className="weather-date">
        {weather.date} at {weather.time}
      </div>
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