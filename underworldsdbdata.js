const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'underworldsdbdata.html');
const fileContent = fs.readFileSync(filePath, 'utf8');
const cardMap = {};
const regex = /data-card="([^"]+)"[^>]*data-cardname="([^"]+)"/g;
let match;
while ((match = regex.exec(fileContent)) !== null) {
    const cardId = match[1];
    const cardName = match[2];
    if (!cardMap[cardName]) {
        cardMap[cardName] = []
    }

    if (!cardMap[cardName].includes(cardId)) {
        cardMap[cardName].push(cardId);
    }

}

console.log(cardMap);
