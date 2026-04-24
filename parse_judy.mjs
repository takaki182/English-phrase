import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('/Users/takakitakeda/Documents/Learning/English/judy_and_jesse.txt', 'utf8');

const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
const phrases = [];

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  const phraseLine  = lines.find(l => l.startsWith('Phrase:'));
  const meaningLine = lines.find(l => l.startsWith('Meaning:'));
  if (!phraseLine || !meaningLine) continue;
  phrases.push({
    phrase:  phraseLine.replace(/^Phrase:\s*/, '').trim(),
    meaning: meaningLine.replace(/^Meaning:\s*/, '').trim()
  });
}

console.error(`Parsed ${phrases.length} phrases`);
writeFileSync('judy_phrases.json', JSON.stringify(phrases));
