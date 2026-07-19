import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;

  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1).replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

function isPlaceholderDatabaseUrl(value) {
  return !value || value.includes("USER:PASSWORD@HOST") || value.includes("@HOST:");
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

loadLocalEnv();

if (isPlaceholderDatabaseUrl(process.env.DATABASE_URL) && process.env.NEON_DATABASE_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NEON_DATABASE_DATABASE_URL;
}

if (isPlaceholderDatabaseUrl(process.env.DATABASE_URL)) {
  console.log("DATABASE_URL is not configured; building with static catalog fallback.");
} else {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npm", ["run", "db:seed-static"]);
}

run("npx", ["next", "build"]);
