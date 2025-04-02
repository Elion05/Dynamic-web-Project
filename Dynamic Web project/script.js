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
        const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=20");

        if (!response.ok) {
            throw new Error(`Fout bij ophalen van data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response Data:', data);

        // Gebruik de juiste array: results, niet records
        if (data && data.results) {
            locations = data.results;  // Verander naar results
            renderLocations();
        } else {
            throw new Error("Geen records gevonden in de API-response.");
        }

    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        locatieContainer.innerHTML = "<p class='foutmelding1'>Fout bij het laden van locaties.</p>";
    }
}

// Locaties renderen op de pagina in een tabel
function renderLocations() {
    const zoekterm = zoekbar.value.toLowerCase();
    const selectedCategory = category.value;
    const sorteerMethode = sorteren.value;

    let gefilterdeLocaties = locations.filter(loc => 
        loc.naam_fresco_nl.toLowerCase().includes(zoekterm) || loc.nom_de_la_fresque.toLowerCase().includes(zoekterm)
    );

    // Filteren op categorie (indien nodig)
    if (selectedCategory !== "all") {
        gefilterdeLocaties = gefilterdeLocaties.filter(loc => loc.categorie === selectedCategory);
    }

    // Sorteren
    gefilterdeLocaties.sort((a, b) => {
        if (sorteerMethode === "name") return a.naam_fresco_nl.localeCompare(b.naam_fresco_nl);
        if (sorteerMethode === "date") return new Date(b.date) - new Date(a.date);
    });

    locatieContainer.innerHTML = "";  // Clear container

    if (gefilterdeLocaties.length === 0) {
        locatieContainer.innerHTML = "<p class='geen-resultaten'>Geen locaties gevonden.</p>";
        return;
    }

    // Maak de tabel
    const tabel = document.createElement('table');
    tabel.style.width = '100%';
    tabel.style.border = '1px solid #ddd';
    tabel.style.borderCollapse = 'collapse';

    // Tabel kop
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Titel', 'Categorie', 'Adres', 'Afbeelding'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '2px solid #ddd';
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    tabel.appendChild(header);

    // Tabel body vullen met locaties
    const body = document.createElement('tbody');
    gefilterdeLocaties.forEach(loc => {
        const row = document.createElement('tr');

        // Titel
        const titleCell = document.createElement('td');
        titleCell.textContent = `${loc.nom_de_la_fresque} (${loc.naam_fresco_nl})`;
        titleCell.style.padding = '10px';
        titleCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(titleCell);

        // Categorie
        const categoryCell = document.createElement('td');
        categoryCell.textContent = loc.categorie || 'Onbekend';
        categoryCell.style.padding = '10px';
        categoryCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(categoryCell);

        // Adres
        const addressCell = document.createElement('td');
        addressCell.textContent = loc.adresse || loc.adres || 'Geen adres beschikbaar';
        addressCell.style.padding = '10px';
        addressCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(addressCell);

        // Afbeelding
        const imageCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = loc.image || 'https://via.placeholder.com/200';  // Default image als geen afbeelding beschikbaar
        img.alt = loc.nom_de_la_fresque || 'Locatie afbeelding';
        imageCell.appendChild(img);
        imageCell.style.padding = '10px';
        imageCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(imageCell);

        body.appendChild(row);
    });
    tabel.appendChild(body);
    locatieContainer.appendChild(tabel);
}

// Event listeners
zoekKnop.addEventListener("click", renderLocations);
category.addEventListener("change", renderLocations);
sorteren.addEventListener("change", renderLocations);

// Data ophalen bij het laden van de pagina
fetchLocations();