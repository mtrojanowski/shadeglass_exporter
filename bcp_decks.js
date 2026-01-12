/**
 * First, set the eventId to the event you want to export, and set an active token.
 * Next, run the script. The output will show players with missing decklists.
 * Fill parsedDecklists with data missing from BCP, then run the script again.
 */

const eventId = 'gkhlKgbsQ43z'
// const token = 'Bearer eyJraWQiOiJqWDJMamZlWFRIakZhMkVXQW5DZVZFSERIdUFQR29QMUJqUFA1dHZQSlJzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNGY4NjQ0OC1jMDkxLTcwNWQtMTI1ZS1mZjFmOGE3NjgwZjEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV95cHY1bTgyd3ciLCJjbGllbnRfaWQiOiI1MDgzaWloMG5pdHBuNWVubDAyZmtwcjliYyIsIm9yaWdpbl9qdGkiOiIzMTU1MDc5MC0wNjRmLTQ1ZWUtOTRkNC03MDllYzNlOGRlNWEiLCJldmVudF9pZCI6ImU0OWY5MzFlLWU5MTYtNDhiNC1hZGQ4LTE0ZWFkMTBhYzM1MCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3NDgyNTY2MTIsImV4cCI6MTc0OTI0ODYxMywiaWF0IjoxNzQ5MjQ1MDEzLCJqdGkiOiIxZTQ1YjAyMi0xNTgwLTRhMTYtODExNi0wMGQ2MjRhZTZhM2UiLCJ1c2VybmFtZSI6ImU0Zjg2NDQ4LWMwOTEtNzA1ZC0xMjVlLWZmMWY4YTc2ODBmMSJ9.ERgGyTHkEfrBV067BNRXiCfJ-eSt6yJzwfdxoDqpqH3Rgh2Nq8fcjnWqoYX9crHXK3KsFOiDkFCr9qmdc82mLF_OwsrbfIWDAX0kVrTx6KASqEOrx6tiWo09Mq-i1NYy88jmXynvwE4KKHSrYOB3fDjFhzO1QPalPuDJ1RjpvB3svL7mRd7EQ2bLom2f9qfyQGC_-oEvlVydpJ3bjLUca5KGhwXZjDWmX0EKrOb0Ph-wB26AmwGGr6q-JozmWrMBfUI_kf-6dIsOYqyK4S_O_nTGmrnAmvaycz_RA44j7kfFTJS24hlUILPgwZ05Ow5S3HW5diy_xpzWGr-k-oaedg'
const token = 'Bearer eyJraWQiOiJqWDJMamZlWFRIakZhMkVXQW5DZVZFSERIdUFQR29QMUJqUFA1dHZQSlJzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiNDM4YTQzOC02MGMxLTcwYzctNWVkOC0xNGNlOWE3NmUyZTciLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfeXB2NW04Mnd3X0dhbWVzV29ya3Nob3AiXSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfeXB2NW04Mnd3IiwidmVyc2lvbiI6MiwiY2xpZW50X2lkIjoiNTA4M2lpaDBuaXRwbjVlbmwwMmZrcHI5YmMiLCJvcmlnaW5fanRpIjoiYTA4YzE4ZDAtMzlhYy00YzVmLWJkYzktYjRmYjY0YWNlMzUxIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF1dGhfdGltZSI6MTc0NzQ3NTEwNCwiZXhwIjoxNzQ5MjQ4MDEwLCJpYXQiOjE3NDkyNDQ0MTAsImp0aSI6IjBkYWVjMDRkLTA0ODAtNGM3OC1iZWNjLTk1ZTJkMzk0YTc1MiIsInVzZXJuYW1lIjoiR2FtZXNXb3Jrc2hvcF9hdXRoMHw1ZjIwOTUyZmM1OTJhMTAwM2JjNjEwYjcifQ.N-f0CPi-Lu0bh5-QKF7i3UUkAIzwY5DGfOVwpc7G_vgYwVH5xI2yuDrFZlqKhVhPR6oweDTsIUgb8D5J9BAgD1FNOmm2AFgSMW6LSvAJ5gtyyPu8qeZFLIDdC2mPDhF5rXRIiBJSpYCepeh4S4qwSMuiGBNDydslAXb9f6X2vOY4uLkbcZ-VACF1YmaKmiOremjfpAYR-qHalKwNs4OGQ4sL8cYcg-zx1rZXGosyigGX3enRkwujPKk19knqSlnCJF3yogyFtkPojEPVJ8-y5LU0LWhhTbiirmjXseM8T82ISlVcBfhskbZD2Ndqk-UCdD0UCEpSy39hzIMjrpdaAg'

/**
 * "<userId>": { "deck1": "", "deck2": "" }
 */
const parsedDecklists = {

}



const bcpBaseUrl = 'https://newprod-api.bestcoastpairings.com/v1/pairings?limit=500&eventId='
const bcpResultsQuery = '&pairingType=Pairing&expand%5B%5D=player1&expand%5B%5D=player2&expand%5B%5D=player1Game&expand%5B%5D=player2Game'
const bcpDecklistBaseUrl = 'https://newprod-api.bestcoastpairings.com/v1/armylists/'
const bcpPlayersBaseUrl = 'https://newprod-api.bestcoastpairings.com/v1/players?limit=100&eventId='
const bcpPlayersQuery = '&expand[]=army&expand[]=subFaction&expand[]=character&expand[]=team&expand[]=user'

const deckMap = {
    'CC': 'Countdown to Cataclysm',
    'PL': 'Pillage and Plunder',
    'BL': 'Blazing Assault',
    'ES': 'Emberstone Sentinels',
    'WR': 'Wrack and Ruin',
    'EK': 'Edge of the Knife',
    'RF': 'Reckless Fury',
}

// 'Countdown to Cataclysm', 'Pillage and Plunder', 'Blazing Assault', 'Emberstone Sentinels', 'Wrack and Ruin',  'Edge of the Knife', 'Reckless Fury'

const bcpFactionMap = {
    "Steelheart's Champions": 'Steelheart’s Champions',
    "Garrek's Reavers": 'Garrek’s Reavers',
    "Ironskulls Boyz": "Ironskull's Boyz",
    'The Sepulchral Guard': 'Sepulchral Guard',
    'The Chosen Axes': 'Chosen Axes',
    "Spiteclaw's Swarm": "Spiteclaw's Swarm",
    "Magore’s Fiends": "Magore's Fiends",
    "The Farstriders": 'Farstriders',
    "Stormsire's Cursebreakers": 'Stormsire’s Cursebreakers',
    "Thorns of the Briar Queen": 'Thorns of the Briar Queen',
    "Zarbag’s Gitz": "Zarbag's Gitz",
    "Eyes of the Nine": 'Eyes of the Nine',
    "The Eyes of the Nine": 'Eyes of the Nine',
    "Godsworn's Hunt": 'Godsworn Hunt',
    "The Godsworn Hunt": 'Godsworn Hunt',
    "Mollog's Mob": "Mollog's Mob",
    "Ylthari’s Guardians": 'Ylthari’s Guardians',
    "Thundrik’s Profiteers": "Thundrik's Profiteers",
    "Grashrak’s Despoilers": 'Grashrak’s Despoilers',
    "Skaeth’s Wild Hunt": 'Skaeth’s Wild Hunt',
    "Ironsoul’s Condemnors": "Ironsoul's Condemners",
    "Lady Harrow’s Mournflight": "Lady Harrow's Mournflight",
    "The Grymwatch": 'Grymwatch',
    "Rippa's Snarlfangs": 'Rippa’s Snarlfangs',
    "Hrothgorn's Mantrappers": "Hrothgorn's Mantrappers",
    "The Wurmspat": 'Wurmspat',
    "Morgok’s Krushas": "Morgok's Krushas",
    "Morgwaeth’s Blade-coven": 'Morgwaeth’s Blade coven',
    "Myari's Purifiers": 'Myari’s Purifiers ',
    "The Dread Pageant": 'Dread Pageant',
    "Khagra's Ravagers": "Khagra's Ravagers",
    "Starblood Stalkers": 'Starblood Stalkers',
    "The Starblood Stalkers": 'Starblood Stalkers',
    "The Crimson Court": 'Crimson Court',
    "Storm of Celestus": 'Storm of Celestus',
    "The Storm of Celestus": 'Storm of Celestus',
    'Drepur’s Wraithcreepers': "Drepur's Wraithcreepers",
    "Hedrakka’s MadMob": "Hedkrakka's Madmob",
    "Kainan’s Reapers": "Kainan's Reapers",
    "Elathain’s Soulraid": "Elathain's Soulraid",
    "Xandire's Truthseekers": "Xandire's Truthseekers",
    "Da Kunnin Krew": "Da Kunnin' Krew",
    "Blackpowder's Buccaneers": "Blackpowder's Buccaneers",
    "The Exiled Dead": 'Exiled Dead',
    "The Shadeborn": 'Shadeborn',
    "Skittershanks's Clawpack": "Skittershank's Clawpack",
    "Skittershank's Clawpack": "Skittershank's Clawpack",
    "Hexbane's Hunters": "Hexbane's Hunters",
    "Gorechosen of Dromm": 'Gorechosen of Dromm',
    "The Gnarlspirit Pack": 'Gnarlspirit Pack',
    "The Sons of Velmorn": 'Sons of Velmorn',
    "Grinkrak's Looncourt": "Grinkrak's Looncourt",
    "Gryselle's Arenai": "Gryselle's Arenai",
    "Domitan's Stormcoven": "Domitan's Stormcoven",
    "Ephilim's Pandaemonium": "Ephilim's Pandaemonium",
    "The Headsmen's Curse": "Headsmen's Curse",
    "Skabbik's Plaguepack": "Skabbik's Plaguepack",
    "The Thricefold Discord": 'Thricefold Discord',
    "Cyreni's Razors": "Cyreni's Razors",
    "Daggok's Stab-Ladz": "Daggok's Stab-ladz",
    "Zondara's Gravebreakers": "Zondara's Gravebreakers",
    'Brethren of the Bolt': 'Brethren of the Bolt',
    'Skinnerkin': 'Skinnerkin',
    "The Emberwatch": 'Emberwatch',
    "Zikkit's Tunnelpack": "Zikkit's Tunnelpack",
    "Grandfather's Gardeners": "Grandfather's Gardeners",
    "Jaws of Itzl": 'Jaws of Itzl',
    "Borgit's Beastgrabbaz": "Borgit's Beastgrabbaz"
}


let bcpAPICallCount = 0;

async function callBCP(url) {

    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',
            'client-id': 'web-app'
        }
    }

    try {
        bcpAPICallCount++
        const response = await fetch(url, options)

        if (!response.ok) {
            console.log('Error: ', response.status)
            throw new Error('Error')
        }

        const data = await response.json()

        return data
    } catch (e) {
        console.log('Error: ', e)
    }

    return null
}

async function fetchPlayers() {
    // /v1/players?limit=100&eventId=IODxA0bCOxh6&expand[]=
    const url = bcpPlayersBaseUrl + eventId + bcpPlayersQuery
    return await callBCP(url)
}
async function fetchBCPData() {
    const url = bcpBaseUrl + eventId + bcpResultsQuery
    return await callBCP(url)
}

async function fetchBCPDeckList(deckListId) {
    const url = bcpDecklistBaseUrl + deckListId
    return await callBCP(url)
}

function parseDecks(deckUrl) {
    // from the deckUrl, which is a URL, get the `deck` query paramameter, then split the value by `,` and save it in a variable called cards
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

async function getDecks(playerId, decklistId) {
    const parsed = parsedDecklists[playerId]
    if (parsed) {
        return parsed
    }

    const emptyDeckList = {deck1: "-", deck2: "-"}

    if (decklistId === undefined) {
        console.log('No decklist ID for player ' + playerId);
        parsedDecklists[playerId] = emptyDeckList
        return emptyDeckList
    }

    const bcpDecklist = await fetchBCPDeckList(decklistId)

    const decklistText = bcpDecklist["armyListText"]

    if (decklistText === undefined) {
        console.log('No decklist text for player ' + playerId)
        console.log('Returned deck data for the player: ' + JSON.stringify(bcpDecklist))
        parsedDecklists[playerId] = emptyDeckList
        return emptyDeckList
    }


    if (decklistText.includes("underworldsdb.com")) {
        const decks = parseDecks(decklistText)
        const parsed = { deck1: deckMap[decks[0]], deck2: deckMap[decks[1]] }
        parsedDecklists[playerId] = parsed
        return parsed
    }

    console.log('Cannot find underworldsdb link in the player`s deck list data. Trying to find information from the text, for player: ' + playerId)

    // Try to get the decks from the text itself
    const decks = []
    for (const [key, value] of Object.entries(deckMap)) {
        if (decklistText.includes(value)) {
            decks.push(value)
        }
    }

    if (decks.length !== 2) {
        console.log(`Error: Could not find exactly two decks in the decklist text for player ${playerId}. Found: ${decks.length} decks. Text: ${decklistText}`);
        parsedDecklists[playerId] = emptyDeckList
        return emptyDeckList
    }

    console.log('Found decks in the text for player ' + playerId + '. The original returned deck data: ' + JSON.stringify(bcpDecklist));

    const parsedDeck = { deck1: decks[0], deck2: decks[1] }
    console.log(`Use the following entry if you want to add this player to the parsedDecklists: '${playerId}': ${JSON.stringify(parsedDeck)},`);

    parsedDecklists[playerId] = parsedDeck
    return parsedDeck
}


async function getDeckStats() {
    const players = await fetchPlayers()
    const decks = []

    console.log(`Processing ${players['data'].length} players`)
    for (const player of players['data']) {
        const playerDecks = await getDecks(player['userId'], player['listId'])
        decks.push(playerDecks['deck1'] + ',' +playerDecks['deck2'])
    }

    console.log('\nResult:\n')

    for (const deck in decks) {
        console.log(decks[deck])
    }
}

getDeckStats()
