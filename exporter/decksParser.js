import { deckMap } from './consts.js'

export default function parseDecks(deckUrl) {
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

    if (decks.length === 2) {
        return { deck1: deckMap[decks[0]], deck2: deckMap[decks[1]] }
    } else if (decks.length === 1) {
        return { deck1: deckMap[decks[0]], deck2: 'Rivals' }
    } else {
        return { deck1: '-', deck2: '-' }
    }
}
