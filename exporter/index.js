import * as shadeglass from './shadeglass.js';

import {
    bcpFactionMap, deckMap, bcpBaseUrl, bcpPairingsEndpoint, bcpPlayersEndpoint, bcpDecklistBaseUrl, bcpFrontBase,
    bcpTournamentDetailsEndpoint, bcpPlacingsEndpoint
} from './consts.js';
import {countries} from "./countries.js";

let eventId = '';
let eventPlayers = {};
let eventData = {};

let googleSheetID = '1_gnOmf1Qy1TySV5Im-Va7IHoWDDLRrg6MFdI75fZda4';
let submissionsSheetName = 'Submissions';
let eventsSheetName = 'Events & Tags';
let podiumSheetName = 'Podium Data';

document.getElementById('sheetIdInput').value = googleSheetID;
document.getElementById('submissionsSheetName').value = submissionsSheetName;
document.getElementById('eventsSheetName').value = eventsSheetName;
document.getElementById('podiumSheetName').value = podiumSheetName;


async function fetchBCPData(path) {
    const bcpAccessToken = document.getElementById("token").value;
    const authorizationHeader = bcpAccessToken.startsWith('Bearer') ? bcpAccessToken : `Bearer ${bcpAccessToken}`;

    const url = bcpBaseUrl + path

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': authorizationHeader,
            'Client-Id': 'web-app'
        }
    });

    return response.json();
}

async function fetchBCPDeckList(deckListId) {
    return await fetchBCPData(bcpDecklistBaseUrl + deckListId)
}

function parseDecks(deckUrl) {
    const cards = deckUrl.split('?deck=')[1].split(',');
    const decks = [];

    for (const card of cards) {
        if (decks.length === 2) {
            return decks;
        }

        if (card === "0") {
            continue;
        }

        const deck = card.substring(0, 2);

        if (!decks.includes(deck)) {
            decks.push(deck);
        }
    }

    return decks;
}

async function getDeckData(decklistId) {

    const emptyDeckList = {deck1: "-", deck2: "-" }

    const bcpDecklist = await fetchBCPDeckList(decklistId)

    const decklistText = bcpDecklist["armyListText"]

    if (decklistText === undefined) {
        return emptyDeckList
    }

    if (decklistText.includes("underworldsdb.com")) {
        const urlMatch = decklistText.match(/https?:\/\/[^\s]+/);
        const deckUrl = urlMatch ? urlMatch[0] : '';

        const decks = parseDecks(decklistText)

        if (decks.length === 2) {
            return { deck1: deckMap[decks[0]], deck2: deckMap[decks[1]] }
        } else if (decks.length === 1) {
            return { deck1: deckMap[decks[0]], deck2: 'Rivals' }
        } else {
            return emptyDeckList
        }
    }

    // Try to get the decks from the text itself
    const decks = []
    for (const [key, value] of Object.entries(deckMap)) {
        if (decklistText.includes(value)) {
            decks.push(value)
        }
    }

    if (decks.length !== 2) {
        // FIXME - maybe this should return just one deck if it found one?
        return emptyDeckList
    }

    return { deck1: decks[0], deck2: decks[1] }
}

async function getTournamentData(tournamentId) {
    return await fetchBCPData(bcpPairingsEndpoint + tournamentId)
}

async function getTournamentPlayers(tournamentId) {
    return await fetchBCPData(bcpPlacingsEndpoint.replace('§eventId§', tournamentId))
}

async function getTournamentPlayersFromRoster(tournamentId) {
    return await fetchBCPData(bcpPlayersEndpoint + tournamentId);
}

async function getPlayersData(tournamentId) {
    const playersFromPlacings = await getTournamentPlayers(tournamentId);

    let players = playersFromPlacings.active;

    if (!players || players.length === 0) {
       const playersFromRoster = await getTournamentPlayersFromRoster(tournamentId);
       players = playersFromRoster.data;
    }

    const processedPlayers = {};

    for (const player of players) {
        processedPlayers[player.id] = {
            id: player.id,
            name: `${player.user.firstName} ${player.user.lastName}`,
            faction: bcpFactionMap[player.faction.name], // TODO handle missing faction?
            listUrl: player.listUrl,
            decks: await getDeckData(player.listId),
            placing: player.placing || 0
        };
    }

    return processedPlayers;
}

async function getEventData(tournamentId) {
    return await fetchBCPData(bcpTournamentDetailsEndpoint.replace('§eventId§', tournamentId))
}

function printPlayersTable(players) {
    const table = document.getElementById('playersTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    const sortedPlayerIds = Object.keys(players).sort((a, b) => {
        const placingA = players[a].placing;
        const placingB = players[b].placing;
        return placingA - placingB;
    });

    for (const playerId of sortedPlayerIds) {
        const player = players[playerId];
        const row = tbody.insertRow();
        row.setAttribute('data-player-id', playerId);

        // Highlight row if missing data
        if (!player.faction || !player.listUrl || player.decks.deck1 === '-') {
            row.classList.add('attention-row');
        }

        // Check if this row is in edit mode
        if (player.editMode) {
            // Placing
            const placingCell = row.insertCell(0);
            const placingInput = document.createElement('input');
            placingInput.value = player.placing;
            placingInput.type = 'text';
            placingInput.classList.add('placings-input');
            placingCell.appendChild(placingInput);

            // Name cell (not editable)
            const nameCell = row.insertCell(1);
            nameCell.textContent = player.name;

            // Faction dropdown
            const factionCell = row.insertCell(2);
            const factionSelect = document.createElement('select');
            for (const key in bcpFactionMap) {
                const option = document.createElement('option');
                option.value = bcpFactionMap[key];
                option.textContent = bcpFactionMap[key];
                if (player.faction === bcpFactionMap[key]) option.selected = true;
                factionSelect.appendChild(option);
            }
            factionCell.appendChild(factionSelect);

            // Decklist cell (not editable)
            const deckCell = row.insertCell(3);
            if (player.listUrl) {
                const anchor = document.createElement('a');
                anchor.href = bcpFrontBase + player.listUrl;
                anchor.target = '_blank';
                anchor.textContent = 'Decklist';
                deckCell.appendChild(anchor);
            } else {
                deckCell.textContent = '--decklist missing--';
            }

            // Decks dropdowns
            const decksCell = row.insertCell(4);
            const deck1Select = document.createElement('select');
            const deck2Select = document.createElement('select');

            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = 'Unknown';
            emptyOption.textContent = '-';
            deck1Select.appendChild(emptyOption);
            deck2Select.appendChild(emptyOption);

            for (const key in deckMap) {
                const deckName = deckMap[key];
                const option1 = document.createElement('option');
                option1.value = deckName;
                option1.textContent = deckName;
                if (player.decks.deck1 === key) option1.selected = true;
                deck1Select.appendChild(option1);
                const option2 = document.createElement('option');
                option2.value = deckName;
                option2.textContent = deckName;
                if (player.decks.deck2 === key) option2.selected = true;
                deck2Select.appendChild(option2);
            }

            // Add Rivals to the second dropdown
            const rivalsOption = document.createElement('option');
            rivalsOption.value = 'Rivals';
            rivalsOption.textContent = 'Rivals';
            deck2Select.appendChild(rivalsOption);

            decksCell.appendChild(deck1Select);
            decksCell.appendChild(document.createTextNode(' + '));
            decksCell.appendChild(deck2Select);

            // Save button
            const saveCell = row.insertCell(5);
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '💾'; // floppy icon
            saveBtn.title = 'Save';
            saveBtn.onclick = function() {
                player.faction = factionSelect.value;
                player.decks.deck1 = deck1Select.value;
                player.decks.deck2 = deck2Select.value;
                player.placing = placingInput.value;
                delete player.editMode;
                eventPlayers[playerId] = player;
                updatePlayersDataCache(eventId, eventPlayers);
                printPlayersTable(eventPlayers);
            };
            saveCell.appendChild(saveBtn);
        } else {
            // Normal display mode

            const placingCell = row.insertCell(0);
            placingCell.textContent = player.placing;

            const nameCell = row.insertCell(1);
            nameCell.textContent = player.name;

            const factionCell = row.insertCell(2);
            factionCell.textContent = player.faction;

            const deckCell = row.insertCell(3);
            if (player.listUrl) {
                const anchor = document.createElement('a');
                anchor.href = bcpFrontBase + player.listUrl;
                anchor.target = '_blank';
                anchor.textContent = 'Decklist';
                deckCell.appendChild(anchor);
            } else {
                deckCell.textContent = '--decklist missing--';
            }

            const decksCell = row.insertCell(4);
            if (player.decks[0] !== '-') {
                decksCell.textContent = `${player.decks.deck1} + ${player.decks.deck2}`;
            } else {
                decksCell.textContent = '-';
            }

            // Edit button
            const editCell = row.insertCell(5);
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️'; // pencil icon
            editBtn.title = 'Edit';
            editBtn.onclick = function() {
                player.editMode = true;
                eventPlayers[playerId] = player;
                printPlayersTable(eventPlayers);
            };
            editCell.appendChild(editBtn);
        }
    }
}

function clearPlayersTable() {
    const table = document.getElementById('playersTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
}

function clearEventDetailsForm() {
    document.getElementById('eventData').style.display = 'hidden';

    document.getElementById("eventName").value = '';
    document.getElementById("eventCountry").value = '';
    document.getElementById("eventDate").value = '';
    document.getElementById('playersNo').value = '';
    document.getElementById('countryCode').value = '';
    document.getElementById('tag').value = '';
}

function printEventDetails(eventData) {
    document.getElementById('eventData').style.display = 'block';

    document.getElementById("eventName").value = eventData['name'];
    document.getElementById("eventCountry").value = eventData['country'];
    const potentialCountryCode = countries[eventData['country']];
    if (potentialCountryCode !== undefined) {
        document.getElementById('countryCode').value = potentialCountryCode;
    }
    document.getElementById("eventDate").value = eventData['eventDate'].substring(0, 10);
    document.getElementById('playersNo').value = eventData['queryNumPlayers'];

    document.getElementById('tag').value = '';
}

function processSingleGameResult(gameResult) {
    // Process only pairings where both userIDs are present. When one of the user ID's is missing, then it was a bye, and we skip that.
    if (gameResult['metaData'] && gameResult['player2']['userId'] && gameResult['player1']['userId']) {
        const player1Data = eventPlayers[gameResult['player1']['id']]
        const player2Data = eventPlayers[gameResult['player2']['id']]

        // Skip result if there are no deck data for a player
        if (player1Data.decks.deck1 !== '-' && player2Data.decks.deck1 !== '-') {
            return {
                player1Faction: player1Data.faction,
                player1Deck1: player1Data.decks.deck1,
                player1Deck2: player1Data.decks.deck2,
                gamesWon: gameResult['metaData']['in-p1-numberOfWins'] || 0,
                gamesLost: gameResult['metaData']['in-p2-numberOfWins'] || 0,
                player2Faction: player2Data.faction,
                player2Deck1: player2Data.decks.deck1,
                player2Deck2: player2Data.decks.deck2
            }
        }
    } else {
        // console.log('Missing data for this match: ' + JSON.stringify(gameResult))
    }
}

async function processData() {
    clearPlayersTable();
    clearEventDetailsForm();

    const url = document.getElementById('tournament').value;

    try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/');
        eventId = pathSegments.pop() || pathSegments.pop(); // handle potential trailing slash
    } catch (e) {
        eventId = url;
    }

    const importSource = document.querySelector('input[name="importSource"]:checked').value;
    const accessToken = document.getElementById("token").value;

    console.log(`Start processing for tournament ID ${eventId} from ${importSource}`);

    const eventDataFromCache = getEventDataFromCache(eventId);

    if (eventDataFromCache !== null) {
        eventData = eventDataFromCache;
        showClearCacheButton();
    } else {
        if (importSource === 'bcp') {
            eventData = await getEventData(eventId);
        } else {
            // TODO — implement other sources
        }
    }

    printEventDetails(eventData);

    const eventPlayersFromCache = getPlayersDataFromCache(eventId);

    if (eventPlayersFromCache !== null) {
        eventPlayers = eventPlayersFromCache;
        showInvalidateButton();
    } else {
        if (importSource === 'bcp') {
            eventPlayers = await getPlayersData(eventId);
            updatePlayersDataCache(eventId, eventPlayers);
        } else if (importSource === 'shadeglass') {
            eventPlayers = await shadeglass.getPlayersData(eventId, accessToken);
        }
    }


    printPlayersTable(eventPlayers);

    document.getElementById('continueProcessing').style.display = 'block';
}

async function continueProcessing() {
    const data = await getTournamentData(eventId)
    const results = []

    for (const singleGameData of data['data']) {
        const processed = processSingleGameResult(singleGameData)
        if (processed) {
            results.push(processed)
        }
    }

    if (!googleSheetID) {
        alert('Please provide a Google Sheet ID.');
        return;
    }

    await fillGoogleDocsData(results);
}

function updateCache(eventId, eventData, cacheKey) {

    const rawData = window.localStorage.getItem(cacheKey) || "{}";
    const dataCache = JSON.parse(rawData);

    dataCache[eventId] = eventData;
    window.localStorage.setItem(cacheKey, JSON.stringify(dataCache, null, 2));
}

function updatePlayersDataCache(eventId, data) {
    updateCache(eventId, data, 'eventsPairings');
}

function updateEventDataCache(eventId, data) {
    updateCache(eventId, data, 'eventsData');
}

async function invalidateCacheForCurrentEvent() {
    eventPlayers = await getPlayersData(eventId);
    updatePlayersDataCache(eventId, eventPlayers);
    printPlayersTable(eventPlayers);
}

function readCache(eventId, cacheKey) {
    const rawData = window.localStorage.getItem(cacheKey) || "{}";
    const dataCache = JSON.parse(rawData);

    return dataCache[eventId] || null;
}

function getEventDataFromCache(eventId) {
    return readCache(eventId, 'eventsData');
}

function getPlayersDataFromCache(eventId) {
    return readCache(eventId, 'eventsPairings');
}

function showInvalidateButton() {
    document.getElementById('invalidateCache').style.display = 'block';
}

function showClearCacheButton() {
    document.getElementById('clearCache').style.display = 'block';
}

function clearCache() {
    window.localStorage.clear();
}

// Utility to show loader and disable button during async action
function withLoader(button, asyncFn) {
    return async function(...args) {
        button.disabled = true;
        const loader = button.parentNode.querySelector('.loader');
        loader.style.display = 'inline-block';

        let frame = 0;
        const frames = ['.', '..', '...', ''];
        let interval = setInterval(() => {
            loader.textContent = frames[frame];
            frame = (frame + 1) % frames.length;
        }, 400);
        try {
            await asyncFn.apply(this, args);
        } finally {
            button.disabled = false;
            clearInterval(interval);
            loader.style.display = 'none';
        }
    };
}

// Google Sheets API integration setup
let GOOGLE_CLIENT_ID = document.getElementById('googleClientId').value;
let GOOGLE_API_KEY = document.getElementById('googleApiKey').value;
const GOOGLE_DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4'
];
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
let googleAccessToken = null;
let tokenClient = null;

// Load GIS and gapi client libraries
function loadGoogleApis() {
    return new Promise((resolve, reject) => {
        let loaded = 0;
        function checkDone() { loaded++; if (loaded === 2) resolve(); }
        // Load gapi client
        if (window.gapi) {
            window.gapi.load('client', checkDone);
        } else {
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => window.gapi.load('client', checkDone);
            gapiScript.onerror = reject;
            document.head.appendChild(gapiScript);
        }
        // Load GIS
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            checkDone();
        } else {
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.onload = checkDone;
            gisScript.onerror = reject;
            document.head.appendChild(gisScript);
        }
    });
}

async function initGoogleClients() {
    await loadGoogleApis();
    await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: GOOGLE_DISCOVERY_DOCS,
    });
    if (!tokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            callback: (tokenResponse) => {
                googleAccessToken = tokenResponse.access_token;
            },
        });
    }
}

async function handleGoogleAuth() {
    await initGoogleClients();
    return new Promise((resolve, reject) => {
        tokenClient.callback = (tokenResponse) => {
            if (tokenResponse.error) {
                alert('Google Auth failed: ' + tokenResponse.error);
                reject(tokenResponse.error);
            } else {
                googleAccessToken = tokenResponse.access_token;
                window.gapi.client.setToken({ access_token: googleAccessToken });
                alert('Google Sheets connected!');
                resolve();
            }
        };
        tokenClient.requestAccessToken();
    });
}

async function writeResultsToGoogleSheet(sheetId, results) {
    await initGoogleClients();
    if (!googleAccessToken) {
        await handleGoogleAuth();
    } else {
        window.gapi.client.setToken({ access_token: googleAccessToken });
    }
    // Prepare data for Sheets API
    const values = results.map(result => [
        result['player1Faction'],
        result['player1Deck1'],
        result['player1Deck2'],
        result['gamesWon'],
        result['gamesLost'],
        0,
        result['player2Faction'],
        result['player2Deck1'],
        result['player2Deck2']
    ]);
    const body = {
        values: values
    };
    try {
        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Arkusz1', // TODO: make sheet name configurable
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: body
        });
        alert('Results written to Google Sheet!');
    } catch (err) {
        alert('Failed to write to Google Sheet: ' + err.message);
    }
}

function updateSheetId(event) {
    // TODO — maybe use localstorage?
    googleSheetID = event.target.value;
}

function updateSubmissionSheetName(event) {
    // TODO — maybe use localstorage?
    submissionsSheetName = event.target.value;
}

function updateEventsSheetName(event) {
    // TODO — maybe use localstorage?
    eventsSheetName = event.target.value;
}

function updatePodiumSheetName(event) {
    // TODO — maybe use localstorage?
    podiumSheetName = event.target.value;
}

function updateGoogleApiKey(event) {
    // TODO — maybe use localstorage?
    GOOGLE_API_KEY = event.target.value;
}

function updateGoogleClientId(event) {
    // TODO — maybe use localstorage?
    GOOGLE_CLIENT_ID = event.target.value;
}

function proposeTag() {
    // Get checkbox state
    const isQualifier = document.getElementById('qualifier')?.checked;
    // Get event date value
    const eventDate = document.getElementById('eventDate')?.value;
    // Get country code value
    const countryCode = document.getElementById('countryCode')?.value;
    // Get event name value
    const eventName = document.getElementById('eventName')?.value;

    // Prefix
    const prefix = isQualifier ? 'TW%-' : 'T%-';

    // Date formatting
    let datePart = '';
    if (eventDate) {
        const dateObj = new Date(eventDate);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // JS months are 0-based
        const yearStr = String(year).slice(-2);
        const monthStr = month < 10 ? '0' + month : String(month);
        datePart = `${yearStr}-${monthStr}`;
    }

    // Country code
    const countryPart = countryCode || '';

    // Event name initials
    let initials = '';
    if (eventName) {
        initials = eventName.split(/\s+/).map(word => {
            if (/^\d+$/.test(word)) {
                return word;
            }

            return word[0].toUpperCase();
        }).join('');
    }

    document.getElementById('tag').value = `${prefix}${datePart}-${countryPart}-${initials}`;
}

async function fillGoogleDocsData(results) {
    await initGoogleClients();
    if (!googleAccessToken) {
        await handleGoogleAuth();
    } else {
        window.gapi.client.setToken({ access_token: googleAccessToken });
    }

    const eventDate = document.getElementById('eventDate')?.value
    const tag = document.getElementById('tag').value;

    // 1. Append game result data in the Submission sheet, starting from column C
    const values = results.map(result => [
        Date.now(),
        eventDate,
        result['player1Faction'],
        result['player1Deck1'],
        result['player1Deck2'],
        result['gamesWon'],
        result['gamesLost'],
        0,
        result['player2Faction'],
        result['player2Deck1'],
        result['player2Deck2'],
        tag
    ]);
    const body = {
        values: values
    };
    try {
        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: googleSheetID,
            range: submissionsSheetName,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: body
        });
    } catch (err) {
        console.log('Error writing games results to Google Sheets', err)
    }

    // 2. Append the event to the events sheet (date of the tournament, tag, name, no of players, qualifier, link, country code)

    const eventName = document.getElementById('eventName')?.value;
    const playersNo = document.getElementById('playersNo')?.value;
    const isQualifier = document.getElementById('qualifier')?.checked;
    const tournamentLink = document.getElementById('tournament').value;
    const countryCode = document.getElementById('countryCode')?.value;

    const eventDataBody = {
        values: [[
            eventDate,
            tag,
            eventName,
            playersNo,
            isQualifier ? 'Yes' : 'No',
            tournamentLink,
            countryCode
        ]]
    };

    try {
        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: googleSheetID,
            range: eventsSheetName,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: eventDataBody
        });
    } catch (err) {
        console.log('Error writing event data to Google Sheets', err)
    }

    // 3. Append data for podium (date of the tournament, warband, deck, deck, 1st, 2nd, 3rd, players, event tag)

    const podiumData = {};
    let podiumPlayersFound = 0;
    for (const playerId in eventPlayers) {
        const player = eventPlayers[playerId];

        console.log(`Checking ${playerId} for podium...`);

        if (player.placing === 1) {
            podiumData['1'] = player;
            podiumPlayersFound++;
        } else if (player.placing === 2) {
            podiumData['2'] = player;
            podiumPlayersFound++;
        } else if (player.placing === 3) {
            podiumData['3'] = player;
            podiumPlayersFound++;
        }

        if (podiumPlayersFound === 3) {
            console.log('Found all podium players');
            break;
        }
    }

    const podiumBody = {
        values: [
            [eventDate, podiumData['1'].faction, podiumData['1'].decks.deck1, podiumData['1'].decks.deck2, 1, 0, 0, playersNo, tag],
            [eventDate, podiumData['2'].faction, podiumData['2'].decks.deck1, podiumData['2'].decks.deck2, 0, 1, 0, playersNo, tag],
            [eventDate, podiumData['3'].faction, podiumData['3'].decks.deck1, podiumData['3'].decks.deck2, 0, 0, 1, playersNo, tag],
        ]
    };

    try {
        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: googleSheetID,
            range: podiumSheetName,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: podiumBody
        });
    } catch (err) {
        console.log('Error writing podium data to Google Sheets', err)
    }

    console.log('Finished writing data to Google Sheets');
    alert('Finished writing data to Google Sheets');
}


window.withLoader = withLoader;
window.processData = processData;
window.continueProcessing = continueProcessing;
window.invalidateCacheForCurrentEvent = invalidateCacheForCurrentEvent;
window.handleGoogleAuth = handleGoogleAuth;
window.updateSheetId = updateSheetId;
window.updateSubmissionSheetName = updateSubmissionSheetName;
window.updateEventsSheetName = updateEventsSheetName;
window.updatePodiumSheetName = updatePodiumSheetName;
window.clearCache = clearCache;
window.proposeTag = proposeTag;
window.updateGoogleApiKey = updateGoogleApiKey;
window.updateGoogleClientId = updateGoogleClientId;

/*
TODO:
- ~~get the event details like date and display before getting game results~~
- ~~get the tournament results for podium? Display podium players~~
- ~~propose a tag for the event and allow for editing (add a checkbox whether event was a WCW qualifier) T%-YY-MM-CC-NAME~~
- try to figure out the ISO code (make a list of all ISO codes, a map of English country name —> ISO code, a map of original language country name —> ISO code) then search the entry on those lists
- address todos from the code
- add a scrollable log div, where logs are written instead of the console
- integrate with shadeglass
- integrate with other? (championshub, other)
- ideally, don't cache names of players. Add a button that can download names if needed.
 */
