const apiKey = "68b84c99bf45c11a8319ac7f835a7c65";
const weatherResult = document.getElementById("weatherResult");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        alert("Unable to get location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function getWeatherByCity(city) {
  const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  Promise.all([
    fetch(currentURL).then(res => res.json()),
    fetch(forecastURL).then(res => res.json())
  ])
  .then(([currentData, forecastData]) => {
    if (currentData.cod !== 200) {
      alert(currentData.message);
      return;
    }
    displayWeather(currentData, forecastData);
  })
  .catch(err => {
    console.error(err);
    alert("Error fetching data.");
  });
}

function getWeatherByCoords(lat, lon) {
  const currentURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  Promise.all([
    fetch(currentURL).then(res => res.json()),
    fetch(forecastURL).then(res => res.json())
  ])
  .then(([currentData, forecastData]) => {
    displayWeather(currentData, forecastData);
  })
  .catch(err => {
    console.error(err);
    alert("Error fetching data.");
  });
}

function displayWeather(current, forecast) {
  weatherResult.innerHTML = "";

  // Current Weather
  const currentCard = document.createElement("div");
  currentCard.className = "weather-card";
  currentCard.innerHTML = `
    <h3>Current Weather (${current.name})</h3>
    <p><strong>${current.weather[0].description}</strong></p>
    <p>Temperature: ${current.main.temp} °C</p>
    <p>Humidity: ${current.main.humidity}%</p>
    <p>Wind: ${current.wind.speed} m/s</p>
  `;
  weatherResult.appendChild(currentCard);

  // 5-day Forecast
  const forecastMap = {};
  forecast.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!forecastMap[date]) {
      forecastMap[date] = [];
    }
    forecastMap[date].push(item);
  });

  const dates = Object.keys(forecastMap).slice(1, 6);

  dates.forEach(date => {
    const dayData = forecastMap[date];
    const temps = dayData.map(d => d.main.temp);
    const descriptions = dayData.map(d => d.weather[0].description);
    const icon = dayData[0].weather[0].icon;

    const minTemp = Math.min(...temps).toFixed(1);
    const maxTemp = Math.max(...temps).toFixed(1);
    const description = descriptions[0];

    const card = document.createElement("div");
    card.className = "weather-card";
    card.innerHTML = `
      <h3>${date}</h3>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}"/>
      <p><strong>${description}</strong></p>
      <p>Min: ${minTemp} °C | Max: ${maxTemp} °C</p>
    `;
    weatherResult.appendChild(card);
  });
}
