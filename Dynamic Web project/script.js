




"use strict";

// Achtergrond thema switchen
const backgroundToggle = document.getElementById('themeToggle');
const body = document.body;

function background() {
    if (body.classList.contains('light-theme')) {
        body.classList.replace('light-theme', 'dark-theme');
        backgroundToggle.textContent = 'Press here for light mode!';
        localStorage.setItem('theme', 'dark-theme');
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        backgroundToggle.textContent = 'Press here for dark mode!';
        localStorage.setItem('theme', 'light-theme');
    }
}
backgroundToggle.addEventListener('click', background);
function achtergrondLaden() {
    const savedBackground = localStorage.getItem('theme');
    if (savedBackground) {
        body.className = savedBackground;
        backgroundToggle.textContent = savedBackground === 'dark-theme' ? 'Press here for light mode!' : 'Press here for dark mode!';
    }
}
achtergrondLaden();

