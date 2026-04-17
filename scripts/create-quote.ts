#!/usr/bin/env node
import { readFileSync } from "fs";
import { createClient } from "@libsql/client";
import matter from "gray-matter";

interface FrontMatter {
  id?: string;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  title?: string;
  currency?: string;
  locale?: string;
  valid_until?: string;
}

async function main() {
  const args = process.argv.slice(2);
  let id: string | null = null;
  let filePath: string | null = null;
  let generatedComponent: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) {
      id = args[i + 1];
      i++;
    } else if (args[i] === "--file" && args[i + 1]) {
      filePath = args[i + 1];
      i++;
    } else if (args[i] === "--component" && args[i + 1]) {
      generatedComponent = args[i + 1];
      i++;
    }
  }

  if (!id || !filePath) {
    console.error("Usage: tsx scripts/create-quote.ts --id <id> --file <path> [--component <tsx>]");
    process.exit(1);
  }

  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const { data: fm, content } = matter(fileContent);
    const frontMatter = fm as FrontMatter;

    if (!frontMatter.client_name || !frontMatter.client_email || !frontMatter.title) {
      console.error("Error: Missing required frontmatter fields (client_name, client_email, title)");
      process.exit(1);
    }

    const db = createClient({
      url: process.env.DATABASE_URL || "file:local.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO quotes (
        id, client_name, client_email, client_company, title,
        quote_type, currency, status, valid_until, locale,
        raw_content, generated_component,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        frontMatter.client_name,
        frontMatter.client_email,
        frontMatter.client_company || "",
        frontMatter.title,
        "ai-generated",
        frontMatter.currency || "MXN",
        "draft",
        frontMatter.valid_until || "",
        frontMatter.locale || "en",
        content,
        generatedComponent || "",
        now,
        now,
      ],
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const locale = frontMatter.locale || "en";
    const quoteUrl = `${baseUrl}/${locale}/quote/${id}`;
    const adminUrl = `${baseUrl}/${locale}/admin/quotes/${id}`;

    console.log(`✓ Quote created successfully`);
    console.log(`  ID: ${id}`);
    console.log(`  Client URL: ${quoteUrl}`);
    console.log(`  Admin URL: ${adminUrl}`);
    console.log(`\nReminder: Commit src/generated-quotes/ changes and redeploy to activate.`);
  } catch (error) {
    console.error("Error creating quote:", error);
    process.exit(1);
  }
}

main();
