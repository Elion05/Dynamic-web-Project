"use strict";
// Achtergrond thema switchen
const backgroundToggle = document.getElementById('themeToggle');
const body = document.body;
const  background = () => {
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
const achtergrondLaden = () => {
    const savedBackground = localStorage.getItem('theme');
    if (savedBackground) {
        body.className = savedBackground;
        backgroundToggle.textContent = savedBackground === 'dark-theme' ? 'Press here for light mode!' : 'Press here for dark mode!';
    }
}
achtergrondLaden();

// HTML-elementen ophalen van de Index.html bestand
const locatieContainer = document.getElementById("Locaties");
const zoekbar = document.getElementById("zoekbar");
const zoekKnop = document.getElementById("zoekKnop");
const category = document.getElementById("category");
const sorteren = document.getElementById("sorteren");
let locations = [];
let favorieten = JSON.parse(localStorage.getItem("favorieten"))
const favorietenContainer = document.getElementById('favorites')

//api fetchen uit opendata.brussels api website
async function fetchMuurschildering() {
    try {
        const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=70");
        const data = await response.json();
        console.log('API Response Data:', data);

        if (data?.results) {
            console.log('API DATTA:', data)
            locations = data.results;
            renderMuurschildering(data.results);
            renderFavorieten();
        }   
        //foutmelding
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        locatieContainer.innerHTML = "<p class='foutmelding1'>❌Fout bij het laden van locaties.❌</p>";
    }
}
// Locaties renderen op de pagina in een tabel en tonen op de site
const renderMuurschildering = () => {
    const zoekterm = zoekbar.value.toLowerCase();
    const sorteerMethode = sorteren.value;
    const geselecteerdeGemeente = category.value.toLowerCase();
//zoekterm bevestigen en tonen, adres,naam,jaar,muurschilderij, uitgeverij
    let gefilterdeLocaties = locations.filter(loc => 
        loc.naam_fresco_nl.toLowerCase().includes(zoekterm) 
        || loc.nom_de_la_fresque.toLowerCase().includes(zoekterm) ||
        loc.dessinateur.toLowerCase().includes(zoekterm) || 
        loc.adres.toLowerCase().includes(zoekterm)||
        loc.adresse.toLowerCase().includes(zoekterm)||
        loc.date.toLowerCase().includes(zoekterm)||
        loc.maison_d_edition.toLowerCase().includes(zoekterm)
    );
    //schilderij filteren per gemeentes
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

    locatieContainer.innerHTML = "";  //container schoonmaken

    if (gefilterdeLocaties.length === 0) {
        locatieContainer.innerHTML = "<p class='geen-resultaten'>Geen zoek resultaat gevonden. </p>";
        return;
    }
    
    // de tabel voor de api data op te zetten
    const tabel = document.createElement('table');
    tabel.style.width = '100%';
    tabel.style.border = '2px solid #ddd';
    tabel.style.borderCollapse = 'collapse';

    //header waar de zeg maar h3 komt te staan voor elke zijn categorie
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Muurschildering', 'Tekenaar', 'Jaar', 'Adres','Uitgeverij', 'Afbeelding'];
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

    //de table aanvullen
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
        tekenaar.textContent = `${loc.dessinateur}` || 'Onbekend';
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
        
        //Uitgeverij const 
        const uitgeverij = document.createElement('td');
        uitgeverij.textContent = loc.maison_d_edition || 'Onbekend';
        uitgeverij.style.padding = '10px';
        uitgeverij.style.borderBottom= '10px solid #ddd'
        row.appendChild(uitgeverij);

     

        // Afbeelding  const 
        const imageCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = loc.image || 'geen afbeelding beschikbaar';  //geen image beschikbaar = geen afbeelding beschikbaar
        img.alt = loc.nom_de_la_fresque || 'geen afbeelding beschikbaar';
        imageCell.appendChild(img);
        imageCell.style.padding = '10px';
        imageCell.style.borderBottom = '10px solid #ddd';
        row.appendChild(imageCell);

        //de favoriete knop naast de afbeelding
        const favorietCell = document.createElement("td");
        const favorietenKnop = document.createElement("button");
        favorietenKnop.textContent = favorieten.some((fav) => fav.nom_de_la_fresque === loc.nom_de_la_fresque) ? "⭐" : "☆";
        favorietenKnop.addEventListener("click", () => toggleFavoriet(loc, favorietenKnop));
        favorietCell.appendChild(favorietenKnop);
        row.appendChild(favorietCell);

        body.appendChild(row);
    });
        
        //de tabel aan de body toevoegen
    tabel.appendChild(body);
    locatieContainer.appendChild(tabel);
    };

    //functie maken om het bij de localstorage te opslaan en de knoppen te veranderen van teken
const toggleFavoriet = (locatie, knop) => {
    const index = favorieten.findIndex((fav) => fav.nom_de_la_fresque === locatie.nom_de_la_fresque);
    //-1 gebruiken omdat anders kan je het meerdere keren toevoegen wat niet de bedoeling is
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


    //vanaf hier is het 70% hetzelfde als renderlocatie maar hier hebben we dan de knop
    // Maak een tabel aan
    const tabel = document.createElement("table");
    tabel.style.width = "100%";
    tabel.style.border = "2px solid #ddd";
    tabel.style.borderCollapse = "collapse";

    // Maak de tabelkop
    const header = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["Muurschildering", "Tekenaar", "Jaar", "Adres", "Uitgeverij", "Afbeelding", "Verwijderen"];

    headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        th.style.padding = "10px";
        th.style.textAlign = "left";
        th.style.borderBottom = "4px solid #ddd";
        headerRow.appendChild(th);
    });

    header.appendChild(headerRow);
    tabel.appendChild(header);

    // Maak de tabel body
    const body = document.createElement("tbody");

    favorieten.forEach((fav, index) => {
        const row = document.createElement("tr");

        // Muurschildering  const
        const schilderijNaam = document.createElement("td");
        schilderijNaam.textContent = `${fav.nom_de_la_fresque} (${fav.naam_fresco_nl})`;
        schilderijNaam.style.padding = "10px";
        schilderijNaam.style.borderBottom = "4px solid #ddd";
        row.appendChild(schilderijNaam);

        // Tekenaar const
        const tekenaarCell = document.createElement("td");
        tekenaarCell.textContent = fav.dessinateur || "Onbekend";
        tekenaarCell.style.padding = "10px";
        tekenaarCell.style.borderBottom = "4px solid #ddd";
        row.appendChild(tekenaarCell);

        // Datum const
        const datumCell = document.createElement("td");
        datumCell.textContent = fav.date || "Onbekend";
        datumCell.style.padding = "10px";
        datumCell.style.borderBottom = "4px solid #ddd";
        row.appendChild(datumCell);

        // Adres
        const adresCell = document.createElement("td");
        adresCell.textContent = fav.adresse || fav.adres || "Geen adres beschikbaar";
        adresCell.style.padding = "10px";
        adresCell.style.borderBottom = "4px solid #ddd";
        row.appendChild(adresCell);

        // Uitgeverij
        const uitgeverijCell = document.createElement("td");
        uitgeverijCell.textContent = fav.maison_d_edition || "Onbekend";
        uitgeverijCell.style.padding = "10px";
        uitgeverijCell.style.borderBottom = "4px solid #ddd";
        row.appendChild(uitgeverijCell);

        // Afbeelding
        const imageCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = fav.image || "default.jpg";
        img.alt = fav.nom_de_la_fresque || "Geen afbeelding beschikbaar";
        img.style.width = "100px";
        img.style.height = "auto";
        imageCell.appendChild(img);
        imageCell.style.padding = "10px";
        imageCell.style.borderBottom = "4px solid #ddd";
        row.appendChild(imageCell);

        // de knop om het uit favorieten te halen
        const verwijderCell = document.createElement("td");
        const verwijderKnop = document.createElement("button");
        verwijderKnop.textContent = "X knop";
        verwijderKnop.style.cursor = "pointer";
        verwijderKnop.addEventListener("click", () => {
            favorieten.splice(index, 1);
            localStorage.setItem("favorieten", JSON.stringify(favorieten));
            renderFavorieten();
        });
        verwijderCell.appendChild(verwijderKnop);
        row.appendChild(verwijderCell);

        body.appendChild(row);
    });
    //de tabel in de body steken
    tabel.appendChild(body);
    //zelfde als hierboven behalve favorieten gaaat in de tabel 
    favorietenContainer.appendChild(tabel);
};


//event listeners om te filteren en sorteren  en het opzoeken van resultaten
zoekKnop.addEventListener("click", renderMuurschildering);
category.addEventListener("change", renderMuurschildering);
sorteren.addEventListener("change", renderMuurschildering);
// Data ophalen bij het laden van de pagina
fetchMuurschildering();