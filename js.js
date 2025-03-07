// KÖR VID UPPSTART
document.addEventListener("DOMContentLoaded", function () {
    updateClock();
    loadWeather();
    loadLinks();
    loadNotes();
    setupEventListeners();
    changeBackground();
});



// HEADER: KLOCKA
function updateClock() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    // Uppdaterar klockan varje sekund
    document.getElementById('clock').innerText = now.toLocaleTimeString('sv-SE', timeOptions) + ' ' + now.toLocaleDateString('sv-SE', options);
}

setInterval(updateClock, 1000);
updateClock();

// När man börjar scrolla ner i sidan så minskar opaciteten på headern
window.addEventListener("scroll", function () {
    let clock = document.getElementById("clock");

    if (window.scrollY > 0) {
        clock.style.opacity = "0.3";
    } else {
        clock.style.opacity = "0.8";
    }
});



// DASHBOARD TITLE
// Hämta element för titeln
const dashboardTitle = document.getElementById("dashboard-title");

// Kontrollera om en tidigare titel finns sparad i localStorage och använd den
const savedTitle = localStorage.getItem("dashboardTitle");
if (savedTitle) {
    dashboardTitle.textContent = savedTitle; // Sätt den sparade titeln
}

// Funktion för att hantera ändring av titel
dashboardTitle.addEventListener("blur", function() {
    const newTitle = dashboardTitle.textContent.trim();
    if (newTitle) {
        localStorage.setItem("dashboardTitle", newTitle); // Spara den nya titeln
    } else {
        dashboardTitle.textContent = "ZIGGIS DASHBOARD"; // Sätt tillbaka standardtitel om den är tom
        localStorage.setItem("dashboardTitle", "ZIGGIS DASHBOARD"); // Spara standardtiteln
    }
});

// Eventuellt kan du även lyssna på "Enter"-tangenten om du vill göra något extra vid ändringen
dashboardTitle.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        dashboardTitle.blur(); // Gör så att redigeringen avslutas när Enter trycks
    }
});



// TABELL 1: SNABBLÄNKAR
document.getElementById("add-link-button").addEventListener("click", showModal);
document.getElementById("save-link").addEventListener("click", saveLink);
document.getElementById("cancel-link").addEventListener("click", closeModal);
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeModal(); // Stänger modalen om Escape trycks
    }
});
document.addEventListener('click', function(event) {
    const modal = document.getElementById('link-modal');
    const modalContent = document.querySelector('.modal-content');
    const addLinkButton = document.getElementById('add-link-button'); // Lägg till denna rad

    // Om klicket inte var på modalen eller på innehållet i modalen OCH inte på lägg till länk-knappen, stäng modalen
    if (!modal.contains(event.target) && !modalContent.contains(event.target) && event.target !== addLinkButton) {
        closeModal();
    }
});

const linksContainer = document.querySelector("#links-container td");

function showModal() {
    document.getElementById("link-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("link-modal").style.display = "none";
    document.getElementById("link-name").value = "";
    document.getElementById("link-url").value = "";
}

function saveLink() {
    const name = document.getElementById("link-name").value.trim();
    const url = document.getElementById("link-url").value.trim();

    if (!name || !url) {
        alert("Fyll i både Namn och URL");
        return;
    }

    addLink(name, url);
    saveToLocalStorage(name, url);
    closeModal();
}

function addLink(name, url) {
    if (linksContainer.textContent.trim() === "Data") {
        linksContainer.textContent = "";
    }

    const linkItem = document.createElement("div");
    linkItem.classList.add("link-item");

    const linkIcon = document.createElement("img");
    linkIcon.classList.add("link-icon");
    linkIcon.src = `https://www.google.com/s2/favicons?domain=${url}`;// Dynamisk ikon från URL

    const linkName = document.createElement("a");
    linkName.classList.add("link-name");
    linkName.textContent = name;
    linkName.href = url;
    linkName.target = "_blank";

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-link");
    removeButton.textContent = "x";
    removeButton.onclick = function() {
        removeLink(linkItem, name, url);
    };

    linkItem.appendChild(linkIcon);
    linkItem.appendChild(linkName);
    linkItem.appendChild(removeButton);
    linksContainer.appendChild(linkItem);
}

function removeLink(linkElement, name, url) {
    linkElement.remove();
    removeFromLocalStorage(name, url);

    if (linksContainer.children.length === 0) {
        linksContainer.textContent = "Data";
    }
}

function saveToLocalStorage(name, url) {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links.push({ name, url });
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

function removeFromLocalStorage(name, url) {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links = links.filter(link => link.name !== name || link.url !== url);
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

function loadLinks() {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links.forEach(link => addLink(link.name, link.url));
}

// Lägg till eventlyssnare för Enter-tangent på Name och URL inputfält
document.getElementById("link-name").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Förhindra att form skickas
        saveLink(); // Spara länken
    }
});

document.getElementById("link-url").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Förhindra att form skickas
        saveLink(); // Spara länken
    }
});



// TABELL 2: VÄDER
const changeCityButton = document.getElementById("change-city-btn");
const cityModal = document.getElementById("city-modal");
const saveCityButton = document.getElementById("save-city");
const cancelCityButton = document.getElementById("cancel-city");
const newCityInput = document.getElementById("new-city");
const currentCityElement = document.getElementById("current-city");

let currentCity = "Stockholm"; // Standardstad

// Visa den aktuella staden när sidan laddas
function updateCurrentCityDisplay(city) {
    currentCityElement.innerHTML = "Nuvarande stad:<br><strong>" + city + "</strong>";

}

// Funktion för att visa modalen för att byta stad
changeCityButton.addEventListener("click", function() {
    currentCityElement.innerHTML = "Nuvarande stad:<br><strong>" + currentCity + "</strong>";
    cityModal.style.display = "block";
});

// Funktion för att stänga modalen när man trycker på "Avbryt"
cancelCityButton.addEventListener("click", function() {
    cityModal.style.display = "none";
    newCityInput.value = ""; // Töm inmatningsfältet
});

// Funktion för att spara den nya staden och uppdatera vädret
saveCityButton.addEventListener("click", function() {
    const city = newCityInput.value.trim();
    if (city) {
        currentCity = city; // Uppdatera den aktuella staden
        updateCurrentCityDisplay(city); // Uppdatera staden som visas
        loadWeather(city); // Ladda vädret för den nya staden
        cityModal.style.display = "none"; // Stäng modalen
        newCityInput.value = ""; // Töm inmatningsfältet
    } else {
        alert("Ange en stad.");
    }
});

// Funktion för att stänga modal om användaren trycker på Escape-tangenten
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        cityModal.style.display = "none"; // Stäng modalen om Escape trycks
    }
});

// Funktion för att stänga modal om användaren klickar utanför modalen
window.addEventListener("click", function(event) {
    if (!cityModal.contains(event.target) && event.target !== changeCityButton) {
        cityModal.style.display = "none"; // Stäng modalen om användaren klickar utanför den
    }
});

// Funktion för att hämta användarens nuvarande plats
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showWeatherForLocation, handleLocationError);
    } else {
        alert("Geolokalisering stöds inte av denna webbläsare.");
        loadWeather(currentCity); // Ladda vädret för den sparade staden om geolokalisering inte fungerar
    }
}

// Funktion som körs om positionen hämtas korrekt
function showWeatherForLocation(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Hämta vädret baserat på lat/lon
    loadWeather(lat, lon); // Vi laddar vädret för latitud och longitud direkt här

    // Uppdatera aktuell stad med baserat på geolokalisering
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=bd5e378503939ddaee76f12ad7a97608`)
        .then(response => response.json())
        .then(data => {
            currentCity = data.name; // Uppdatera den aktuella staden med platsen som hämtades
            updateCurrentCityDisplay(currentCity); // Visa den nya staden
        })
        .catch(error => {
            console.error("Fel vid hämtning av stadens namn:", error);
            updateCurrentCityDisplay("Okänd stad"); // Sätt till okänd stad om fel
        });
}

// Funktion som körs om ett fel uppstår vid hämtning av plats
function handleLocationError(error) {
    console.error("Fel vid hämtning av plats:", error);
    alert("Det gick inte att hämta din plats. Vädret för Stockholm visas istället.");
    updateCurrentCityDisplay("Stockholm"); // Visa Stockholm som aktuell stad
    currentCity = "Stockholm";
    loadWeather("Stockholm"); // Ladda vädret för den nya staden
}

// Funktion för att ladda väderdata baserat på latitud och longitud
async function loadWeather(latOrCity, lon = null) {
    const weatherTableBody = document.querySelector(".table-container table:nth-child(2) tbody");
    weatherTableBody.innerHTML = ''; // Rensa tidigare väderprognoser innan ny data läggs till

    let url = '';
    if (lon) {
        // Om latitud och longitud skickas
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latOrCity}&lon=${lon}&units=metric&appid=bd5e378503939ddaee76f12ad7a97608`;
    } else {
        // Om bara en stad skickas
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${latOrCity}&units=metric&appid=bd5e378503939ddaee76f12ad7a97608`;
    }

    try {
        // Hämta väderdata
        let response = await fetch(url);
        let data = await response.json();

        // Veckodagsnamn på svenska
        const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
        
        // Få dagens datum och veckodag
        let currentDate = new Date();
        let currentDay = currentDate.getDay(); // Hämta dagens veckodag (0 = Söndag, 1 = Måndag, ...)

        // Förbered arrayen för att fylla på de rätta veckodagarna
        let days = [];
        
        for (let i = 0; i < 5; i++) {
            let dayIndex = (currentDay + i) % 7;  // Beräkna rätt veckodag med modulus
            days.push(weekdays[dayIndex]);  // Lägg till veckodagsnamnet i arrayen
        }

        // Lägg till väderrader i tabellen
        for (let i = 0; i < 5; i++) {
            let weather = data.list[i * 8];  // Få väderprognos för varje dag
            let icon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;

            let row = document.createElement("tr");
            row.innerHTML = ` 
                <td>
                    <div class="weather-row">
                        <img src="${icon}" alt="väder">
                        <div class="weather-info">
                            <b>${days[i]}</b>
                            <span>${weather.main.temp} °C</span>
                        </div>
                    </div>
                </td>
            `;
            weatherTableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Kunde inte hämta vädret", error);
    }
}

// När sidan laddas, försök hämta vädret för användarens nuvarande position eller använd standardstad
getUserLocation();



// TABELL 3:



// TABELL 4: ANTECKNINGAR
document.addEventListener("DOMContentLoaded", function() {
    // Koppla eventlyssnare till knappen för att öppna modal
    document.getElementById("change-notes-btn").addEventListener("click", openNotesModal);
    document.getElementById("close-notes-modal").addEventListener("click", closeNotesModal);
    
    // Lägg till eventlyssnare för att stänga modal vid Escape eller klick utanför modalen
    window.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeNotesModal();  // Stänger modal om Escape trycks
        }
    });

    window.addEventListener('click', function (event) {
        const modal = document.getElementById('notes-modal');
        
        // Kontrollera om klicket var utanför modalen och inte på borttagningsknappen
        if (!modal.contains(event.target) && !Array.from(removeButtons).includes(event.target)) {
            closeNotesModal(); // Stäng modalen om användaren klickar utanför den och inte på en borttagningsknapp
        }
    });

    loadNotes();
});

// Funktion för att öppna modal och visa sparade anteckningar
function openNotesModal() {
    const modal = document.getElementById("notes-modal");
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = ''; // Rensa listan innan vi lägger till nya anteckningar

    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    savedNotes.forEach((note, index) => {
        let listItem = document.createElement("li");
        listItem.textContent = note;
        
        // Skapa en borttagningsknapp för varje anteckning
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "x";
        deleteButton.classList.add("delete-note");
        deleteButton.onclick = function() {
            removeNote(index);
        };

        listItem.appendChild(deleteButton);
        notesList.appendChild(listItem);
    });

    modal.style.display = "block";  // Visa modalen
}

// Funktion för att stänga modal
function closeNotesModal() {
    document.getElementById("notes-modal").style.display = "none"; // Stäng modalen
}

// Funktion för att ta bort en anteckning från både UI och localStorage
function removeNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);  // Ta bort anteckningen från arrayen
    localStorage.setItem("notes", JSON.stringify(notes));

    // Uppdatera modalen för att visa de senaste anteckningarna
    openNotesModal();
}

// Funktion för att spara anteckningar till localStorage
function saveNote(event) {
    const noteInput = document.getElementById("noteInput");

    // Kontrollera om det är Enter-tangenten som trycks
    if (event.key === "Enter") {
        event.preventDefault();  // Förhindra att en ny rad skapas i textområdet

        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        const newNote = noteInput.value.trim();

        if (newNote && !notes.includes(newNote)) {
            notes.push(newNote);  // Lägg till anteckningen om den inte redan finns
            localStorage.setItem("notes", JSON.stringify(notes));

            noteInput.value = '';  // Nollställ textområdet efter sparing
        }
    }
}

// Lägg till eventlyssnare på textområdet
document.getElementById("noteInput").addEventListener("keypress", saveNote);


// Funktion för att ladda sparade anteckningar när sidan laddas
function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteInput = document.getElementById("noteInput");

    // Om det finns sparade anteckningar, fyll textområdet med den senaste anteckningen
    if (savedNotes.length > 0) {
        noteInput.value = savedNotes[savedNotes.length - 1];
    }
}

// FOOTER
// Funktion för att byta bakgrundsbild från Unsplash API med Fetch API
async function changeBackground() {
    const apiKey = 'E_1NnPtK1MqmSsNsI_z8Eb_5Gcpbu418ocfgWV1yvsw';
    const apiUrl = `https://api.unsplash.com/collections/1913171/photos?client_id=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP-fel! Status: ${response.status}`);

        const data = await response.json();
        
        // ✅ Välj en slumpmässig bild från samlingen
        const randomImage = data[Math.floor(Math.random() * data.length)];

        if (!randomImage || !randomImage.urls) {
            throw new Error("Ingen giltig bild hittades.");
        }

        const newBackgroundUrl = randomImage.urls.regular;
        document.body.style.backgroundImage = `url(${newBackgroundUrl})`;

        // Spara bakgrund i localStorage
        localStorage.setItem('background', `url(${newBackgroundUrl})`);

    } catch (error) {
        console.error('Fel vid hämtning av bakgrundsbild:', error);
    }
}

// Ändra opacity till 0.3 så länge man ej är längst ner på sidan
window.addEventListener("scroll", function () {
    let button = document.querySelector(".bottom-button");

// Kontrollera om användaren är nära botten på sidan
let isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

    if (isAtBottom) {
        button.style.opacity = "0.8";
    } else {
        button.style.opacity = "0.3";
    }
});
