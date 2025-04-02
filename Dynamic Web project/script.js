




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


// HTML-elementen ophalen
const locatieContainer = document.getElementById("Locaties");
const zoekbar = document.getElementById("zoekbar");
const zoekKnop = document.getElementById("zoekKnop");
const category = document.getElementById("category");
const sorteren = document.getElementById("sorteren");
let locations = [];

// API-data ophalen
async function fetchLocations() {
    try {
        const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=10");
        const data = await response.json();
        locations = data.results;
        renderLocations();
    } catch (error) {
        locatieContainer.innerHTML = "<p class='foutmelding1'>Fout bij het laden van locaties.</p>";
    }
}

// Locaties renderen op de pagina
function renderLocations() {
    const zoekterm = zoekbar.value.toLowerCase();
    const selectedCategory = category.value;
    const sorteerMethode = sorteren.value;

    let gefilterdeLocaties = locations.filter(loc => 
        loc.titre_fr.toLowerCase().includes(zoekterm) || loc.titre_nl.toLowerCase().includes(zoekterm)
    );

    if (selectedCategory !== "all") {
        gefilterdeLocaties = gefilterdeLocaties.filter(loc => loc.categorie === selectedCategory);
    }

    gefilterdeLocaties.sort((a, b) => {
        if (sorteerMethode === "name") return a.titre_fr.localeCompare(b.titre_fr);
        if (sorteerMethode === "date") return new Date(b.date) - new Date(a.date);
    });

    locatieContainer.innerHTML = "";

    if (gefilterdeLocaties.length === 0) {
        locatieContainer.innerHTML = "<p class='geen-resultaten'>Geen locaties gevonden.</p>";
        return;
    }

    gefilterdeLocaties.forEach(loc => {
        const locElement = document.createElement("div");
        locElement.classList.add("location");
        locElement.innerHTML = `
            <h3>${loc.titre_fr} (${loc.titre_nl})</h3>
            <p>${loc.description_fr || loc.description_nl || "Geen beschrijving beschikbaar."}</p>
            <p><strong>Categorie:</strong> ${loc.categorie || "Onbekend"}</p>
            <p><strong>Adres:</strong> ${loc.adresse_fr || loc.adresse_nl || "Geen adres beschikbaar"}</p>
        `;
        locationsList.appendChild(locElement);
    });
}

// Event listeners
zoekKnop.addEventListener("click", renderLocations);
category.addEventListener("change", renderLocations);
sorteren.addEventListener("change", renderLocations);

// Data ophalen bij het laden van de pagina
fetchLocations();
