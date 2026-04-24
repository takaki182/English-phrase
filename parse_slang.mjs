import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('/Users/takakitakeda/Documents/Learning/English/slang_phrases_cleaned.txt', 'utf8');

const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
const phrases = [];

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) continue;

  const phraseLine = lines.find(l => !l.startsWith('→') && !l.startsWith('=') && !l.match(/^[A-Z\s&—]+$/));
  const meaningLine = lines.find(l => l.startsWith('→'));

  if (!phraseLine || !meaningLine) continue;

  const phrase  = phraseLine.trim();
  const meaning = meaningLine.replace(/^→\s*/, '').trim();

  phrases.push({ phrase, meaning });
}

console.error(`Parsed ${phrases.length} slang phrases`);
writeFileSync('slang_phrases.json', JSON.stringify(phrases));
