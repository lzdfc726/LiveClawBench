"""Minimal expense-app -- Flask backend on port 5180 serving HTML + JSON API."""
import os
from datetime import datetime

from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
_HERE = os.path.dirname(os.path.abspath(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{_HERE}/expense_app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
CORS(app)


class ExpenseDraft(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vendor_name = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(8), default="USD")
    invoice_date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD
    attachment_ref = db.Column(db.String(255), default="")
    status = db.Column(db.String(20), default="draft")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "vendor_name": self.vendor_name,
            "amount": self.amount,
            "currency": self.currency,
            "invoice_date": self.invoice_date,
            "attachment_ref": self.attachment_ref,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


with app.app_context():
    db.create_all()


INDEX_HTML = """<!doctype html>
<html><head><meta charset="utf-8"><title>Expense Drafts</title>
<style>
body { font-family: -apple-system, system-ui, sans-serif; max-width: 980px; margin: 24px auto; padding: 0 16px; color: #222; }
h1 { margin: 0 0 12px; }
form { background: #f6f7f9; border: 1px solid #e1e3e8; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
label { display: block; font-size: 13px; color: #555; margin-top: 8px; }
input { width: 100%; padding: 6px 8px; box-sizing: border-box; }
button { margin-top: 12px; padding: 7px 14px; background: #1466ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px; }
th, td { padding: 6px 8px; border-bottom: 1px solid #eee; text-align: left; }
.subtitle { color: #777; font-size: 13px; }
</style></head>
<body>
<h1>Expense Drafts</h1>
<p class="subtitle">Submit a new reimbursement draft. Drafts are persisted in this service's SQLite DB and are visible to the verifier.</p>
<form method="POST" action="/api/drafts" enctype="application/x-www-form-urlencoded" onsubmit="postJson(event)">
  <label>Vendor name<input name="vendor_name" required></label>
  <label>Amount<input name="amount" type="number" step="0.01" required></label>
  <label>Currency<input name="currency" value="USD"></label>
  <label>Invoice date (YYYY-MM-DD)<input name="invoice_date" required></label>
  <label>Attachment reference<input name="attachment_ref"></label>
  <button type="submit">Create Draft</button>
</form>
<h2>Existing drafts</h2>
{% if drafts %}
<table>
  <thead><tr><th>ID</th><th>Vendor</th><th>Amount</th><th>Currency</th><th>Invoice date</th><th>Attachment</th><th>Status</th></tr></thead>
  <tbody>
  {% for d in drafts %}
    <tr>
      <td>{{ d.id }}</td><td>{{ d.vendor_name }}</td><td>{{ d.amount }}</td><td>{{ d.currency }}</td>
      <td>{{ d.invoice_date }}</td><td>{{ d.attachment_ref }}</td><td>{{ d.status }}</td>
    </tr>
  {% endfor %}
  </tbody>
</table>
{% else %}
  <p class="subtitle">(no drafts yet)</p>
{% endif %}
<script>
async function postJson(ev) {
  ev.preventDefault();
  const form = ev.target;
  const fd = new FormData(form);
  const payload = {
    vendor_name: fd.get("vendor_name"),
    amount: parseFloat(fd.get("amount")),
    currency: fd.get("currency") || "USD",
    invoice_date: fd.get("invoice_date"),
    attachment_ref: fd.get("attachment_ref") || "",
  };
  const res = await fetch("/api/drafts", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  if (res.ok) location.reload();
  else alert("Failed: " + await res.text());
}
</script>
</body></html>
"""


@app.route("/", methods=["GET"])
def index():
    drafts = ExpenseDraft.query.order_by(ExpenseDraft.created_at.desc()).all()
    return render_template_string(INDEX_HTML, drafts=[d.to_dict() for d in drafts])


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/drafts", methods=["GET"])
def list_drafts():
    drafts = ExpenseDraft.query.order_by(ExpenseDraft.created_at.desc()).all()
    return jsonify({"drafts": [d.to_dict() for d in drafts]})


@app.route("/api/drafts", methods=["POST"])
def create_draft():
    data = request.get_json(force=True, silent=True) or {}
    if not data.get("vendor_name") or data.get("amount") is None or not data.get("invoice_date"):
        return jsonify({"error": "vendor_name, amount, invoice_date are required"}), 400
    d = ExpenseDraft(
        vendor_name=data["vendor_name"],
        amount=float(data["amount"]),
        currency=data.get("currency", "USD"),
        invoice_date=data["invoice_date"],
        attachment_ref=data.get("attachment_ref", ""),
        status=data.get("status", "draft"),
    )
    db.session.add(d)
    db.session.commit()
    return jsonify({"draft": d.to_dict()}), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5180, debug=False)
