/**
 * Usage: node scripts/set-admin-password.mjs <password>
 * Generates a bcrypt hash and updates ADMIN_PASSWORD_HASH in .env.local
 *
 * NOTE: The hash is written single-quoted (e.g. ADMIN_PASSWORD_HASH='$2b$...')
 * because dotenv-expand would otherwise interpret the $ signs as shell variable
 * references, producing a corrupted/truncated value at runtime.
 */
import bcrypt from "bcryptjs";
import { readFileSync, writeFileSync, existsSync } from "fs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/set-admin-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

const envPath = new URL("../.env.local", import.meta.url).pathname;
let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

// Remove any existing ADMIN_PASSWORD_HASH or ADMIN_PASSWORD lines
content = content
  .split("\n")
  .filter((l) => !l.startsWith("ADMIN_PASSWORD"))
  .join("\n")
  .trimEnd();

content += `\nADMIN_PASSWORD_HASH='${hash}'\n`;

writeFileSync(envPath, content);
console.log("✓ ADMIN_PASSWORD_HASH written to .env.local");
console.log(`  hash: ${hash}`);
