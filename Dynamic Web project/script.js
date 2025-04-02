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


document.addEventListener("DOMContentLoaded", function () {
    // HTML-elementen ophalen
    const postContainer = document.getElementById("Locaties");
    const zoektermInput = document.getElementById("zoekbar");
    const sorteerSelect = document.getElementById("sorteren");
    const toepassingKnop = document.getElementById('zoekKnop');
    
    let locatiesPosts = [];

    async function fetchLocations() {
        try {
            const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=20");

            if (!response.ok) {
                throw new Error(`Fout bij ophalen van data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API Response Data:', data);

            if (data && data.records) {
                locatiesPosts = data.records;  // Correcte toewijzing
                renderLocaties(); // Data direct weergeven
            } else {
                throw new Error("Geen records gevonden in de API-response.");
            }
        } catch (error) {
            console.error('Er is een fout opgetreden:', error);
            postContainer.innerHTML = "<p class='foutmelding1'>Fout bij het laden van locaties.</p>";
        }
    }

    function renderLocaties() {
        const zoekterm = zoektermInput.value.toLowerCase();
        const sorteerWaarde = sorteerSelect.value;

        let gefilterdeLocaties = locatiesPosts.filter(post =>
            post.fields.nom_de_la_fresque.toLowerCase().includes(zoekterm)
        );

        // Sorteren op basis van de geselecteerde optie
        if (sorteerWaarde === "Gemeente") {
            gefilterdeLocaties.sort((a, b) => a.fields.commune_gemeente.localeCompare(b.fields.commune_gemeente));
        } else if (sorteerWaarde === "name") {
            gefilterdeLocaties.sort((a, b) => a.fields.nom_de_la_fresque.localeCompare(b.fields.nom_de_la_fresque));
        } else if (sorteerWaarde === "date") {
            gefilterdeLocaties.sort((a, b) => new Date(a.fields.date) - new Date(b.fields.date));
        }

        postContainer.innerHTML = "";
        if (gefilterdeLocaties.length === 0) {
            postContainer.innerHTML = "<p class='geen-resultaten'>Geen locaties gevonden.</p>";
            return;
        }

        gefilterdeLocaties.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <div class="locaties-titel">${post.fields.nom_de_la_fresque.toUpperCase()}</div>
                <p><strong>Gemeente:</strong> ${post.fields.commune_gemeente || "Onbekend"}</p>
                <p><strong>Tekenaar:</strong> ${post.fields.dessinateur || "Onbekend"}</p>
                <p><strong>Datum:</strong> ${post.fields.date || "Onbekend"}</p>
                <p><strong>Adres:</strong> ${post.fields.adresse || "Onbekend"}</p>
                <p><strong>Oppervlakte:</strong> ${post.fields.surface_m2 || "Onbekend"} m²</p>
                <a href="${post.fields.lien_site_parcours_bd}" target="_blank">Meer info</a>
                <img src="${post.fields.image}" alt="Fresco image" class="fotos"/>
            `;
            postContainer.appendChild(postElement);
        });
    }

    toepassingKnop.addEventListener("click", renderLocaties);
    fetchLocations();
});