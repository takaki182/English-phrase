import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('/Users/takakitakeda/Documents/Learning/English/phrases_final_v2.txt', 'utf8');

const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
const phrases = [];

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);

  const situation = lines.find(l => l.startsWith('Situation:'))?.replace(/^Situation:\s*/, '').trim();
  const phrase    = lines.find(l => l.startsWith('Phrase:'))?.replace(/^Phrase:\s*/, '').trim();
  const meaning   = lines.find(l => l.startsWith('Meaning:'))?.replace(/^Meaning:\s*/, '').trim();
  const exRaw     = lines.find(l => l.startsWith('Example:'))?.replace(/^Example:\s*/, '').trim();
  const example   = exRaw ? exRaw.replace(/^[""\u201c]/, '').replace(/[""'\u201d]$/, '').trim() : null;

  if (situation && phrase && meaning) {
    phrases.push({ situation, phrase, meaning, example: example || null });
  }
}

console.error(`Parsed ${phrases.length} phrases`);
writeFileSync('takaki_phrases.json', JSON.stringify(phrases));
