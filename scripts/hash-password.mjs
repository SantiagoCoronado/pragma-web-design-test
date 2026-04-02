#!/usr/bin/env node
// Usage: node scripts/hash-password.mjs <your-password>
// Copy the output into ADMIN_PASSWORD_HASH in your .env.local

import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
