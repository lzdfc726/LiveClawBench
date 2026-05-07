/** @jsxImportSource hono/jsx */
/**
 * Chat mock service — Sticker Manager MVP
 *
 * Port: 5003
 * Provides sticker upload, listing, and deletion via Bun + Hono + TSX + SQLite.
 * Compiles to standalone mock-chat binary.
 */

import { createMockApp, createRoute, startServer, registerStaticAssets } from "mock-lib";
import type { MockAppV2, OpenAPIApp } from "mock-lib";
import { z } from "zod";
import { Database } from "bun:sqlite";
import { mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { seed } from "./data/seed.js";
import { registerStickerRoutes } from "./routes/stickers.js";
import { StickerManagerPage } from "./components/sticker-manager-page.js";
import type { ChatConfig, DbState } from "./types.js";

const DEFAULT_DB_PATH = "/opt/mock/data/chat/chat.sqlite";
const DEFAULT_STICKER_DIR = "/opt/mock/data/chat/stickers";
const PORT = 5003;

function resolveConfig(options?: { dbPath?: string; stickerDir?: string }): ChatConfig {
  const dbPath = options?.dbPath ?? process.env.CHAT_DB_PATH ?? DEFAULT_DB_PATH;
  const stickerDir = options?.stickerDir ?? process.env.CHAT_STICKER_DIR ?? DEFAULT_STICKER_DIR;
  return { dbPath, stickerDir };
}

export function createChatApp(options?: { dbPath?: string; stickerDir?: string }): MockAppV2 {
  const config = resolveConfig(options);

  let dbPath = config.dbPath;
  let stickerDir = config.stickerDir;

  if (dbPath !== ":memory:") {
    try {
      mkdirSync(dirname(dbPath), { recursive: true });
    } catch {
      dbPath = join(tmpdir(), "mock-chat", `chat-${Date.now()}.sqlite`);
      mkdirSync(dirname(dbPath), { recursive: true });
    }
  }

  try {
    mkdirSync(stickerDir, { recursive: true });
  } catch {
    stickerDir = join(tmpdir(), "mock-chat", "stickers");
    mkdirSync(stickerDir, { recursive: true });
  }

  const db = new Database(dbPath, { create: true });
  db.run("PRAGMA foreign_keys = ON");

  const dbState: DbState = { db, config: { dbPath, stickerDir } };

  const mockApp = createMockApp({
    name: "chat-mock",
    port: PORT,
    healthResponse: { status: "healthy", service: "chat-mock" },
    openApi: {
      enabled: true,
      title: "Chat Mock API",
      version: "1.0.0",
    },
  });

  const { config: appConfig, app } = mockApp;

  registerStaticAssets(app, {
    dir: stickerDir,
    prefix: "/static/chat/stickers",
  });

  const sentinelRoute = createRoute({
    method: "get",
    path: "/__mock_sentinel__/chat",
    summary: "Binary isolation probe",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ ok: z.boolean() }),
          },
        },
        description: "OK",
      },
    },
  });
  app.openApiRoute(sentinelRoute, (c) => c.json({ ok: true }));

  app.page("/", (c) => {
    return c.html(<StickerManagerPage />);
  });

  registerStickerRoutes(app, dbState);

  return {
    ...mockApp,
    seed: async () => {
      seed(db, { dbPath, stickerDir });
    },
  };
}

if (import.meta.main) {
  const config = resolveConfig();
  const app = createChatApp({ dbPath: config.dbPath, stickerDir: config.stickerDir });
  startServer(app);
}
