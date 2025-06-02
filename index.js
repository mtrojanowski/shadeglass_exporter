// The results of the tournament as copied from the shadeglass response to GetDetails
const data = {
    }

// Map of deck shortcuts to names used in stats
const deckMap = {
    'CC': 'Countdown to Cataclysm',
    'PL': 'Pillage and Plunder',
    'BL': 'Blazing Assault',
    'ES': 'Emberstone Sentinels',
    'WR': 'Wrack and Ruin',
    'EK': 'Edge of the Knife',
    'RF': 'Reckless Fury',
}

// Map of warband values used in shadeglass to names used in stats
const warbandMap = {
    Steelheart: 'Steelheart’s Champions',
    Bloodbound: 'Garrek’s Reavers',
    Ironjawz: "Ironskull's Boyz",
    Sepulchral: 'Sepulchral Guard',
    Fyreslayers: 'Chosen Axes',
    Skaven: "Spiteclaw's Swarm",
    Fiends: "Magore's Fiends",
    Rangers: 'Farstriders',
    Sacrosanct: 'Stormsire’s Cursebreakers',
    Nighthaunt: 'Thorns of the Briar Queen',
    Moonclan: "Zarbag's Gitz",
    Tzeentch: 'Eyes of the Nine',
    Godsworn: 'Godsworn Hunt',
    Mollog: "Mollog's Mob",
    Guardians: 'Ylthari’s Guardians',
    Profiteers: 'Thundrik’s Profiteers',
    Grashrak: 'Grashrak’s Despoilers',
    Skaeth: 'Skaeth’s Wild Hunt',
    Ironsouls: "Ironsoul's Condemners",
    Ladyharrows: "Lady Harrow's Mournflight",
    Grymwatch: 'Grymwatch',
    Snarlfangs: 'Rippa’s Snarlfangs',
    Hrothgorn: "Hrothgorn's Mantrappers",
    Wurmspat: 'Wurmspat',
    Morgoks: 'Morgok’s Krushas',
    Morgwaeths: 'Morgwaeth’s Blade coven',
    Myarispurifiers: 'Myari’s Purifiers ',
    Dreadpageant: 'Dread Pageant',
    Ravagers: "Khagra's Ravagers",
    Stalkers: 'Starblood Stalkers',
    Court: 'Crimson Court',
    Celestus: 'Storm of Celestus',
    Wraithcreepers: "Drepur's Wraithcreepers",
    Madmob: "Hedkrakka's Madmob",
    Reapers: "Kainan's Reapers",
    Elathains: "Elathain's Soulraid",
    Xandires: "Xandire's Truthseekers",
    Kunnin: "Da Kunnin' Krew",
    Blackpowder: "Blackpowder's Buccaneers",
    Exileddead: 'Exiled Dead',
    Shadeborn: 'Shadeborn',
    Clawpack: "Skittershank's Clawpack",
    Hexbanes: "Hexbane's Hunters",
    Gorechosen: 'Gorechosen of Dromm',
    Gnarlspirit: 'Gnarlspirit Pack',
    Sonsofvelmorn: 'Sons of Velmorn',
    Grinkrak: "Grinkrak's Looncourt",
    Gryselles: "Gryselle's Arenai",
    Domitans: "Domitan's Stormcoven",
    Ephilims: "Ephilim's Pandaemonium",
    headsmens: "Headsmen's Curse",
    Skabbiks: "Skabbik's Plaguepack",
    ThricefoldDiscord: 'The Thricefold Discord',
    CyrenisRazors: "Cyreni's Razors",
    Daggoks: "Daggok's Stab-ladz",
    Zondaras: "Zondara's Gravebreakers",
    Brethren: 'Brethren of the Bolt',
    Skinnerkin: 'Skinnerkin',
    emberwatch: 'Emberwatch',
    zikkits: "Zikkit's Tunnelpack",
    Grandfathers: "Grandfather's Gardeners",
    Jaws: 'Jaws of Itzl',
    'borgits-beastgrabbaz': "Borgit's Beastgrabbaz"
}

// Enter players here that did not configure decklist in shadeglass
// Use the following format (uuid of the user from shadeglass as the key)
// '4ccb881b-84d5-4fc2-846f-15c77f9c2157': {band: warbandMap['Jaws'], deck1: deckMap['CC'], deck2: deckMap['ES']},

const parsedPlayers = {
    // '4ccb881b-84d5-4fc2-846f-15c77f9c2157': {band: warbandMap['Jaws'], deck1: deckMap['CC'], deck2: deckMap['ES']},

};
function processData(data) {
    const result = [];

    for (const round of data.Rounds) {
        for (const pair of round.pairs) {
            const player1 = findPlayer(data.Players, pair.A);
            const player2 = findPlayer(data.Players, pair.B);

            result.push({
                warband1: player1.band,
                deck1_1: player1.deck1,
                deck1_2: player1.deck2,
                ...calculateResult(pair),
                warband2: player2.band,
                deck2_1: player2.deck1,
                deck2_2: player2.deck2,
            });
        }
    }
    return result;
}

function findPlayer(players, key) {
    if (parsedPlayers[key]) {
        return parsedPlayers[key];
    }

    for (const entry of players) {
        if (entry.uid === key) {

            const decks = parseDecks(entry.deckUrl)
            const player = {
                band: warbandMap[entry.band],
                deck1: deckMap[decks[0]],
                deck2: deckMap[decks[1]]
            }

            parsedPlayers[key] = player;

            return player;
        }
    }
    return null;
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

function calculateResult(roundResult) {
    const result = {
        player1Win: 0,
        player1Loss: 0,
        player1Draw: 0
    }

    if (roundResult.Winner1) {
        if (roundResult.Winner1 === "A") {
            result.player1Win++;
        } else if (roundResult.Winner1 === "R") {
            result.player1Draw++;
        } else {
            result.player1Loss++;
        }
    }

    if (roundResult.Winner2) {
        if (roundResult.Winner2 === "A") {
            result.player1Win++;
        } else if (roundResult.Winner2 === "R") {
            result.player1Draw++;
        } else {
            result.player1Loss++;
        }
    }

    if (roundResult.Winner3) {
        if (roundResult.Winner3 === "A") {
            result.player1Win++;
        } else if (roundResult.Winner3 === "R") {
            result.player1Draw++;
        } else {
            result.player1Loss++;
        }
    }

    return result;
}

const result = processData(data);

for (const entry of result) {
    console.log(Object.values(entry).join(','));
}
