"use strict";
//dit is voor de achtergrond te switchen van donker naar licht
const backgroundToggle = document.getElementById('themeToggle');
const body = document.body;
function background (){
    //controlleer het huidige achtergrond thema
    if(body.classList.contains('light-theme')){
        //schakel naar donker thema
        body.classList.replace('light-theme','dark-theme')
        backgroundToggle.textContent = 'Press here for light mode!'
        //Sla de voorkeur op in de localstorage
        localStorage.setItem('theme','dark-theme')
    }else{
        //schakel naar light theme
        body.classList.replace('dark-theme','light-theme')
        backgroundToggle.textContent = 'Press here for dark mode!'
        //voorkeur opslagen in de localstorage
        localStorage.setItem('theme', 'light-theme')
    }
}
backgroundToggle.addEventListener('click', background);
function achtergrondLaden () {
    //de opgeslagen thema die in de localstorage zit eruit halen
    const savedBackground = localStorage.getItem('theme');

    if(savedBackground){
        body.className = savedBackground;
        //tekst van de knop updaten na het drukken
        if(savedBackground === 'dark-theme'){
            backgroundToggle.textContent = 'Press here for light mode!';
        }else{
            backgroundToggle.textContent = 'Press here for dark mode!'
        }
    }
}
achtergrondLaden();

