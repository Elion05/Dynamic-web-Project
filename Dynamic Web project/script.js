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


document.addEventListener("DOMContentLoaded", function(){
//HTML-elementen ophalen
const postContainer = document.getElementById("locaties-container");//container waar de posts komt
const zoektermInput = document.getElementById("zoekbar");//Inputveld voor zoektermen
const sorteerSelect = document.getElementById("sorteren");
const toepassingKnop = document.getElementById('zoekKnop');//Knop om filter toe te passen
let locatiesPosts = []; //Variable om de opgehaalde posts in op te slaan

async function fetchLocations() {
    try {
        const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=70");
 
        if (!response.ok) {
            throw new Error(`Fout bij ophalen van data: ${response.status} ${response.statusText}`);
        }
 
        const data = await response.json();
        console.log('API Response Data:', data);
 
        // Gebruik de juiste array: results, niet records
        if (data && data.results) {
            locatiesPosts = data.results;  // Verander naar results
            renderLocations();

        } else {
            throw new Error("Geen records gevonden in de API-response.");
        }
 
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        postContainer.innerHTML = "<p>Zoek jouw locatie </p>";
    }
}
//Functie om de locaties te filteren en te sorteren
function renderLocaties () {
    //De zoekterm ophalen en omzetten naar kleine letters voor case-insensitive zoeken
    const zoekterm = zoektermInput.value.toLowerCase();
    const sorteerWaarde = sorteerSelect.value;   //De gekozen sorteervolgorde ophalen

    //filteren
    let gefilterdeLocaties = locatiesPosts.filter(post =>
    post.nom_de_la_fresque.toLowerCase().includes(zoekterm));


    if(sorteerWaarde === "Gemeente"){
        gefilterdeLocaties.sort((a, b) => a.commune_gemeente.localeCompare(b.commune_gemeente));
    }else if(sorteerWaarde === "name"){
        gefilterdeLocaties.sort((a,b) => a.nom_de_la_fresque.localeCompare(b.nom_de_la_fresque));
    }
    postContainer.innerHTML = "";
    if(gefilterdeLocaties.length === 0){
        postContainer.innerHTML = "<p class='foutmelding1'><strong>Geen locaties gevonden.</strong></p>";
        return;
    }
    gefilterdeLocaties.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `<div class="locaties-titel">${post.nom_de_la_fresque.toUpperCase()}</div>
        <p><strong>Gemeente:</strong>
        ${post.commune_gemeente || "Onbekend"}</p>
        
        `;
        postContainer.appendChild(postElement);
    });
}
toepassingKnop.addEventListener("click", renderLocaties);
fetchLocations();
});

