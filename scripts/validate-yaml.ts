import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const contentDir = path.resolve(process.cwd(), 'content');

function validateFile(filePath: string): boolean {
  const filename = path.basename(filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    yaml.load(content);
    console.log(`  OK: ${filename}`);
    return true;
  } catch (e) {
    console.error(`  FAIL: ${filename} - ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

function main() {
  console.log('Validating YAML files...\n');

  const topLevelFiles = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

  let passed = 0;
  let failed = 0;

  console.log('Content files:');
  for (const f of topLevelFiles) {
    if (validateFile(path.join(contentDir, f))) passed++;
    else failed++;
  }

  const kbDir = path.join(contentDir, 'kb');
  if (fs.existsSync(kbDir)) {
    console.log('\nKB files:');
    const kbFiles = fs
      .readdirSync(kbDir)
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const f of kbFiles) {
      if (validateFile(path.join(kbDir, f))) passed++;
      else failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
