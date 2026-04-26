import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('/Users/takakitakeda/Documents/Learning/English/adjectives-complete.txt', 'utf8');

const lines = text.split('\n');
const phrases = [];

let i = 0;
while (i < lines.length) {
  const line = lines[i].trim();

  // Word line starts with "* "
  if (line.startsWith('* ')) {
    // Extract word (with pronunciation)
    const word = line.slice(2).trim();

    // Next non-empty line = meaning
    let meaning = '';
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) { meaning = lines[j].trim(); j++; }

    // Next non-empty line = example (in quotes)
    let example = '';
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) {
      const ex = lines[j].trim();
      if (ex.startsWith('"') || ex.startsWith('\u201c')) {
        example = ex.replace(/^["\u201c]/, '').replace(/["\u201d]$/, '').trim();
        j++;
      }
    }

    if (meaning) {
      phrases.push({ word, meaning, example: example || null });
    }
    i = j;
  } else {
    i++;
  }
}

console.error(`Parsed ${phrases.length} adjectives`);
writeFileSync('adj_phrases.json', JSON.stringify(phrases));
