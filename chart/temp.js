const fs = require('fs');
const path = require('path');

const directory = 'warband_icons';
const iconMap = {};

fs.readdirSync(directory).forEach(file => {

    const key = path.basename(file, path.extname(file)).slice(0, -5);
    const value = path.join(directory, file); // Prefix with directory name
    iconMap[key] = value;
});

console.log(iconMap);
