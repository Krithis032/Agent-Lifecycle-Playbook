import { test as setup, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');
const ROOT = path.resolve(__dirname, '..');

/**
 * Global auth setup for Playwright tests.
 *
 * 1. Ensures a deterministic test user exists in the DB.
 * 2. Authenticates programmatically via NextAuth's CSRF + credentials API.
 * 3. Saves the authenticated storage state for all other projects to reuse.
 */
setup('authenticate', async ({ page, request }) => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

  // ── Step 1: Ensure test user exists ──
  execSync(
    `node -e "
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');
      (async () => {
        const prisma = new PrismaClient();
        const email = 'test@adp.local';
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          const hash = await bcrypt.hash('TestPass123!', 12);
          await prisma.user.create({
            data: { email, passwordHash: hash, name: 'Test User', role: 'admin' },
          });
          console.log('Created test user');
        } else {
          const hash = await bcrypt.hash('TestPass123!', 12);
          await prisma.user.update({ where: { email }, data: { passwordHash: hash } });
          console.log('Updated test user password');
        }
        await prisma.\\$disconnect();
      })();
    "`,
    { cwd: ROOT, stdio: 'pipe', timeout: 15000 },
  );

  // ── Step 2: Authenticate via NextAuth API ──

  // 2a. Get the CSRF token
  const csrfRes = await request.get(`${baseURL}/api/auth/csrf`);
  expect(csrfRes.ok()).toBeTruthy();
  const { csrfToken } = await csrfRes.json();

  // 2b. POST credentials to the NextAuth callback
  const signInRes = await request.post(
    `${baseURL}/api/auth/callback/credentials`,
    {
      form: {
        csrfToken,
        email: 'test@adp.local',
        password: 'TestPass123!',
        json: 'true',
      },
    },
  );
  // NextAuth returns a redirect (302) on success; Playwright follows it
  expect(signInRes.ok()).toBeTruthy();

  // 2c. Verify session is valid
  const sessionRes = await request.get(`${baseURL}/api/auth/session`);
  const session = await sessionRes.json();
  expect(session.user).toBeTruthy();
  expect(session.user.email).toBe('test@adp.local');

  // ── Step 3: Save authenticated state ──
  // The request context from APIRequestContext doesn't have page storage state,
  // so we need to transfer cookies to a browser context.
  // Navigate with page to pick up any cookies set by the request context.

  // Get cookies from the request context by calling the session endpoint with page
  await page.goto(`${baseURL}/api/auth/session`);

  // The page context now has the session cookies from the server.
  // But request and page contexts are separate in Playwright.
  // Let's use the page directly to authenticate instead.

  // Use page.request (same context as page) for proper cookie handling
  const pageCsrfRes = await page.request.get(`${baseURL}/api/auth/csrf`);
  const { csrfToken: pageCsrf } = await pageCsrfRes.json();

  await page.request.post(`${baseURL}/api/auth/callback/credentials`, {
    form: {
      csrfToken: pageCsrf,
      email: 'test@adp.local',
      password: 'TestPass123!',
    },
  });

  // Verify page context session
  const pageSessionRes = await page.request.get(`${baseURL}/api/auth/session`);
  const pageSession = await pageSessionRes.json();
  expect(pageSession.user).toBeTruthy();
  expect(pageSession.user.email).toBe('test@adp.local');

  // Save the authenticated browser state
  await page.context().storageState({ path: AUTH_FILE });

  // ── Step 4: Warm up dev server routes ──
  // Pre-compile heavy routes (PDF/PPTX export) so the dev server doesn't
  // hit MODULE_NOT_FOUND under concurrent test load
  const warmupRoutes = [
    `${baseURL}/api/projects`,
    `${baseURL}/api/evaluate`,
    `${baseURL}/api/governance`,
    `${baseURL}/api/caio`,
  ];
  await Promise.all(warmupRoutes.map((url) => request.get(url).catch(() => {})));
  // Give the dev server a moment to finish compiling
  await new Promise((r) => setTimeout(r, 2000));
});
