import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('/Users/takakitakeda/Documents/Learning/English/phrases_cleaned.txt', 'utf8');

const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
const phrases = [];

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 1) continue;

  const english = lines[0];
  if (!english || english.startsWith('→')) continue;

  const backLines = lines.slice(1).join(' ').replace(/^→\s*/, '').trim();
  if (!backLines) continue;

  // Extract meaning and example
  const mMatch = backLines.match(/^Meaning:\s*(.+?)(?:[\.\s]+Example:\s*["""](.+?)["""]\.?\s*)?$/s);

  let meaning = null, example = null;

  if (mMatch) {
    meaning = mMatch[1].replace(/\.\s*$/, '').trim();
    example = mMatch[2] ? mMatch[2].trim() : null;
  } else {
    meaning = backLines.replace(/^Meaning:\s*/, '').replace(/\.\s*$/, '').trim();
  }

  phrases.push({ english, meaning, example });
}

console.error(`Parsed ${phrases.length} phrases`);
process.stdout.write(JSON.stringify(phrases));
