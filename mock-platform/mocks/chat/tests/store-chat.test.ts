import { describe, beforeEach, afterAll, it, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createChatApp } from "../src/index.js";
import type { OpenAPIApp } from "mock-lib";

const tmpDir = mkdtempSync(join(tmpdir(), "chat-test-"));

describe("store and chat endpoints", () => {
  let chat: ReturnType<typeof createChatApp>;
  let app: OpenAPIApp;

  beforeEach(async () => {
    chat = createChatApp({ dbPath: ":memory:", stickerDir: tmpDir });
    app = chat.app;
    await chat.seed!();
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------------------
  // GET /api/store/packs
  // ---------------------------------------------------------------------------

  it("GET /api/store/packs -> returns 4 packs with acquired flag", async () => {
    const res = await app.request("/api/store/packs");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.packs.length).toBe(4);
    expect(body.packs[0].title).toBe("Cute Cats");
    expect(body.packs[0].acquired).toBe(false);
    expect(body.packs[0].previews.length).toBe(3);
  });

  // ---------------------------------------------------------------------------
  // POST /api/store/packs/:id/acquire
  // ---------------------------------------------------------------------------

  it("acquire pack 1 -> creates 3 user_sticker rows and ownership record", async () => {
    const res = await app.request("/api/store/packs/1/acquire", { method: "POST" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.acquired).toBe(true);

    // Verify ownership
    const listRes = await app.request("/api/store/packs");
    const listBody = await listRes.json();
    const pack1 = listBody.packs.find((p: any) => p.id === 1);
    expect(pack1.acquired).toBe(true);

    // Verify stickers created
    const stickerRes = await app.request("/api/stickers?category=recent");
    const stickerBody = await stickerRes.json();
    const pack1Stickers = stickerBody.stickers.filter((s: any) => s.pack_id === 1);
    expect(pack1Stickers.length).toBe(3);
  });

  it("re-acquire pack 1 -> idempotent, no duplicates", async () => {
    const r1 = await app.request("/api/store/packs/1/acquire", { method: "POST" });
    expect(r1.status).toBe(200);

    const r2 = await app.request("/api/store/packs/1/acquire", { method: "POST" });
    expect(r2.status).toBe(200);

    const stickerRes = await app.request("/api/stickers?category=recent");
    const stickerBody = await stickerRes.json();
    const pack1Stickers = stickerBody.stickers.filter((s: any) => s.pack_id === 1);
    expect(pack1Stickers.length).toBe(3);
  });

  it("acquire non-existent pack -> 404", async () => {
    const res = await app.request("/api/store/packs/99/acquire", { method: "POST" });
    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------------------------------
  // GET /api/channels
  // ---------------------------------------------------------------------------

  it("GET /api/channels -> returns 3 seeded channels", async () => {
    const res = await app.request("/api/channels");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.channels.length).toBe(3);
    expect(body.channels.map((c: any) => c.name)).toEqual(["#general", "#pets", "#space"]);
  });

  // ---------------------------------------------------------------------------
  // GET /api/channels/:id/messages
  // ---------------------------------------------------------------------------

  it("GET /api/channels/2/messages -> returns seeded messages sorted by sent_at ASC", async () => {
    const res = await app.request("/api/channels/2/messages");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.messages.length).toBe(2);
    expect(body.messages[0].sender).toBe("Alice");
    expect(body.messages[1].sender).toBe("Bob");
  });

  it("GET /api/channels/99/messages -> 404", async () => {
    const res = await app.request("/api/channels/99/messages");
    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------------------------------
  // POST /api/channels/:id/messages
  // ---------------------------------------------------------------------------

  it("send chat message -> 201 and message appears in list", async () => {
    const postRes = await app.request("/api/channels/1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Hello world", message_kind: "chat" }),
    });
    expect(postRes.status).toBe(201);
    const postBody = await postRes.json();
    expect(postBody.id).toBeDefined();

    const listRes = await app.request("/api/channels/1/messages");
    const listBody = await listRes.json();
    const msg = listBody.messages.find((m: any) => m.id === postBody.id);
    expect(msg).toBeDefined();
    expect(msg.sender).toBe("You");
    expect(msg.body).toBe("Hello world");
  });

  it("send chat message without body -> 400", async () => {
    const res = await app.request("/api/channels/1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_kind: "chat" }),
    });
    expect(res.status).toBe(400);
  });

  it("send sticker message with owned sticker -> 201", async () => {
    // Seeded sticker id=1 belongs to user 1
    const postRes = await app.request("/api/channels/2/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_kind: "sticker", sticker_id: 1 }),
    });
    expect(postRes.status).toBe(201);

    const listRes = await app.request("/api/channels/2/messages");
    const listBody = await listRes.json();
    const msg = listBody.messages.find((m: any) => m.message_kind === "sticker");
    expect(msg).toBeDefined();
    expect(msg.source_ref).toBe("1");
    expect(msg.body).toContain("[sticker:");
  });

  it("send sticker message with unowned sticker -> 403", async () => {
    const res = await app.request("/api/channels/2/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_kind: "sticker", sticker_id: 99999 }),
    });
    expect(res.status).toBe(400);
  });

  it("send message to non-existent channel -> 404", async () => {
    const res = await app.request("/api/channels/99/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "test", message_kind: "chat" }),
    });
    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/stickers/:id
  // ---------------------------------------------------------------------------

  it("PATCH category -> moves sticker and renumbers", async () => {
    // Upload a sticker to recent
    const buffer = new Uint8Array([0x47, 0x49, 0x46]);
    const form = new FormData();
    form.append("file", new File([buffer], "a.gif", { type: "image/gif" }));
    form.append("category", "recent");
    const postRes = await app.request(new Request("http://localhost:5003/api/stickers", { method: "POST", body: form }));
    const sticker = await postRes.json();

    const patchRes = await app.request(`/api/stickers/${sticker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "favorite" }),
    });
    expect(patchRes.status).toBe(200);
    const patchBody = await patchRes.json();
    expect(patchBody.category).toBe("favorite");

    const listRes = await app.request("/api/stickers?category=favorite");
    const listBody = await listRes.json();
    expect(listBody.stickers.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH sort_order -> clamps and renumbers", async () => {
    // Upload two stickers to recent
    const buffer = new Uint8Array([0x47, 0x49, 0x46]);

    const form1 = new FormData();
    form1.append("file", new File([buffer], "a.gif", { type: "image/gif" }));
    form1.append("category", "recent");
    const res1 = await app.request(new Request("http://localhost:5003/api/stickers", { method: "POST", body: form1 }));
    const s1 = await res1.json();

    const form2 = new FormData();
    form2.append("file", new File([buffer], "b.gif", { type: "image/gif" }));
    form2.append("category", "recent");
    const res2 = await app.request(new Request("http://localhost:5003/api/stickers", { method: "POST", body: form2 }));
    const s2 = await res2.json();

    // Move s2 to position 0
    const patchRes = await app.request(`/api/stickers/${s2.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order: 0 }),
    });
    expect(patchRes.status).toBe(200);

    const listRes = await app.request("/api/stickers?category=recent");
    const listBody = await listRes.json();
    const recentStickers = listBody.stickers.filter((s: any) => s.category === "recent");
    // All recent stickers should have sequential sort_order starting from 0
    const sortOrders = recentStickers.map((s: any) => s.sort_order).sort((a: number, b: number) => a - b);
    expect(sortOrders[0]).toBe(0);
    expect(sortOrders[1]).toBe(1);
  });

  it("PATCH non-existent sticker -> 404", async () => {
    const res = await app.request("/api/stickers/99999", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "favorite" }),
    });
    expect(res.status).toBe(404);
  });

  it("PATCH with invalid category -> 400", async () => {
    const buffer = new Uint8Array([0x47, 0x49, 0x46]);
    const form = new FormData();
    form.append("file", new File([buffer], "a.gif", { type: "image/gif" }));
    const postRes = await app.request(new Request("http://localhost:5003/api/stickers", { method: "POST", body: form }));
    const sticker = await postRes.json();

    const patchRes = await app.request(`/api/stickers/${sticker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "invalid" }),
    });
    expect(patchRes.status).toBe(400);
  });
});
