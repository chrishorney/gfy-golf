import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const MCKINNEY_LAT = '33.1972';
  const MCKINNEY_LONG = '-96.6397';

  useEffect(() => {
    const getFridayWeather = async () => {
      try {
        setLoading(true);
        
        // Get current date and determine target Friday
        const now = new Date();
        let targetFriday = new Date();
        
        // If it's past Friday or Friday after 12 PM, get next Friday
        if (now.getDay() > 5 || (now.getDay() === 5 && now.getHours() >= 12)) {
          targetFriday.setDate(now.getDate() + ((7 - now.getDay() + 5) % 7));
        } else if (now.getDay() < 5) {
          // Get this coming Friday
          targetFriday.setDate(now.getDate() + (5 - now.getDay()));
        }
        
        // Set time to 12:00 PM
        targetFriday.setHours(12, 0, 0, 0);
        
        // Get 5-day forecast
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${MCKINNEY_LAT}&lon=${MCKINNEY_LONG}&appid=${WEATHER_API_KEY}&units=imperial`
        );
        const data = await response.json();

        // Find forecast closest to target Friday at 12 PM
        const targetTimestamp = Math.floor(targetFriday.getTime() / 1000);
        const fridayForecast = data.list.reduce((closest, current) => {
          const currentDiff = Math.abs(current.dt - targetTimestamp);
          const closestDiff = Math.abs(closest.dt - targetTimestamp);
          return currentDiff < closestDiff ? current : closest;
        });

        if (fridayForecast) {
          setWeather({
            temp: Math.round(fridayForecast.main.temp),
            feels_like: Math.round(fridayForecast.main.feels_like),
            description: fridayForecast.weather[0].main,
            icon: fridayForecast.weather[0].icon,
            wind: Math.round(fridayForecast.wind.speed),
            precipitation: fridayForecast.pop * 100, // Probability of precipitation
            date: new Date(fridayForecast.dt * 1000).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            }),
            time: new Date(fridayForecast.dt * 1000).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })
          });
        }
        setError(null);

        // Schedule next update at midnight
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const timeUntilMidnight = tomorrow - now;

        setTimeout(() => {
          getFridayWeather();
        }, timeUntilMidnight);

      } catch (err) {
        setError('Failed to load weather');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    getFridayWeather();

    // Cleanup timeout on component unmount
    return () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const timeUntilMidnight = tomorrow - now;
      clearTimeout(timeUntilMidnight);
    };
  }, []);

  if (loading) return <div className="weather-widget loading">Loading weather...</div>;
  if (error) return <div className="weather-widget error">{error}</div>;
  if (!weather) return null;

  return (
    <div className="weather-widget">
      <h3>Friday's Golf Weather</h3>
      <div className="weather-content">
        <img 
          src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
        />
        <div className="weather-details">
          <div className="temperature">{weather.temp}°F</div>
          <div className="description">{weather.description}</div>
          <div className="extra-details">
            {weather.date} at {weather.time}
            <br />
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