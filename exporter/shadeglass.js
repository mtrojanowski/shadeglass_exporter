import parseDecks from "./decksParser";

const shadeglassGetDataUrl = 'https://shadeglass.eu/pl/api/ApiTournament/GetDetails';

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
    'borgits-beastgrabbaz': "Borgit's Beastgrabbaz",
    'knives-of-the-crone': "Knives of the Crone",
    'kamandoras-blades': "Kamandora's Blades",
}

const deckMap = {
    '8150e66b-ec2d-44eb-9711-f62a72a9b4a7': 'Blazing Assault',
    '9e2de919-d2af-4847-aeda-1e546bc2d6a1': 'Countdown to Cataclysm',
    '4a39d1ed-7b87-43ad-973a-56412cdf9664': 'Edge of the Knife',
    '94a04ba4-1670-41c0-be28-da96c5db2a36': 'Emberstone Sentinels',
    'c983de21-e0c7-48d0-a986-dce93299ec2a': 'Pillage and Plunder',
    '249bc40c-44e8-482d-911e-a82ebe12e957': 'Raging Slayers',
    '25a951a2-aff4-4b91-87ca-86ea07d2a886': 'Realmstone Raiders',
    'c2d5bcb2-9c10-4748-991c-de6e6d8250cb': 'Reckless Fury',
    '9512d471-ae4c-4eae-8768-ad1ba3cab9e1': 'Wrack and Ruin',
}

async function fetchData(tournamentId, token) {
    return await fetch(shadeglassGetDataUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ EntityGuid: tournamentId })
    });
}

async function getPlayersData(tournamentId, token) {
    const players = await fetchData(tournamentId, token);

    const processedPlayers = {};

    for (const player of players.Players) {
        processedPlayers[player.uid] = {
            id: player.uid,
            name: player.name,
            faction: warbandMap[player.band],
            listUrl: player.deckUrl,
            decks: await getDeckData(player.DeckA, player.DeckB, player.deckUrl)
        };
    }

    return processedPlayers;
}

function getDeckData(deck1, deck2, deckUrl) {
    const decks = { deck1: "-", deck2: "-" }

    if (deck1) {
        decks.deck1 = deckMap[deck1]

        if (deck2) {
            decks.deck2 = deckMap[deck2]
        } else {
            decks.deck2 = 'Rivals'
        }

        return decks;
    }

    // Try to parse decks from the deck link
    if (deckUrl) {
        return parseDecks(deckUrl)
    }

    return decks;
}

export { getPlayersData };
