"use strict";

// HTML-elementen ophalen
const locatieContainer = document.getElementById("Locaties");
const zoekbar = document.getElementById("zoekbar");
const zoekKnop = document.getElementById("zoekKnop");
const category = document.getElementById("category");
const sorteren = document.getElementById("sorteren");
const favorietenContainer = document.getElementById("favorites");
let locations = [];
let favorieten = JSON.parse(localStorage.getItem("favorieten")) || [];

// API-data ophalen
async function fetchLocations() {
    try {
        const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=70");
        const data = await response.json();

        if (data?.results) {
            locations = data.results;
            renderLocations();
            renderFavorieten();
        }
    } catch (error) {
        console.error("Er is een fout opgetreden:", error);
        locatieContainer.innerHTML = "<p class='foutmelding1'>❌Fout bij het laden van locaties.❌</p>";
    }
}

// Locaties renderen
const renderLocations = () => {
    const zoekterm = zoekbar.value.toLowerCase();
    const sorteerMethode = sorteren.value;
    const geselecteerdeGemeente = category.value.toLowerCase();

    let gefilterdeLocaties = locations.filter((loc) =>
        (loc.nom_de_la_fresque?.toLowerCase().includes(zoekterm) ||
            loc.dessinateur?.toLowerCase().includes(zoekterm) ||
            loc.adres?.toLowerCase().includes(zoekterm))
    );

    if (geselecteerdeGemeente !== "all") {
        gefilterdeLocaties = gefilterdeLocaties.filter(
            (loc) => loc.commune_gemeente?.toLowerCase().includes(geselecteerdeGemeente)
        );
    }

    locatieContainer.innerHTML = ""; // Clear container

    if (gefilterdeLocaties.length === 0) {
        locatieContainer.innerHTML = "<p class='geen-resultaten'>Geen zoekresultaat gevonden.</p>";
        return;
    }

    const tabel = createTable(gefilterdeLocaties, true);
    locatieContainer.appendChild(tabel);
};

// **Tabel genereren**
const createTable = (locaties, isMainTable = false) => {
    const tabel = document.createElement("table");
    tabel.innerHTML = `
        <thead>
            <tr>
                <th>Muurschildering</th>
                <th>Tekenaar</th>
                <th>Jaar</th>
                <th>Adres</th>
                <th>Uitgeverij</th>
                <th>Afbeelding</th>
                <th>Favoriet</th>
            </tr>
        </thead>
    `;
    
    const body = document.createElement("tbody");

    locaties.forEach((loc) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${loc.nom_de_la_fresque || "Onbekend"}</td>
            <td>${loc.dessinateur || "Onbekend"}</td>
            <td>${loc.date || "Onbekend"}</td>
            <td>${loc.adresse || loc.adres || "Geen adres beschikbaar"}</td>
            <td>${loc.maison_d_edition || "Onbekend"}</td>
            <td>
                <img src="${loc.image || "geen afbeelding beschikbaar"}" alt="Afbeelding van ${loc.nom_de_la_fresque}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
            </td>
        `;

        // **Favorieten-knop**
        const favorietCell = document.createElement("td");
        const favorietenKnop = document.createElement("button");
        favorietenKnop.textContent = favorieten.some((fav) => fav.nom_de_la_fresque === loc.nom_de_la_fresque) ? "⭐" : "☆";
        favorietenKnop.addEventListener("click", () => toggleFavoriet(loc, favorietenKnop, isMainTable));
        favorietCell.appendChild(favorietenKnop);
        row.appendChild(favorietCell);

        body.appendChild(row);
    });

    tabel.appendChild(body);
    return tabel;
};

// Favoriet toevoegen/verwijderen
const toggleFavoriet = (locatie, knop, isMainTable) => {
    const index = favorieten.findIndex((fav) => fav.nom_de_la_fresque === locatie.nom_de_la_fresque);
    if (index === -1) {
        favorieten.push(locatie);
        knop.textContent = "⭐";
    } else {
        favorieten.splice(index, 1);
        knop.textContent = "☆";
    }
    localStorage.setItem("favorieten", JSON.stringify(favorieten));
    renderFavorieten();
    
    if (!isMainTable) renderLocations(); // Update de hoofdlocatielijst
};

// **Favorieten weergeven**
const renderFavorieten = () => {
    favorietenContainer.innerHTML = "";

    if (favorieten.length === 0) {
        favorietenContainer.innerHTML = "<p>Geen favorieten geselecteerd.</p>";
        return;
    }

    const tabel = createTable(favorieten);
    favorietenContainer.appendChild(tabel);
};

// **Event listeners**
zoekKnop.addEventListener("click", renderLocations);
category.addEventListener("change", renderLocations);
sorteren.addEventListener("change", renderLocations);

fetchLocations();
