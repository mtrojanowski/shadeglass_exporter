let eventId = '';
let eventPlayers = {};

async function fetchBCPData(path) {
    const bcpAccessToken = document.getElementById("token").value;

    const url = bcpBaseUrl + path

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bcpAccessToken}`,
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
    return await fetchBCPData(bcpPlayersEndpoint + tournamentId)
}

async function getPlayersData(tournamentId) {
    const players = await getTournamentPlayers(tournamentId);

    const processedPlayers = {};

    for (const player of players.data) {
        processedPlayers[player.id] = {
            id: player.id,
            name: `${player.user.firstName} ${player.user.lastName}`,
            faction: bcpFactionMap[player.faction.name], // TODO handle missing faction?
            listUrl: player.listUrl,
            decks: await getDeckData(player.listId)
        };
    }

    return processedPlayers;
}

function printPlayersTable(players) {
    const table = document.getElementById('playersTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    for (const playerId in players) {
        const player = players[playerId];
        const row = tbody.insertRow();
        row.setAttribute('data-player-id', playerId);

        // Highlight row if missing data
        if (!player.faction || !player.listUrl || player.decks.deck1 === '-') {
            row.classList.add('attention-row');
        }

        // Check if this row is in edit mode
        if (player.editMode) {
            // Name cell (not editable)
            const nameCell = row.insertCell(0);
            nameCell.textContent = player.name;

            // Faction dropdown
            const factionCell = row.insertCell(1);
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
            const deckCell = row.insertCell(2);
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
            const decksCell = row.insertCell(3);
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
            const saveCell = row.insertCell(4);
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '💾'; // floppy icon
            saveBtn.title = 'Save';
            saveBtn.onclick = function() {
                player.faction = factionSelect.value;
                player.decks.deck1 = deck1Select.value;
                player.decks.deck2 = deck2Select.value;
                delete player.editMode;
                eventPlayers[playerId] = player;
                updateCache(eventId, eventPlayers);
                printPlayersTable(eventPlayers);
            };
            saveCell.appendChild(saveBtn);
        } else {
            // Normal display mode
            const nameCell = row.insertCell(0);
            nameCell.textContent = player.name;

            const factionCell = row.insertCell(1);
            factionCell.textContent = player.faction;

            const deckCell = row.insertCell(2);
            if (player.listUrl) {
                const anchor = document.createElement('a');
                anchor.href = bcpFrontBase + player.listUrl;
                anchor.target = '_blank';
                anchor.textContent = 'Decklist';
                deckCell.appendChild(anchor);
            } else {
                deckCell.textContent = '--decklist missing--';
            }

            const decksCell = row.insertCell(3);
            if (player.decks[0] !== '-') {
                decksCell.textContent = `${player.decks.deck1} + ${player.decks.deck2}`;
            } else {
                decksCell.textContent = '-';
            }

            // Edit button
            const editCell = row.insertCell(4);
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

    const url = document.getElementById('tournament').value;

    try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/');
        eventId = pathSegments.pop() || pathSegments.pop(); // handle potential trailing slash
    } catch (e) {
        eventId = url;
    }

    console.log(`Start processing for tournament ID ${eventId}`);

    const eventPlayersFromCache = readCache(eventId);

    if (eventPlayersFromCache !== null) {
        eventPlayers = eventPlayersFromCache;
        showInvalidateButton();
    } else {
        eventPlayers = await getPlayersData(tournamentId);
        updateCache(eventId, eventPlayers);
    }

    printPlayersTable(eventPlayers);

    document.getElementById('result').value = '';
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

    const separator = ','

    const textareaResult = document.getElementById('result');
    textareaResult.value = '';

    for (const result of results) {
        textareaResult.value += `${result['player1Faction']}${separator}${result['player1Deck1']}${separator}${result['player1Deck2']}${separator}${result['gamesWon']}${separator}${result['gamesLost']}${separator}0${separator}${result['player2Faction']}${separator}${result['player2Deck1']}${separator}${result['player2Deck2']}\n`;
    }
}

function updateCache(eventId, eventData) {

    const rawData = window.localStorage.getItem('eventsCache') || "{}";
    const dataCache = JSON.parse(rawData);

    dataCache[eventId] = eventData;
    window.localStorage.setItem('eventsCache', JSON.stringify(dataCache, null, 2));
}

async function invalidateCacheForCurrentEvent() {
    eventPlayers = await getPlayersData(eventId);
    updateCache(eventId, eventPlayers);
    printPlayersTable(eventPlayers);
}

function readCache(eventId) {

    const rawData = window.localStorage.getItem('eventsCache') || "{}";
    const dataCache = JSON.parse(rawData);

    return dataCache[eventId] || null;
}

function showInvalidateButton() {
    document.getElementById('invalidateCache').style.display = 'block';
}

/*
TODO:
- make the page prettier
- integrate with shadeglass
- integrate with other? (championshub, other)
 */
