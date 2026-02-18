import dayjs from "https://cdn.jsdelivr.net/npm/dayjs@1/+esm";
import { climate } from './climate-weather.js';

const apiKey = 'b241878b5befcd776cc7f94f2356679a';

/* ============================
   OFFLINE POPUP SYSTEM
============================ */

const offlineBox = document.querySelector(".offline-popup");

function showOfflinePopup() {
  offlineBox.style.display = "block";
}

function hideOfflinePopup() {
  offlineBox.style.display = "none";
}

if (!navigator.onLine) showOfflinePopup();

window.addEventListener("offline", showOfflinePopup);
window.addEventListener("online", hideOfflinePopup);

/* ============================
   PAGE LOAD
============================ */

window.addEventListener('load', () => {
  updateDate();

  const savedWeather = localStorage.getItem("lastWeather");

  if (savedWeather) {
    displayWeather(JSON.parse(savedWeather));
  } else {
    fetchWeather("Kathmandu");
  }
});

/* ============================
   FETCH WEATHER
============================ */

async function fetchWeather(city) {

  if (!navigator.onLine) {

    const savedWeather = localStorage.getItem("lastWeather");

    if (savedWeather) {
      displayWeather(JSON.parse(savedWeather));
      return;
    } else {
      showOfflinePopup();
      return;
    }
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      alert("City not found!");
      return;
    }

    localStorage.setItem("lastWeather", JSON.stringify(data));
    displayWeather(data);

  } catch (error) {
    console.log(error);
    alert("Unable to fetch weather!");
  }
}

/* ============================
   DISPLAY WEATHER
============================ */

function displayWeather(data) {

  const weatherDesc = data.weather[0].main;
  const iconCode = data.weather[0].icon;

  document.querySelector('.address').innerHTML = data.name;

  document.querySelector('.temp-value').innerHTML =
    `${Math.round(data.main.temp)} <span class="degree">o</span>`;

  document.querySelector('.wind-speed').innerHTML =
    `${data.wind.speed} m/s`;

  document.querySelector('.climate-condition').innerHTML =
    data.weather[0].description;

  document.querySelector('.humidity-temp').innerHTML =
    `${data.main.humidity}%`;

  updateWeatherImage(weatherDesc, iconCode);
}

/* ============================
   WEATHER IMAGE
============================ */

function updateWeatherImage(apiWeather, iconCode) {

  const imgElement = document.querySelector('.climate-img');
  const condition = apiWeather.toLowerCase();
  const isNight = iconCode.includes('n');

  const match = climate.find(item => {

    const key = item.weathers.toLowerCase();

    // 🌙 NIGHT IMAGES
    if (isNight) {
      if (condition.includes('clear') && key.includes('clear')) return true;
      if (condition.includes('cloud') && key.includes('cloud')) return true;
    }

    // ☀️ DAY IMAGES
    if (condition.includes('rain') && key.includes('rain')) return true;
    if (condition.includes('clear') && key.includes('clear')) return true;
    if (condition.includes('cloud') && key.includes('cloud')) return true;
    if (condition.includes('wind') && key.includes('wind')) return true;
    if (condition.includes('smoke') && key.includes('smoke')) return true;

    return false;
  });

  imgElement.src = match ? match.images : './Pic/weather/sunny.png';
}

/* ============================
   DATE
============================ */

function updateDate() {
  document.querySelector('.time').innerHTML =
    dayjs().format('YYYY MMM ddd DD');
}

/* ============================
   SEARCH
============================ */

function startSearch() {

  const input = document.querySelector('.input-search');
  const city = input.value.trim();

  if (city !== "") {
    fetchWeather(city);
    input.value = "";
  } else {
    alert("Enter a city name!");
  }
}

document.querySelector('.image-search')
  .addEventListener('click', startSearch);

document.querySelector('.input-search')
  .addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startSearch();
  });
