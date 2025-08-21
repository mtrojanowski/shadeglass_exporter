/**
 * First, set the eventId to the event you want to export, and set an active token.
 * Next, run the script. The output will show players with missing decklists.
 * Fill parsedDecklists with data missing from BCP, then run the script again.
 */

const eventId = ''
const token = ''

/**
 * warband is optional, you can set it if there is no warband in BCP for the given player.
 * Use the warband name from the stats as the value.
 * If you do set the warband, also set the deck values, so avoid entries like this: "abcd": { warband: "Crimson Court" }
 *
 * Use the following format for entries:
 * "<userId>": { "deck1": "", "deck2": "", warband: "" }
 */
const parsedDecklists = {
}



const bcpBaseUrl = 'https://newprod-api.bestcoastpairings.com/v1/pairings?limit=500&eventId='
const bcpResultsQuery = '&pairingType=Pairing&expand%5B%5D=player1&expand%5B%5D=player2&expand%5B%5D=player1Game&expand%5B%5D=player2Game'
const bcpDecklistBaseUrl = 'https://newprod-api.bestcoastpairings.com/v1/armylists/'

const bcpPlacingsBaseUrl = 'https://newprod-api.bestcoastpairings.com/v1/events/'
const bcpPlacingsQuery = '/players?placings=true'

// These are the abbreviations used by underworldsdb in their deck sharing URL
const deckMap = {
    'CC': 'Countdown to Cataclysm',
    'PL': 'Pillage and Plunder',
    'BL': 'Blazing Assault',
    'ES': 'Emberstone Sentinels',
    'WR': 'Wrack and Ruin',
    'EK': 'Edge of the Knife',
    'RF': 'Reckless Fury',
    'RS': 'Realmstone Raiders',
    'RG': 'Raging Slayers'
}

const bcpFactionMap = {
    "Steelheart's Champions": "Steelheart's Champions",
    "Garrek's Reavers": "Garrek's Reavers",
    "Ironskulls Boyz": "Ironskull's Boyz",
    'The Sepulchral Guard': 'Sepulchral Guard',
    'The Chosen Axes': 'Chosen Axes',
    "Spiteclaw's Swarm": "Spiteclaw's Swarm",
    "Magore’s Fiends": "Magore's Fiends",
    "The Farstriders": 'Farstriders',
    "Stormsire's Cursebreakers": "Stormsire's Cursebreakers",
    "Thorns of the Briar Queen": 'Thorns of the Briar Queen',
    "Zarbag’s Gitz": "Zarbag's Gitz",
    "Eyes of the Nine": 'Eyes of the Nine',
    "The Eyes of the Nine": 'Eyes of the Nine',
    "Godsworn's Hunt": 'Godsworn Hunt',
    "The Godsworn Hunt": 'Godsworn Hunt',
    "Mollog's Mob": "Mollog's Mob",
    "Ylthari’s Guardians": "Ylthari's Guardians",
    "Thundrik’s Profiteers": "Thundrik's Profiteers",
    "Grashrak’s Despoilers": "Grashrak's Despoilers",
    "Skaeth’s Wild Hunt": "Skaeth's Wild Hunt",
    "Ironsoul’s Condemnors": "Ironsoul's Condemners",
    "Lady Harrow’s Mournflight": "Lady Harrow's Mournflight",
    "The Grymwatch": 'Grymwatch',
    "Rippa's Snarlfangs": "Rippa's Snarlfangs",
    "Hrothgorn's Mantrappers": "Hrothgorn's Mantrappers",
    "The Wurmspat": 'Wurmspat',
    "Morgok’s Krushas": "Morgok's Krushas",
    "Morgwaeth’s Blade-coven": "Morgwaeth's Blade coven",
    "Myari's Purifiers": "Myari's Purifiers",
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
    "Borgit's Beastgrabbaz": "Borgit's Beastgrabbaz",
    'Knives of the Crone': 'Knives of the Crone',
    "Kamandora's Blades": "Kamandora's Blades"
}


let bcpAPICallCount = 0;
const playersAndDecks = []

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

async function fetchBCPData() {
    const url = bcpBaseUrl + eventId + bcpResultsQuery
    return await callBCP(url)
}

async function fetchBCPDeckList(deckListId) {
    const url = bcpDecklistBaseUrl + deckListId
    return await callBCP(url)
}

async function fetchBCPPlacings() {
    const url = bcpPlacingsBaseUrl + eventId + bcpPlacingsQuery
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

function getPlayerWarband(playerInfo) {
    const warband = playerInfo['armyName'];

    if (!warband) {
        console.log(`No warband information for user ID ${playerInfo['userId']}, ${playerInfo['firstName']} ${playerInfo['lastName']}`)
        return '-'
    }

    return bcpFactionMap[warband];
}

async function getDecks(playerInfo) {
    const playerId = playerInfo['userId']
    const parsed = parsedDecklists[playerId]
    if (parsed) {
        if (!parsed['warband']) {
            const warband = getPlayerWarband(playerInfo)
            parsed['warband'] = warband
            parsedDecklists[playerId]['warband'] = warband
        }
        return parsed
    }

    const warband = getPlayerWarband(playerInfo)
    const emptyDeckList = {deck1: "-", deck2: "-", deckUrl: "", warband }

    const decklistId = playerInfo['armyListObjectId'];

    if (decklistId === undefined) {
        console.log(`No decklist ID for player with ID ${playerId}, ${playerInfo['firstName']} ${playerInfo['lastName']}`);
        parsedDecklists[playerId] = emptyDeckList
        return emptyDeckList
    }

    const bcpDecklist = await fetchBCPDeckList(decklistId)

    const decklistText = bcpDecklist["armyListText"]

    if (decklistText === undefined) {
        console.log(`No decklist text for player with ID ${playerId}, ${playerInfo['firstName']} ${playerInfo['lastName']}`)
        console.log('Returned deck data for the player: ' + JSON.stringify(bcpDecklist))
        parsedDecklists[playerId] = emptyDeckList
        return emptyDeckList
    }

    if (decklistText.includes("underworldsdb.com")) {
        const urlMatch = decklistText.match(/https?:\/\/[^\s]+/);
        const deckUrl = urlMatch ? urlMatch[0] : '';

        const decks = parseDecks(decklistText)
        const parsed = { deck1: deckMap[decks[0]], deck2: deckMap[decks[1]], warband }
        parsed['deckUrl'] = deckUrl

        parsedDecklists[playerId] = parsed
        return parsed
    }

    console.log(`Cannot find underworldsdb link in the player's deck list data. Trying to find information from the text, for player with ID ${playerId}, ${playerInfo['firstName']} ${playerInfo['lastName']}`)

    // Try to get the decks from the text itself
    const decks = []
    for (const [key, value] of Object.entries(deckMap)) {
        if (decklistText.includes(value)) {
            decks.push(value)
        }
    }

    if (decks.length !== 2) {
        console.log(`Could not find exactly two decks in the decklist text for player ${playerId}, ${playerInfo['firstName']} ${playerInfo['lastName']}. Found: ${decks.length} decks. Text: ${decklistText}`);
        parsedDecklists[playerId] = emptyDeckList
        return emptyDeckList
    }

    console.log(`Found decks in the text for player with ID ${playerId}, ${playerInfo['firstName']} ${playerInfo['lastName']}. The original returned deck data: ${JSON.stringify(bcpDecklist)}`);

    const parsedDeck = { deck1: decks[0], deck2: decks[1], warband }
    console.log(`Use the following entry if you want to add this player to the parsedDecklists: '${playerId}': ${JSON.stringify(parsedDeck)},`);

    parsedDecklists[playerId] = parsedDeck
    return parsedDeck
}

async function processSingleGameResult(gameResult) {
    // Process only pairings where both userIDs are present. When one of the user ID's is missing, then it was a bye, and we skip that.
    if (gameResult['metaData'] && gameResult['player2']['userId'] && gameResult['player1']['userId']) {
        const player1Decks = await getDecks(gameResult['player1'])
        const player2Decks = await getDecks(gameResult['player2'])
        return {
            player1Faction: player1Decks['warband'],
            player1Deck1: player1Decks['deck1'],
            player1Deck2: player1Decks['deck2'],
            gamesWon: gameResult['metaData']['in-p1-numberOfWins'] || 0,
            gamesLost: gameResult['metaData']['in-p2-numberOfWins'] || 0,
            player2Faction: player2Decks['warband'],
            player2Deck1: player2Decks['deck1'],
            player2Deck2: player2Decks['deck2']
        }
    } else {
        // console.log('Missing data for this match: ' + JSON.stringify(gameResult))
    }
}

async function processResult() {
    const data = await fetchBCPData()
    const results = []

    console.log(`Processing ${data['data'].length} game results`)
    for (const singleGameData of data['data']) {
        const processed = await processSingleGameResult(singleGameData)
        if (processed) {
            results.push(processed)
        }
    }

    console.log(`There are ${results.length} results after processing`)
    console.log(`Called BCP API ${bcpAPICallCount} times`)

    const separator = ','

    for (const result of results) {
        console.log(`${result['player1Faction']}${separator}${result['player1Deck1']}${separator}${result['player1Deck2']}${separator}${result['gamesWon']}${separator}${result['gamesLost']}${separator}0${separator}${result['player2Faction']}${separator}${result['player2Deck1']}${separator}${result['player2Deck2']}`)
    }
}

async function printPlacings() {
    const placings = await fetchBCPPlacings()

    // iterate over placings.active
    for (const placing of placings['active']) {
        if (placing['faction'] === undefined) {
            console.log('Undefined faction for a placing: ' + JSON.stringify(placing));
            continue;
        }

        const playerId = placing['userId']
        const playerFaction = bcpFactionMap[placing['faction']['name']]
        // TODO fix this!
        // const playerDecks = await getDecks(playerId, placing['listId'])

        playersAndDecks.push([placing['placing'], playerFaction, playerDecks['deck1'], playerDecks['deck2'], playerDecks['deckUrl']])
    }

    console.log(JSON.stringify(playersAndDecks))
}

await processResult()

// await printPlacings()
