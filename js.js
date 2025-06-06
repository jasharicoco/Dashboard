// KÖR VID UPPSTART
document.addEventListener("DOMContentLoaded", function () {
    updateClock();
    loadLinks();
    loadNotes();
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
}, { passive: true });



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
// Lägg till eventlyssnare för öppning och stängning av modalen
document.getElementById("add-link-button").addEventListener("click", showLinkModal);
document.getElementById("save-link").addEventListener("click", saveLink);
document.getElementById("cancel-link").addEventListener("click", closeLinkModal);

document.addEventListener("keydown", function(event) {
    // Om användaren trycker på Escape, stäng modalen
    if (event.key === "Escape") {
        closeLinkModal();
    }
    
    // Om användaren trycker på Enter, spara länken
    if (event.key === "Enter") {
        const linkModal = document.getElementById("link-modal");
        // Appliceras endast om linkmodalen är aktiv
        if (linkModal.classList.contains("active")) {
            saveLink();
        }
    }
});

document.addEventListener('click', function(event) {
    // Om klicket är på overlayen (dvs utanför modalen) - stäng ner modal
    if (document.getElementById("overlay").contains(event.target)) {
        closeLinkModal();
    }
});

const linksContainer = document.querySelector("#links-container td");

// Funktion för att visa modalen
function showLinkModal() {
    document.getElementById("link-modal").classList.add("active");  // Lägg till aktiv klass för att visa modal
    document.getElementById("overlay").style.display = "block"; // Visa overlay
    document.getElementById("link-name").focus();
}

function closeLinkModal() {
    document.getElementById("link-modal").classList.remove("active"); // Ta bort aktiv klass för att dölja modal
    document.getElementById("overlay").style.display = "none"; // Dölja overlayn
    document.getElementById("link-name").value = "";
    document.getElementById("link-url").value = "";
    document.getElementById("link-icon-url").value = "";
}

function saveLink() {
    const name = document.getElementById("link-name").value.trim();
    const url = document.getElementById("link-url").value.trim();
    const iconUrl = document.getElementById("link-icon-url").value.trim();
    
    // Fyll i både namn och URL för att kunna spara
    if (!name || !url) {
        alert("Fyll i både Namn och URL");
        return;
    }

    if (currentLinkItem) {
        // Om vi har en länk att uppdatera
        updateLink(currentLinkItem, name, url, iconUrl);
    } else {
        // Annars lägg till en ny länk
        addLink(name, url, iconUrl);
    }
    saveToLocalStorage(name, url, iconUrl);
    closeLinkModal();

    // Rensa fälten när vi har sparat länken
    document.getElementById("link-name").value = ""; // Rensa namn-fältet
    document.getElementById("link-url").value = "";  // Rensa URL-fältet
    document.getElementById("link-icon-url").value = ""; // Rensa ikon-URL-fältet
}

let currentLinkItem = null; // Håller reda på vilken länk som redigeras

// Funktion för att lägga till en länk
function addLink(name, url, iconUrl = null) {
    if (linksContainer.textContent.trim() === "Data") {
        linksContainer.textContent = "";
    }

    const linkItem = document.createElement("div");
    linkItem.classList.add("link-item");
    linkItem.setAttribute("draggable", "true");

    linkItem.addEventListener("dragstart", handleDragStart);
    linkItem.addEventListener("dragover", handleDragOver);
    linkItem.addEventListener("drop", handleDrop);
    linkItem.addEventListener("dragend", handleDragEnd);

    const linkIcon = document.createElement("img");
    linkIcon.classList.add("link-icon");
    // Använd den URL som användaren angav, annars använd en standardikon
    linkIcon.src = iconUrl || `https://www.google.com/s2/favicons?domain=${url}`;
    linkIcon.onerror = function() {
        linkIcon.src = './favicon.ico'; // Standardikon om den angivna ikonen inte kan hämtas
    };

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

    // Lägg till eventlyssnare för högerklick
    linkItem.addEventListener("contextmenu", function(event) {
        event.preventDefault(); // Förhindrar standard högerklickmeny

        // Fyll modalens fält med länkens nuvarande värden
        const name = linkItem.querySelector(".link-name").textContent;
        const url = linkItem.querySelector(".link-name").href;
        const iconUrl = linkItem.querySelector(".link-icon").src;

        // Sätt värdena i modalens inputfält
        document.getElementById("link-name").value = name;
        document.getElementById("link-url").value = url;
        document.getElementById("link-icon-url").value = iconUrl;

        // Sätt currentLinkItem till den länk som redigeras
        currentLinkItem = linkItem;

        // Visa modalen
        showLinkModal();
    });
}

function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.innerHTML);
    event.target.classList.add("dragging");
}

function handleDragOver(event) {
    event.preventDefault(); // Tillåt drop
}

function handleDrop(event) {
    event.preventDefault();
    const draggedData = event.dataTransfer.getData("text/plain");
    const draggedElement = document.createElement("div");
    draggedElement.innerHTML = draggedData;

    // Byt plats på länkarna
    const target = event.target.closest(".link-item");
    const targetHTML = target.innerHTML;
    target.innerHTML = draggedElement.innerHTML;
    draggedElement.innerHTML = targetHTML;
    
    // Uppdatera ordningen i localStorage
    updateLinksOrder();
}

function handleDragEnd(event) {
    event.target.classList.remove("dragging");
}

function removeLink(linkElement, name, url) {
    linkElement.remove();
    removeFromLocalStorage(name, url);
}

function saveToLocalStorage(name, url, iconUrl) {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links.push({ name, url, iconUrl });
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

function removeFromLocalStorage(name, url) {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links = links.filter(link => link.name !== name || link.url !== url);
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

function loadLinks() {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links.forEach(link => addLink(link.name, link.url, link.iconUrl));
}

function updateLinksOrder() {
    let links = [];
    const linkItems = document.querySelectorAll(".link-item");
    linkItems.forEach(item => {
        const name = item.querySelector(".link-name").textContent;
        const url = item.querySelector(".link-name").href;
        links.push({ name, url });
    });
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

// Funktion för att uppdatera en länk
function updateLink(linkItem, newName, newUrl, newIconUrl) {
    linkItem.querySelector(".link-name").textContent = newName;
    linkItem.querySelector(".link-name").href = newUrl;
    const linkIcon = linkItem.querySelector(".link-icon");
    linkIcon.src = newIconUrl || `https://www.google.com/s2/favicons?domain=${newUrl}`;

    // Uppdatera informationen i localStorage
    updateLinkInLocalStorage(linkItem.querySelector(".link-name").textContent, 
                            linkItem.querySelector(".link-name").href, 
                            newName, newUrl, newIconUrl);
}

function updateLinkInLocalStorage(oldName, oldUrl, newName, newUrl, newIconUrl) {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    const link = links.find(link => link.name === oldName && link.url === oldUrl);
    if (link) {
        link.name = newName;
        link.url = newUrl;
        link.iconUrl = newIconUrl;
        localStorage.setItem("quickLinks", JSON.stringify(links));
    }
}



// TABELL 2: VÄDER
const changeCityButton = document.getElementById("change-city-btn");
const cityModal = document.getElementById("city-modal");
const newCityInput = document.getElementById("new-city");
const currentCityElement = document.getElementById("current-city");

let currentCity = "Stockholm"; // Standardstad

// Visa den aktuella staden när sidan laddas
function updateCurrentCityDisplay(city) {
    currentCityElement.innerHTML = "Nuvarande stad:<br><strong>" + city + "</strong>";
}

// Funktion för att visa modalen
function showWeatherModal() {
    document.getElementById("city-modal").classList.add("active");
    document.getElementById("overlay").style.display = "block";
    newCityInput.focus();
    currentCityElement.innerHTML = "<br>Nuvarande stad:<br><strong>" + currentCity + "</strong><br>";
}

// Funktion för att stänga modalen
function closeWeatherModal() {
    document.getElementById("city-modal").classList.remove("active");
    document.getElementById("overlay").style.display = "none";
    document.getElementById("new-city").value = "";
}

// Event: Funktion för att visa modalen när man trycker på de tre punkterna
document.getElementById("change-city-btn").addEventListener("click", function() {
    showWeatherModal();
});


// Event: Funktion för att stänga modalen när man trycker på "Avbryt"
document.getElementById("cancel-city").addEventListener("click", function() {
    closeWeatherModal();
});

// Event: Funktion för att stänga modalen när man trycker på "Spara"
document.getElementById("save-city").addEventListener("click", function() {
        const city = newCityInput.value.trim();
        if (city) {
            currentCity = city; // Uppdatera den aktuella staden
            updateCurrentCityDisplay(city); // Uppdatera staden som visas
            loadWeather(city); // Ladda vädret för den nya staden
            closeWeatherModal();
            newCityInput.value = ""; // Töm inmatningsfältet
        } else {
            alert("Ange en stad.");
        }
});

// Event: Funktion för att stänga modal om användaren klickar utanför modalen
window.addEventListener("click", function(event) {
    if (document.getElementById("overlay").contains(event.target)) {
        closeWeatherModal();
    }
});

// Event: Funktion för att stänga modal om användaren trycker på Escape-tangenten
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeWeatherModal();
    }

    const cityModal = document.getElementById("city-modal")
    
    if (event.key === "Enter" && cityModal.classList.contains("active")) { // Kontrollera om modalen är aktiv
        // För att spara den nya staden när Enter trycks
        const city = newCityInput.value.trim();
        if (city) {
            currentCity = city; // Uppdatera den aktuella staden
            updateCurrentCityDisplay(city); // Uppdatera staden som visas
            loadWeather(city); // Ladda vädret för den nya staden
            closeWeatherModal();
            newCityInput.value = ""; // Töm inmatningsfältet
        } else {
            alert("Ange en stad.");
        }
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
        // Ladda väderdata
        let response = await fetch(url);

        // Kolla om responsen är OK (statuskod 200-299)
        if (!response.ok) {
            // Om statuskoden är 404, dvs staden hittades inte
            if (response.status === 404) {
                alert("Staden hittades inte. Kontrollera stavningen och försök igen.");
                return;
            } else {
                alert("Ett oväntat fel inträffade. Försök igen senare.");
                return;
            }
        }

        // Om responsen är OK, fortsätt med att hämta JSON-data
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
            let icon = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;

            let row = document.createElement("tr");
            row.innerHTML = ` 
                <td>
                    <div class="weather-row">
                        <img src="${icon}" alt="väder">
                        <div class="weather-info">
                            <b>${days[i]}</b>
                            <span>${Math.round(weather.main.temp)} °C</span>
                        </div>
                    </div>
                </td>
            `;
            weatherTableBody.appendChild(row);
        }
    } catch (error) {
        // Hantera andra typer av fel (t.ex. nätverksfel)
        console.error("Kunde inte hämta vädret", error);
        alert("Kunde inte hämta väderinformation. Försök igen senare.");
    }
}


// När sidan laddas, försök hämta vädret för användarens nuvarande position eller använd standardstad
getUserLocation();




// TABELL 3: SVERIGES RADIO
document.addEventListener("DOMContentLoaded", function() {
    loadChannels();
});

async function loadChannels() {
    const channelsBody = document.querySelector(".table-container table:nth-child(3) tbody");
    channelsBody.innerHTML = ''; // Rensa tidigare kanalflöde innan ny data läggs till

    let url = 'https://api.sr.se/api/v2/channels';

    try {
        // Hämta kanaldata
        const response = await fetch(url);
        const xmlData = await response.text(); // Hämta svaret som text (XML)

        // Skapa en parser för att omvandla XML-texten till ett DOM-träd
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
        
        // Hämta alla kanaler från XML-svaret
        const channels = xmlDoc.getElementsByTagName('channel');

        // Lista med tillåtna kanaler (P1, P2, P3)
        const allowedChannels = ['P1', 'P2', 'P3'];

        // Logga varje kanal för att se vad som finns
        Array.from(channels).forEach(async channel => {
            // Hämta data från varje kanal
            const channelName = channel.getAttribute('name');
            const channelTagline = channel.getElementsByTagName('tagline')[0]?.textContent || 'Ingen slogan';
            const channelUrl = channel.getElementsByTagName('siteurl')[0]?.textContent || '#';
            const channelImageUrl = channel.getElementsByTagName('image')[0]?.textContent || '';
            const liveAudioUrl = channel.getElementsByTagName('liveaudio')[0]?.getElementsByTagName('url')[0]?.textContent || '#';
            const scheduleUrl = channel.getElementsByTagName('scheduleurl')[0]?.textContent || '';

            // Filtrera kanaler så att endast P1, P2 och P3 visas
            if (allowedChannels.includes(channelName)) {
                // Hämta information om nuvarande program
                let currentProgram = 'Inget program nu';
                if (scheduleUrl) {
                    try {
                        const programResponse = await fetch(scheduleUrl);
                        
                        // Kontrollera om svaret är korrekt (XML)
                        if (!programResponse.ok) {
                            console.error("Fel vid hämtning av programdata, status:", programResponse.status);
                            return;
                        }
            
                        const xmlData = await programResponse.text();
                        
                        // Skapa en parser för att omvandla XML-texten till ett DOM-träd
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
                        
                        // Hämta aktuellt program från XML (t.ex. genom att ta första programmet)
                        const currentProgramData = xmlDoc.getElementsByTagName('program')[0];
                        
                        if (currentProgramData) {
                            // Hämta programnamnet från name-attributet
                            const programName = currentProgramData.getAttribute('name');
                            if (programName) {
                                currentProgram = programName || 'Inget program nu';
                            } else {
                                console.log("Inget 'name'-attribut i currentProgramData");
                            }
                        } else {
                            console.log("Inget programdata hittades.");
                        }
                    } catch (error) {
                        console.error("Kunde inte hämta programdata", error);
                    }
                }
            
                // Skapa en ny rad för varje kanal
                let row = document.createElement("tr");
            
                // Lägg till kanaldata i tabellen
                row.innerHTML = `
                    <td>
                    <div class="channel-row">
                        <div class="channel-info-wrapper">
                                <img src="${channelImageUrl}" alt="${channelName}" class="channel-img" width="40">
                            <div class="channel-info">
                                <b><a href="${liveAudioUrl}" target="_blank">${channelName}</a></b><br>
                                <span>${currentProgram}</span>
                            </div>
                        </div>
                            
                            <div class="audio-wrapper">
                            <audio controls>
                                <source src="${liveAudioUrl}" type="audio/mpeg">
                                Din webbläsare stödjer inte ljuduppspelning.
                            </audio>
                        </div>
                    </div>
                    </td>
                `;

                // Lägg till raden i tabellen
                channelsBody.appendChild(row);
            }
            
        });

    } catch (error) {
        console.error("Kunde inte hämta kanaler", error);
    }
}




// TABELL 4: ANTECKNINGAR
document.addEventListener("DOMContentLoaded", function() {
    loadNotes();
});


document.getElementById("change-notes-btn").addEventListener("click", openNotesModal);
document.getElementById("close-notes-modal").addEventListener("click", closeNotesModal);
document.getElementById("noteInput").addEventListener("keydown", saveNote);

function openNotesModal() {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = '';

    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    savedNotes.forEach((note, index) => {
        let listItem = document.createElement("li");
        listItem.textContent = note;
        listItem.draggable = true; // Gör listan draggable
        listItem.dataset.index = index; // Spara original index

        // Lägg till drag events
        listItem.addEventListener("dragstart", handleDragStart);
        listItem.addEventListener("dragover", handleDragOver);
        listItem.addEventListener("drop", handleDrop);

        // Lägg till klickhändelse för att stryka över texten
        listItem.addEventListener("click", function () {
            this.classList.toggle("strikethrough");
        });

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "x";
        deleteButton.classList.add("delete-note");
        deleteButton.onclick = function () {
            removeNote(index);
        };

        listItem.appendChild(deleteButton);
        notesList.appendChild(listItem);
    });

    document.getElementById("notes-modal").classList.add("active");
    document.getElementById("overlay").style.display = "block";
}

function closeNotesModal() {
    document.getElementById("notes-modal").classList.remove("active");
    document.getElementById("overlay").style.display = "none";
}

function removeNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    openNotesModal();
}

function saveNote(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const noteInput = document.getElementById("noteInput");
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        const newNote = noteInput.value.trim();

        if (newNote && !notes.includes(newNote)) {
            notes.push(newNote);
            localStorage.setItem("notes", JSON.stringify(notes));
            noteInput.value = '';
        }
    }
}

function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteInput = document.getElementById("noteInput");
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = '';

    if (savedNotes.length > 0) {
        noteInput.value = savedNotes[savedNotes.length - 1];
    }

    savedNotes.forEach((note, index) => {
        let listItem = document.createElement("li");
        listItem.textContent = note;
        
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "x";
        deleteButton.classList.add("delete-note");
        deleteButton.onclick = function() {
            removeNote(index);
        };

        listItem.appendChild(deleteButton);
        notesList.appendChild(listItem);
    });
}

window.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeNotesModal();
    }
});

document.addEventListener('click', function(event) {
    if (document.getElementById("overlay").contains(event.target)) {
        closeNotesModal();
    }
});

// Stryk anteckningar utan att radera dem
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#notes-list li").forEach(function (item) {
        item.addEventListener("click", function () {
            this.classList.toggle("strikethrough");
        });
    });
});

// DRAG AND DROP LIST ITEMS
let draggedItem = null;

function handleDragStart(event) {
    draggedItem = this; // Spara det element som dras
    event.dataTransfer.effectAllowed = "move";
}

function handleDragOver(event) {
    event.preventDefault(); // Gör det möjligt att släppa elementet här
    event.dataTransfer.dropEffect = "move";
}

function handleDrop(event) {
    event.preventDefault();

    if (draggedItem !== this) {
        let parent = this.parentNode;
        let items = Array.from(parent.children);
        let draggedIndex = items.indexOf(draggedItem);
        let targetIndex = items.indexOf(this);

        // Byt plats i DOM
        if (draggedIndex < targetIndex) {
            parent.insertBefore(draggedItem, this.nextSibling);
        } else {
            parent.insertBefore(draggedItem, this);
        }

        // Uppdatera LocalStorage med ny ordning
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        let draggedText = notes[draggedIndex];

        notes.splice(draggedIndex, 1);
        notes.splice(targetIndex, 0, draggedText);
        localStorage.setItem("notes", JSON.stringify(notes));
    }
}



// FOOTER
// Funktion för att byta bakgrundsbild från Unsplash API med Fetch API
async function changeBackground() {
    const apiKey = 'E_1NnPtK1MqmSsNsI_z8Eb_5Gcpbu418ocfgWV1yvsw';
    const apiUrl = `https://api.unsplash.com/collections/1913171/photos?client_id=${apiKey}`; // Standard
    //const apiUrl = `https://api.unsplash.com/collections/8860674/photos?client_id=${apiKey}`; // Thailand

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP-fel! Status: ${response.status}`);

        const data = await response.json();
        
        // Välj en slumpmässig bild från samlingen
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
changeBackground();

// Ändra opacity på knappen till 0.3 så länge man ej är längst ner på sidan
window.addEventListener("scroll", function () {
    let button = document.querySelector(".bottom-button");

// Kontrollera om användaren är nära botten på sidan
let isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

    if (isAtBottom) {
        button.style.opacity = "0.8";
    } else {
        button.style.opacity = "0.3";
    }
}, { passive: true });



// FLYTTA TABELLER
// Hämta alla tabellrubriker
const headers = document.querySelectorAll('th[draggable="true"]');
const container = document.querySelector('.table-container');

// Lägg till eventlyssnare för varje rubrik
headers.forEach(header => {
    header.addEventListener('dragstart', (e) => {
        // Hämta den tabell som rubriken tillhör
        const table = e.target.closest('table');
        e.dataTransfer.setData('text/plain', table.id); // Skicka med id på den dragna tabellen
    });

    header.addEventListener('dragover', (e) => {
        e.preventDefault(); // Nödvändigt för att släppet ska fungera
    });

    header.addEventListener('drop', (e) => {
        e.preventDefault();

        // Hämta ID för tabellerna
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedTable = document.getElementById(draggedId);

        // Bestäm vilken tabell som är släpplig
        const targetHeader = e.target;
        const targetTable = targetHeader.closest('table');

        // Byt plats på tabellerna
        if (draggedTable !== targetTable) {
            const draggedIndex = Array.from(container.children).indexOf(draggedTable);
            const targetIndex = Array.from(container.children).indexOf(targetTable);
            
            if (draggedIndex < targetIndex) {
                container.insertBefore(draggedTable, targetTable.nextSibling);
            } else {
                container.insertBefore(draggedTable, targetTable);
            }
        }
    });
});
