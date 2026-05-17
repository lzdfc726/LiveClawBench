/** @jsxImportSource hono/jsx */
/**
 * Sticker Manager page — WhatsApp-style green top bar + category grid + upload modal.
 */

const WHATSAPP_GREEN = "#25D366";

export function StickerManagerPage() {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sticker Manager</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f0f2f5;
            min-height: 100vh;
          }
          .top-bar {
            background: ${WHATSAPP_GREEN};
            color: white;
            padding: 16px 20px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .top-bar .logo {
            width: 28px;
            height: 28px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: ${WHATSAPP_GREEN};
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
          }
          .tab {
            padding: 8px 20px;
            border-radius: 20px;
            background: white;
            border: 1px solid #ddd;
            cursor: pointer;
            font-size: 14px;
            color: #555;
          }
          .tab.active {
            background: ${WHATSAPP_GREEN};
            color: white;
            border-color: ${WHATSAPP_GREEN};
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
          }
          .card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s;
          }
          .card:hover { transform: translateY(-2px); }
          .card.add {
            border: 2px dashed #ccc;
            color: #888;
          }
          .card.add .plus {
            font-size: 32px;
            color: ${WHATSAPP_GREEN};
            margin-bottom: 4px;
          }
          .modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            align-items: center;
            justify-content: center;
            z-index: 100;
          }
          .modal-overlay.open { display: flex; }
          .modal {
            background: white;
            border-radius: 16px;
            padding: 24px;
            width: 360px;
            max-width: 90vw;
          }
          .modal h3 {
            margin-bottom: 16px;
            font-size: 18px;
          }
          .modal input[type="file"] {
            margin-bottom: 16px;
            width: 100%;
          }
          .modal select {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ddd;
            margin-bottom: 16px;
            font-size: 14px;
          }
          .modal .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }
          .modal button {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          .modal .cancel {
            background: #eee;
            color: #555;
          }
          .modal .submit {
            background: ${WHATSAPP_GREEN};
            color: white;
          }
        `}</style>
      </head>
      <body>
        <div class="top-bar">
          <div class="logo">S</div>
          <span>Sticker Manager</span>
        </div>
        <div class="container">
          <div class="tabs">
            <div class="tab active">recent</div>
            <div class="tab">favorite</div>
            <div class="tab">custom</div>
          </div>
          <div class="grid" id="sticker-grid">
            <div class="card add" onclick="openModal()">
              <div class="plus">+</div>
              <div>Create</div>
            </div>
          </div>
        </div>
        <div class="modal-overlay" id="modal">
          <div class="modal">
            <h3>Upload Sticker</h3>
            <form id="upload-form" action="/api/stickers" method="post" enctype="multipart/form-data">
              <input type="file" name="file" accept="image/gif,image/png,image/jpeg" required />
              <select name="category">
                <option value="recent">Recent</option>
                <option value="favorite">Favorite</option>
                <option value="custom">Custom</option>
              </select>
              <div class="actions">
                <button type="button" class="cancel" onclick="closeModal()">Cancel</button>
                <button type="submit" class="submit">Upload</button>
              </div>
            </form>
          </div>
        </div>
        <script>{`
          function openModal() {
            document.getElementById('modal').classList.add('open');
          }
          function closeModal() {
            document.getElementById('modal').classList.remove('open');
          }
          document.getElementById('modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
          });
        `}</script>
      </body>
    </html>
  );
}
