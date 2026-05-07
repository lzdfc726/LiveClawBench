/**
 * Seed logic for chat mock service.
 *
 * Idempotent: re-running does not create duplicate rows.
 * Fatal on failure: any error causes process.exit(1).
 */

import { mkdirSync } from "node:fs";
import type { Database } from "bun:sqlite";
import { ensureTables } from "../db/schema.js";
import type { ChatConfig } from "../types.js";

function seedMockUser(db: Database): void {
  const existing = db.query("SELECT 1 FROM mock_user WHERE id = 1").get();
  if (!existing) {
    db.run("INSERT INTO mock_user (id, display_name) VALUES (1, 'You')");
  }
}

function seedChannel(db: Database): void {
  const existing = db.query("SELECT 1 FROM channel WHERE id = 1").get();
  if (!existing) {
    db.run(
      `INSERT INTO channel (id, user_id, name, kind, last_message_preview, updated_at, unread_count)
       VALUES (1, 1, 'launch-war-room', 'group', NULL, ?, 0)`,
      [new Date().toISOString()],
    );
  }
}

export function seed(db: Database, config: ChatConfig): void {
  try {
    ensureTables(db);
    seedMockUser(db);
    seedChannel(db);

    mkdirSync(config.stickerDir, { recursive: true });
  } catch (err) {
    console.error(
      "mock-chat: FATAL: seed failed:",
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
}
