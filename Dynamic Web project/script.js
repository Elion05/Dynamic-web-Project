




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


document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=70';  // URL van de API
    const locatieContainer = document.getElementById('Locaties');
    const zoekKnop = document.getElementById('zoekKnop');
    const zoekbar = document.getElementById('zoekbar');
    const categorySelect = document.getElementById('category');
    const sorterenSelect = document.getElementById('sorteren');

    // Functie om de API te halen en weer te geven
    const haalLocatiesOp = () => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const locaties = data.records;
                const filterCategorie = categorySelect.value;
                const zoekTerm = zoekbar.value.toLowerCase();

                // Filteren van de locaties
                const gefilterdeLocaties = locaties.filter(record => {
                    const title = record.fields.title.toLowerCase();
                    const category = record.fields.category ? record.fields.category.toLowerCase() : ''; // Beschermt tegen lege categorieën
                    const isCategorieMatch = filterCategorie === 'all' || category.includes(filterCategorie);
                    const isZoekMatch = title.includes(zoekTerm);

                    return isCategorieMatch && isZoekMatch;
                });

                // Sorteren van de locaties
                const gesorteerdeLocaties = gefilterdeLocaties.sort((a, b) => {
                    if (sorterenSelect.value === 'name') {
                        return a.fields.title.localeCompare(b.fields.title);
                    } else if (sorterenSelect.value === 'date') {
                        // Zorg ervoor dat de datums correct worden vergeleken
                        const dateA = new Date(a.fields.date);
                        const dateB = new Date(b.fields.date);
                        return dateA - dateB;
                    }
                    return 0;
                });

                // Weergeven van de locaties
                locatieContainer.innerHTML = ''; // Maak de lijst leeg voordat je nieuwe locaties toevoegt
                if (gesorteerdeLocaties.length > 0) {
                    gesorteerdeLocaties.forEach(record => {
                        const locatieDiv = document.createElement('div');
                        locatieDiv.classList.add('locatie');
                        locatieDiv.innerHTML = `
                            <h3>${record.fields.title}</h3>
                            <p>${record.fields.description || 'Geen beschrijving beschikbaar.'}</p>
                            <p><strong>Categorie:</strong> ${record.fields.category || 'Geen categorie'}</p>
                        `;
                        locatieContainer.appendChild(locatieDiv);
                    });
                } else {
                    // Als geen locaties passen bij de zoekopdracht of filters
                    locatieContainer.innerHTML = '<p>Geen locaties gevonden die aan de zoekcriteria voldoen.</p>';
                }
            })
            .catch(error => {
                console.error('Fout bij het ophalen van de data:', error);
                locatieContainer.innerHTML = '<p>Er is een fout opgetreden bij het ophalen van de locaties.</p>';
            });
    };

    // Event listener voor de zoekknop
    zoekKnop.addEventListener('click', haalLocatiesOp);

    // Event listener voor het filteren van de categorie
    categorySelect.addEventListener('change', haalLocatiesOp);

    // Event listener voor het sorteren van de locaties
    sorterenSelect.addEventListener('change', haalLocatiesOp);

    // Haal de locaties op bij het laden van de pagina
    haalLocatiesOp();
});
