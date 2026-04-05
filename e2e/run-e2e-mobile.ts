import { execSync, spawn, ChildProcess } from 'child_process';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

const ROOT = resolve(__dirname, '..');
const E2E_DATABASE_PATH = resolve(ROOT, 'data/e2e-mobile.db');
const APK_PATH = resolve(
  ROOT,
  'packages/mobile/android/app/build/outputs/apk/debug/app-debug.apk',
);
const MAESTRO_FLOWS = 'packages/mobile/maestro/flows/';
const API_PORT = 3000;
const HEALTH_URL = `http://localhost:${API_PORT}/health`;
const HEALTH_TIMEOUT_MS = 30_000;
const HEALTH_INTERVAL_MS = 1_000;

let apiProcess: ChildProcess | null = null;

function cleanup() {
  if (apiProcess) {
    console.log('Stopping API server...');
    apiProcess.kill('SIGTERM');
    apiProcess = null;
  }
}

function checkPrerequisites() {
  console.log('Checking prerequisites...');

  try {
    execSync('which maestro', { stdio: 'ignore' });
  } catch {
    console.error(
      'Error: Maestro CLI not found. Install it with:\n  curl -Ls "https://get.maestro.mobile.dev" | bash',
    );
    process.exit(1);
  }

  try {
    execSync('which adb', { stdio: 'ignore' });
  } catch {
    console.error(
      'Error: adb not found. Install Android SDK platform-tools.',
    );
    process.exit(1);
  }

  try {
    const devices = execSync('adb devices', { encoding: 'utf-8' });
    const lines = devices.trim().split('\n').slice(1).filter((l: string) => l.trim());
    if (lines.length === 0) {
      console.error(
        'Error: No Android devices/emulators found. Start an emulator first.',
      );
      process.exit(1);
    }
  } catch {
    console.error('Error: Failed to check connected devices via adb.');
    process.exit(1);
  }

  if (!existsSync(APK_PATH)) {
    console.error(
      `Error: Debug APK not found at ${APK_PATH}\nBuild it first with: pnpm build:mobile`,
    );
    process.exit(1);
  }

  console.log('All prerequisites met.');
}

function seedDatabase() {
  console.log('Seeding test database...');
  execSync(`DATABASE_PATH=${E2E_DATABASE_PATH} tsx packages/database/src/seed.ts`, {
    stdio: 'inherit',
    cwd: ROOT,
  });
}

function killPort(port: number) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: 'ignore',
    });
  } catch {
    // Port may not be in use
  }
}

function startApiServer(): ChildProcess {
  console.log('Starting API server...');
  const child = spawn('pnpm', ['--filter', '@acme/api', 'start'], {
    cwd: ROOT,
    env: { ...process.env, DATABASE_PATH: E2E_DATABASE_PATH },
    stdio: 'ignore',
    detached: false,
  });
  return child;
}

async function waitForHealth(): Promise<void> {
  console.log(`Waiting for API at ${HEALTH_URL}...`);
  const start = Date.now();
  while (Date.now() - start < HEALTH_TIMEOUT_MS) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) {
        console.log('API is healthy.');
        return;
      }
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, HEALTH_INTERVAL_MS));
  }
  throw new Error(`API did not become healthy within ${HEALTH_TIMEOUT_MS / 1000}s`);
}

function installApk() {
  console.log('Installing APK on emulator...');
  execSync(`adb install -r "${APK_PATH}"`, { stdio: 'inherit' });
}

function runMaestro(): number {
  console.log('Running Maestro tests...');
  try {
    execSync(`maestro test ${MAESTRO_FLOWS}`, {
      stdio: 'inherit',
      cwd: ROOT,
    });
    return 0;
  } catch (err: any) {
    return err.status ?? 1;
  }
}

async function main() {
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });

  checkPrerequisites();
  killPort(API_PORT);
  seedDatabase();

  apiProcess = startApiServer();
  try {
    await waitForHealth();
    installApk();
    const exitCode = runMaestro();
    cleanup();
    process.exit(exitCode);
  } catch (err) {
    console.error(err);
    cleanup();
    process.exit(1);
  }
}

main();
