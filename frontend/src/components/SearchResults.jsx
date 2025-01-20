const SearchResults = ({
  filteredStates,
  selectedState,
  weather,
  loadingWeather,
  weatherError,
  onShow
}) => {

  // Se c'è uno stato selezionato, mostri direttamente i suoi dettagli
  if (selectedState) {
    const state = selectedState;
    return (
      <div>
        <h1>{state.name.common}</h1>
        capital: {state.capital}<br />
        area: {state.area}
        <h2>languages:</h2>
        <ul>
          {Object.values(state.languages || {}).map((language, index) => (
            <li key={index}>{language}</li>
          ))}
        </ul>
        <img
          src={state.flags.png}
          alt={`Flag of ${state.name.common}`}
          width="200"
        />
        <h1>Weather in {state.capital}</h1>
        {loadingWeather ? (
          <p>Loading weather data...</p>
        ) : weatherError ? (
          <p>{weatherError}</p>
        ) : weather ? (
          <div>
            <p>Temperature: {weather.current.temperature}°C</p>
            <img
              src={weather.current.weather_icons[0]}
              alt="Weather icon"
            />
            <p>Wind: {weather.current.wind_speed} km/h</p>
          </div>
        ) : (
          <p>No weather data available.</p>
        )}
      </div>
    );
  }

  // Altrimenti, segui la logica del filtro
  if (filteredStates.length > 10) {
    return <p>Too many matches, specify another filter</p>;
  } else if (filteredStates.length === 1) {
    const state = filteredStates[0];
    return (
      <div>
        <h1>{state.name.common}</h1>
        capital: {state.capital}<br />
        area: {state.area}
        <h2>languages:</h2>
        <ul>
          {Object.values(state.languages || {}).map((language, index) => (
            <li key={index}>{language}</li>
          ))}
        </ul>
        <img
          src={state.flags.png}
          alt={`Flag of ${state.name.common}`}
          width="200"
        />
        <h1>Weather in {state.capital}</h1>
        {loadingWeather ? (
          <p>Loading weather data...</p>
        ) : weatherError ? (
          <p>{weatherError}</p>
        ) : weather ? (
          <div>
            <p>Temperature: {weather.current.temperature}°C</p>
            <img
              src={weather.current.weather_icons[0]}
              alt="Weather icon"
            />
            <p>Wind: {weather.current.wind_speed} km/h</p>
          </div>
        ) : (
          <p>No weather data available.</p>
        )}
      </div>
    );
  } else {
    return (
      <ul>
        {filteredStates.map((state) => (
          <li key={state.cca3}>
            {state.name.common}
            <button onClick={() => onShow(state)}>show</button>
          </li>
        ))}
      </ul>
    );
  }
};

export default SearchResults;






