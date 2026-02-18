import dayjs from "https://cdn.jsdelivr.net/npm/dayjs@1/+esm";
import { climate } from './climate-weather.js';

const apiKey = 'b241878b5befcd776cc7f94f2356679a';

window.addEventListener('load', () => {
    updateDate();
    const savedCity = localStorage.getItem('lastCity') || 'Kathmandu';
    fetchWeather(savedCity);
});

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        if (data.cod === "404") {
            alert("City not found! Please check your spelling.");
            return;
        }

        document.querySelector('.address').innerHTML = data.name;
        document.querySelector('.temp-value').innerHTML = `${Math.round(data.main.temp)} <span class="degree"> o</span>`;
        document.querySelector('.wind-speed').innerHTML = `${(data.wind.speed)} m/s`;
        
        const weatherDesc = data.weather[0].main; 
        const iconCode = data.weather[0].icon; // This tells us if it's day or night (e.g., '01n')
        
        document.querySelector('.climate-change-review').innerHTML = weatherDesc;

        // UPDATED: Now we pass the iconCode to the image function
        updateWeatherImage(weatherDesc, iconCode);

        localStorage.setItem('lastCity', data.name);

    } catch (error) {
        console.error("Failed to get weather data:", error);
    }
}

// UPDATED: Added iconCode parameter
function updateWeatherImage(apiWeather, iconCode) {
    const imgElement = document.querySelector('.climate-img');
    const condition = apiWeather.toLowerCase();
    
    // If iconCode contains 'n', it is night time
    const isNight = iconCode.includes('n');

    const match = climate.find((item) => {
        // Night Logic
        if (isNight) {
            if (condition.includes('clear')) return item.weathers === 'clear-night';
            if (condition.includes('cloud')) return item.weathers === 'clouds-night';
        }
        
        // Day Logic (or fallback if night images don't exist)
        if (condition.includes('rain')) return item.weathers === 'rainny';
        if (condition.includes('clear')) return item.weathers === 'sunny';
        if (condition.includes('cloud')) return item.weathers === 'sunny-cloudy';
        if (condition.includes('wind')) return item.weathers === 'windy-sunny';
        
        return false;
    });

    if (match) {
        imgElement.src = match.images;
    } else {
        // Default fallback image
        imgElement.src = './Pic/weather/sunny.jpg'; 
    }
}

function updateDate() {
    const date = dayjs();
    const formattedDate = date.format('YYYY MMM ddd DD');
    const timeDisplay = document.querySelector('.time');
    if (timeDisplay) timeDisplay.innerHTML = formattedDate;
}

function startSearch() {
    const inputElement = document.querySelector('.input-search');
    const city = inputElement.value.trim();
    
    if (city !== "") {
        fetchWeather(city);
        inputElement.value = ""; 
    } else {
        alert("Please enter a location!");
    }
}

document.querySelector('.image-search').addEventListener('click', startSearch);

document.querySelector('.input-search')
.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        startSearch();
    }
});