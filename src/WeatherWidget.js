import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY; // Get this from OpenWeatherMap
  const MCKINNEY_LAT = '33.1972';
  const MCKINNEY_LONG = '-96.6397';

  useEffect(() => {
    const getFridayWeather = async () => {
      try {
        setLoading(true);
        // Get 5-day forecast
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${MCKINNEY_LAT}&lon=${MCKINNEY_LONG}&appid=${WEATHER_API_KEY}&units=imperial`
        );
        const data = await response.json();

        // Filter for Friday's forecast
        const fridayForecast = data.list.find(item => {
          const date = new Date(item.dt * 1000);
          return date.getDay() === 5 && date.getHours() === 15; // Friday at 3PM
        });

        if (fridayForecast) {
          setWeather({
            temp: Math.round(fridayForecast.main.temp),
            feels_like: Math.round(fridayForecast.main.feels_like),
            description: fridayForecast.weather[0].main,
            icon: fridayForecast.weather[0].icon,
            wind: Math.round(fridayForecast.wind.speed),
            precipitation: fridayForecast.pop * 100, // Probability of precipitation
            date: new Date(fridayForecast.dt * 1000).toLocaleDateString()
          });
        }
        setError(null);
      } catch (err) {
        setError('Failed to load weather');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    getFridayWeather();
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