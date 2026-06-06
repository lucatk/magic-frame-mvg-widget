#!/usr/bin/env node
/**
 * Pushes the built bundle (`dist/bundle.js` + `dist/module.json`) into the
 * local magic-frame Postgres `CustomModule` table.
 *
 * Reads DATABASE_URL from `../magic-frame/.env`. Upserts on `type` so it
 * works both for first-time install and for replacing the bundle on rebuild.
 */
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");
const envPath = path.resolve(repoRoot, "../magic-frame/.env");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*export\s+/, "");
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const envText = await readFile(envPath, "utf-8").catch(() => {
  throw new Error(`Could not read ${envPath}`);
});
const env = parseEnv(envText);
const dbUrl = env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL missing in magic-frame/.env");

const manifestRaw = JSON.parse(
  await readFile(path.join(distDir, "module.json"), "utf-8"),
);
const bundleJs = await readFile(path.join(distDir, "bundle.js"), "utf-8");

if (bundleJs.length < 20) throw new Error("Bundle empty / too small.");
if (bundleJs.length > 2 * 1024 * 1024) {
  throw new Error("Bundle > 2 MB — slim it down.");
}
if (!bundleJs.includes("registerWidget")) {
  throw new Error("Bundle does not call MagicFrame.registerWidget — bad build.");
}

// Mirror parseManifest from magic-frame/src/lib/modules/store.ts so the row
// matches what the admin UI would write.
const m = { ...manifestRaw };
let type = String(m.type ?? "").trim();
if (!type) throw new Error("Manifest: `type` missing.");
if (!type.startsWith("custom:")) type = `custom:${type}`;
if (!/^custom:[a-z0-9][a-z0-9_-]{0,63}$/i.test(type)) {
  throw new Error(`Manifest: invalid type "${type}".`);
}
const manifest = {
  type,
  label: String(m.label ?? "").trim(),
  description: m.description ? String(m.description) : "",
  iconEmoji: m.iconEmoji ? String(m.iconEmoji).slice(0, 4) : "🧩",
  version: m.version ? String(m.version) : "1.0.0",
  fields: Array.isArray(m.fields) ? m.fields : [],
  author: m.author ?? undefined,
  homepage: m.homepage ?? undefined,
};
if (!manifest.label) throw new Error("Manifest: `label` missing.");

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();
try {
  // Generate a cuid-ish id only for the create branch — keeps existing id
  // on conflict so other tables referencing it (if any) stay intact.
  const newId = `mvg_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const sql = `
    INSERT INTO "CustomModule"
      (id, type, label, description, "iconEmoji", version, "manifestJson", "bundleJs", enabled, "createdAt", "updatedAt")
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
    ON CONFLICT (type) DO UPDATE SET
      label = EXCLUDED.label,
      description = EXCLUDED.description,
      "iconEmoji" = EXCLUDED."iconEmoji",
      version = EXCLUDED.version,
      "manifestJson" = EXCLUDED."manifestJson",
      "bundleJs" = EXCLUDED."bundleJs",
      "updatedAt" = NOW()
    RETURNING id, type, length("bundleJs") AS bundle_bytes, "updatedAt";
  `;
  const res = await client.query(sql, [
    newId,
    manifest.type,
    manifest.label,
    manifest.description,
    manifest.iconEmoji,
    manifest.version,
    JSON.stringify(manifest),
    bundleJs,
  ]);
  const r = res.rows[0];
  console.log(
    `✓ Pushed ${r.type}  id=${r.id}  bundle=${r.bundle_bytes} bytes  @ ${r.updatedAt.toISOString()}`,
  );
} finally {
  await client.end();
}
