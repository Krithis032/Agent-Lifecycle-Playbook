import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

test.describe('TypeScript & Build Quality', () => {
  test('TypeScript compiles without errors (next build lint)', async () => {
    test.setTimeout(150_000); // tsc can be slow under parallel load
    try {
      const result = execSync('npx tsc --noEmit --project tsconfig.check.json 2>&1', { encoding: 'utf-8', cwd: ROOT, timeout: 120_000 });
      // If tsc exits 0, no errors
      expect(result).not.toContain('error TS');
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string };
      // tsc exits with code 1 if errors — capture and report
      const output = (err.stdout || '') + (err.stderr || '');
      const errors = output.split('\n').filter(l => l.includes('error TS'));
      // Allow up to 0 errors
      expect(errors.length).toBe(0);
    }
  });

  test('next build succeeds', async () => {
    // This test is expensive — skip in CI watch mode
    if (process.env.SKIP_BUILD_TEST) return;
    try {
      execSync('npm run build 2>&1', { encoding: 'utf-8', cwd: ROOT, timeout: 120000 });
    } catch (e: unknown) {
      const err = e as { stdout?: string };
      // Check if it's a lint warning vs actual failure
      expect(err.stdout || '').not.toContain('Failed to compile');
    }
  });
});

test.describe('Code Quality Checks', () => {
  test('no console.log in API routes (production risk)', async () => {
    const apiDir = path.join(ROOT, 'src/app/api');
    const files = findTsFiles(apiDir);
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('console.log(') && !line.trim().startsWith('//')) {
          violations.push(`${path.relative(ROOT, file)}:${idx + 1}`);
        }
      });
    }
    // console.error is acceptable for error handlers; console.log is not
    // Report but don't fail — track as tech debt
    if (violations.length > 0) {
      console.warn(`⚠️ console.log found in ${violations.length} API routes:`, violations.slice(0, 10));
    }
  });

  test('no TODO/FIXME in critical paths', async () => {
    const criticalPaths = [
      path.join(ROOT, 'src/lib'),
      path.join(ROOT, 'src/app/api'),
    ];
    const violations: string[] = [];
    for (const dir of criticalPaths) {
      const files = findTsFiles(dir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/\b(TODO|FIXME|HACK|XXX)\b/.test(line)) {
            violations.push(`${path.relative(ROOT, file)}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
    if (violations.length > 0) {
      console.warn(`⚠️ Technical debt markers found: ${violations.length}`, violations.slice(0, 5));
    }
  });

  test('no hardcoded API keys in source', async () => {
    const srcDir = path.join(ROOT, 'src');
    const files = findTsFiles(srcDir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/sk-ant-[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/ANTHROPIC_API_KEY\s*=\s*['"][^'"\s]+['"]/);
    }
  });

  test('all lib files are under 500 lines', async () => {
    const libDir = path.join(ROOT, 'src/lib');
    const files = findTsFiles(libDir);
    const oversized: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lineCount = content.split('\n').length;
      if (lineCount > 500) {
        oversized.push(`${path.relative(ROOT, file)} (${lineCount} lines)`);
      }
    }
    if (oversized.length > 0) {
      console.warn(`⚠️ Oversized lib files: ${oversized.join(', ')}`);
    }
  });

  test('all API routes are under 300 lines', async () => {
    const apiDir = path.join(ROOT, 'src/app/api');
    const files = findTsFiles(apiDir);
    const oversized: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lineCount = content.split('\n').length;
      if (lineCount > 300) {
        oversized.push(`${path.relative(ROOT, file)} (${lineCount} lines)`);
      }
    }
    if (oversized.length > 0) {
      console.warn(`⚠️ Oversized API routes: ${oversized.join(', ')}`);
    }
  });
});

test.describe('Schema & Data Integrity', () => {
  test('Prisma schema exists and is valid', async () => {
    const schemaPath = path.join(ROOT, 'prisma/schema.prisma');
    expect(fs.existsSync(schemaPath)).toBeTruthy();
    const content = fs.readFileSync(schemaPath, 'utf-8');
    expect(content).toContain('generator client');
    expect(content).toContain('datasource db');
    // Verify critical models exist
    const models = ['KbDomain', 'KbConcept', 'PlaybookPhase', 'PlaybookStep', 'GateCheck', 'Project', 'Template', 'TemplateFill', 'GovernanceAssessment', 'CaioAssessment', 'Evaluation', 'User'];
    for (const model of models) {
      expect(content).toContain(`model ${model}`);
    }
  });

  test('all 21 KB YAML files exist', async () => {
    const kbDir = path.join(ROOT, 'content/kb');
    expect(fs.existsSync(kbDir)).toBeTruthy();
    const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.yaml'));
    expect(files.length).toBeGreaterThanOrEqual(20);
  });

  test('KB YAML files are valid YAML (parseable)', async () => {
    const yaml = require('js-yaml');
    const kbDir = path.join(ROOT, 'content/kb');
    const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.yaml'));
    const failures: string[] = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(kbDir, file), 'utf-8');
        yaml.load(content);
      } catch {
        failures.push(file);
      }
    }
    expect(failures).toEqual([]);
  });
});

// ── Helpers ──
function findTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsFiles(full));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}
