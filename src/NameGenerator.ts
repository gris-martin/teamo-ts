import nouns = require('./nouns.json');
import adjectives = require('./adjectives.json');

let capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function generateName() {
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    return capitalize(adjective) + " " + capitalize(noun);
}
