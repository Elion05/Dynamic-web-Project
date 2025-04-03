"use strict";
//loader element

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
        
        const data = await response.json();
        console.log('API Response Data:', data);

        if (data && data.results) {
            locations = data.results;  // Verander naar results
            renderLocations();
        }   

    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        locatieContainer.innerHTML = "<p class='foutmelding1'>❌Fout bij het laden van locaties.❌</p>";
    }
}

// Locaties renderen op de pagina in een tabel
function renderLocations() {
    const zoekterm = zoekbar.value.toLowerCase();
    const sorteerMethode = sorteren.value;
    const geselecteerdeGemeente = category.value.toLowerCase();

    let gefilterdeLocaties = locations.filter(loc => 
        loc.naam_fresco_nl.toLowerCase().includes(zoekterm) 
        || loc.nom_de_la_fresque.toLowerCase().includes(zoekterm)
    );

    if (geselecteerdeGemeente !== "all") {
        gefilterdeLocaties = gefilterdeLocaties.filter(loc => 
            loc.commune_gemeente && loc.commune_gemeente.toLowerCase().includes(geselecteerdeGemeente)
        );
    }
   
   
    //Sorteren op naam en datum
    gefilterdeLocaties.sort((a, b) => {
        if (sorteerMethode === "name") return a.dessinateur.localeCompare(b.dessinateur);
        if (sorteerMethode === "name2") return b.dessinateur.localeCompare(a.dessinateur);
        if (sorteerMethode === "date") return new Date(a.date) - new Date(b.date);
        if (sorteerMethode === "date2") return new Date(b.date) - new Date(a.date);
    });

    locatieContainer.innerHTML = "";  // Clear container

    if (gefilterdeLocaties.length === 0) {
        locatieContainer.innerHTML = "<p class='geen-resultaten'>❌Geen locaties gevonden.❌</p>";
        return;
    }

    

    // Maak de tabel voor alle informatie
    const tabel = document.createElement('table');
    tabel.style.width = '100%';
    tabel.style.border = '2px solid #ddd';
    tabel.style.borderCollapse = 'collapse';


    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Muurschildering', 'Tekenaar', 'Datum', 'Adres','Uitgeverij', 'Afbeelding'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '4px solid #ddd';
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    tabel.appendChild(header);

    //de table aanvullen met de locaties
    const body = document.createElement('tbody');
    gefilterdeLocaties.forEach(loc => {
        const row = document.createElement('tr');

        //de titel const customizen
        const schilderijNaam = document.createElement('td');
        schilderijNaam.textContent = `${loc.nom_de_la_fresque}(${loc.naam_fresco_nl})`;
        schilderijNaam.style.padding = '10px';
        schilderijNaam.style.borderBottom = '10px solid #ddd';

        //aangemaakte element teovoegen
        row.appendChild(schilderijNaam);

    
        //tekenaar const 
        const tekenaar = document.createElement('td');
        tekenaar.textContent = `${loc.dessinateur}`;
        tekenaar.style.padding = '10px';
        tekenaar.style.borderBottom = '10px solid #ddd';
        //
        row.appendChild(tekenaar);


        //datum const
        const datum = document.createElement('td');
        datum.textContent = `${loc.date}`
        datum.style.padding = '10px';
        datum.style.borderBottom = '10px solid #ddd';
        //
        row.appendChild(datum);

        //Adres const
        const address = document.createElement('td');
        address.textContent = loc.adresse || loc.adres || 'Geen adres beschikbaar';
        address.style.padding = '10px';
        address.style.borderBottom = '10px solid #ddd';
        row.appendChild(address);
        
        //Uitgeverij
        const uitgeverij = document.createElement('td');
        uitgeverij.textContent = `${loc.maison_d_edition}` || 'geen uitgeverij beschikbaar';
        uitgeverij.style.padding = '10px';
        uitgeverij.style.borderBottom= '10px solid #ddd'
        row.appendChild(uitgeverij);

     

        // Afbeelding
        const imageCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = loc.image || 'https://via.placeholder.com/200';  // Default image als geen afbeelding beschikbaar
        img.alt = loc.nom_de_la_fresque || 'Locatie afbeelding';
        imageCell.appendChild(img);
        imageCell.style.padding = '10px';
        imageCell.style.borderBottom = '10px solid #ddd';
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



