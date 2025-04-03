"use strict";

// Achtergrond thema switchen
const backgroundToggle = document.getElementById("themeToggle");
const body = document.body;

const background = () => {
    if (body.classList.contains("light-theme")) {
        body.classList.replace("light-theme", "dark-theme");
        backgroundToggle.textContent = "Press here for light mode!";
        localStorage.setItem("theme", "dark-theme");
    } else {
        body.classList.replace("dark-theme", "light-theme");
        backgroundToggle.textContent = "Press here for dark mode!";
        localStorage.setItem("theme", "light-theme");
    }
};
backgroundToggle.addEventListener("click", background);

const achtergrondLaden = () => {
    const savedBackground = localStorage.getItem("theme");
    if (savedBackground) {
        body.className = savedBackground;
        backgroundToggle.textContent =
            savedBackground === "dark-theme" ? "Press here for light mode!" : "Press here for dark mode!";
    }
};
achtergrondLaden();

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
        (loc.naam_fresco_nl?.toLowerCase().includes(zoekterm) ||
            loc.nom_de_la_fresque?.toLowerCase().includes(zoekterm) ||
            loc.dessinateur?.toLowerCase().includes(zoekterm) ||
            loc.adres?.toLowerCase().includes(zoekterm) ||
            loc.date?.toLowerCase().includes(zoekterm) ||
            loc.maison_d_edition?.toLowerCase().includes(zoekterm))
    );

    if (geselecteerdeGemeente !== "all") {
        gefilterdeLocaties = gefilterdeLocaties.filter(
            (loc) => loc.commune_gemeente?.toLowerCase().includes(geselecteerdeGemeente)
        );
    }

    // Sorteren
    gefilterdeLocaties.sort((a, b) => {
        if (sorteerMethode === "name") return a.dessinateur.localeCompare(b.dessinateur);
        if (sorteerMethode === "name2") return b.dessinateur.localeCompare(a.dessinateur);
        if (sorteerMethode === "date") return new Date(a.date) - new Date(b.date);
        if (sorteerMethode === "date2") return new Date(b.date) - new Date(a.date);
    });

    locatieContainer.innerHTML = ""; // Clear container

    if (gefilterdeLocaties.length === 0) {
        locatieContainer.innerHTML = "<p class='geen-resultaten'>Geen zoekresultaat gevonden.</p>";
        return;
    }

    const tabel = document.createElement("table");

    const header = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["Muurschildering", "Tekenaar", "Jaar", "Adres", "Uitgeverij", "Afbeelding", "Favoriet"];
    headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    tabel.appendChild(header);

    const body = document.createElement("tbody");

    gefilterdeLocaties.forEach((loc) => {
        const row = document.createElement("tr");

        const schilderijNaam = document.createElement("td");
        schilderijNaam.textContent = `${loc.nom_de_la_fresque || ""} (${loc.naam_fresco_nl || ""})`;
        row.appendChild(schilderijNaam);

        const tekenaar = document.createElement("td");
        tekenaar.textContent = loc.dessinateur || "Onbekend";
        row.appendChild(tekenaar);

        const datum = document.createElement("td");
        datum.textContent = loc.date || "Onbekend";
        row.appendChild(datum);

        const address = document.createElement("td");
        address.textContent = loc.adresse || loc.adres || "Geen adres beschikbaar";
        row.appendChild(address);

        const uitgeverij = document.createElement("td");
        uitgeverij.textContent = loc.maison_d_edition || "Onbekend";
        row.appendChild(uitgeverij);

        const imageCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = loc.image || "geen afbeelding beschikbaar";
        img.alt = loc.nom_de_la_fresque || "Geen afbeelding";
        imageCell.appendChild(img);
        row.appendChild(imageCell);

        // Favorieten-knop
        const favorietCell = document.createElement("td");
        const favorietenKnop = document.createElement("button");
        favorietenKnop.textContent = favorieten.some((fav) => fav.nom_de_la_fresque === loc.nom_de_la_fresque) ? "⭐" : "☆";
        favorietenKnop.addEventListener("click", () => toggleFavoriet(loc, favorietenKnop));
        favorietCell.appendChild(favorietenKnop);
        row.appendChild(favorietCell);

        body.appendChild(row);
    });

    tabel.appendChild(body);
    locatieContainer.appendChild(tabel);
};

// Favoriet toevoegen
const toggleFavoriet = (locatie, knop) => {
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
};

// Favorieten weergeven
const renderFavorieten = () => {
    favorietenContainer.innerHTML = "";
    if (favorieten.length === 0) {
        favorietenContainer.innerHTML = "<p>Geen favorieten geselecteerd.</p>";
        return;
    }
    favorieten.forEach((fav) => {
        const p = document.createElement("p");
        p.textContent = fav.nom_de_la_fresque || "Onbekend";
        favorietenContainer.appendChild(p);
    });
};

// Event listeners
zoekKnop.addEventListener("click", renderLocations);
category.addEventListener("change", renderLocations);
sorteren.addEventListener("change", renderLocations);

fetchLocations();
