"""Minimal calendar-app — Flask backend serving HTML + JSON API on a single port."""

import json

from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///calendar_app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
CORS(app)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.String(40), nullable=False)  # ISO datetime
    end_time = db.Column(db.String(40), nullable=False)  # ISO datetime
    day_key = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD
    attendees = db.Column(db.Text, default="[]")  # JSON string list
    busy = db.Column(db.Boolean, default=True)
    location = db.Column(db.String(255), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "day_key": self.day_key,
            "attendees": json.loads(self.attendees or "[]"),
            "busy": bool(self.busy),
            "location": self.location,
        }


with app.app_context():
    db.create_all()


INDEX_HTML = """<!doctype html>
<html><head><meta charset="utf-8"><title>My Calendar</title>
<style>
body { font-family: -apple-system, system-ui, sans-serif; max-width: 920px; margin: 24px auto; padding: 0 16px; color: #222; }
h1 { margin: 0 0 12px; }
.day { background: #f6f7f9; border: 1px solid #e1e3e8; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
.day h2 { margin: 0 0 8px; font-size: 16px; }
.event { padding: 6px 0; border-bottom: 1px solid #eee; }
.event:last-child { border-bottom: none; }
.time { color: #666; font-weight: 600; min-width: 130px; display: inline-block; }
.title { font-weight: 600; }
.busy { color: #c0392b; font-size: 12px; margin-left: 6px; }
.free { color: #2c8a4a; font-size: 12px; margin-left: 6px; }
.attendees { color: #555; font-size: 12px; margin-left: 6px; }
.loc { color: #888; font-size: 12px; margin-left: 6px; }
.subtitle { color: #777; margin-bottom: 18px; font-size: 13px; }
</style></head>
<body>
<h1>My Calendar</h1>
<p class="subtitle">Showing every scheduled event. Use the /api/events endpoint for JSON.</p>
{% for day, events in days %}
  <div class="day">
    <h2>{{ day }}</h2>
    {% for e in events %}
      <div class="event">
        <span class="time">{{ e.start_time[11:16] }}-{{ e.end_time[11:16] }}</span>
        <span class="title">{{ e.title }}</span>
        {% if e.busy %}<span class="busy">[busy]</span>{% else %}<span class="free">[free]</span>{% endif %}
        {% if e.location %}<span class="loc">@ {{ e.location }}</span>{% endif %}
        {% if e.attendees %}<span class="attendees">attendees: {{ e.attendees | join(', ') }}</span>{% endif %}
      </div>
    {% endfor %}
  </div>
{% endfor %}
</body></html>
"""


@app.route("/", methods=["GET"])
def index():
    events = Event.query.order_by(Event.start_time.asc()).all()
    grouped = {}
    for e in events:
        grouped.setdefault(e.day_key, []).append(e.to_dict())
    days = sorted(grouped.items(), key=lambda kv: kv[0])
    return render_template_string(INDEX_HTML, days=days)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/events", methods=["GET"])
def list_events():
    q = Event.query
    from_d = request.args.get("from")
    to_d = request.args.get("to")
    if from_d:
        q = q.filter(Event.day_key >= from_d)
    if to_d:
        q = q.filter(Event.day_key <= to_d)
    return jsonify(
        {"events": [e.to_dict() for e in q.order_by(Event.start_time.asc()).all()]}
    )


@app.route("/api/events", methods=["POST"])
def create_event():
    data = request.get_json() or {}
    e = Event(
        title=data.get("title", "Untitled"),
        start_time=data["start_time"],
        end_time=data["end_time"],
        day_key=data.get("day_key") or data["start_time"][:10],
        attendees=json.dumps(data.get("attendees", [])),
        busy=bool(data.get("busy", True)),
        location=data.get("location", ""),
    )
    db.session.add(e)
    db.session.commit()
    return jsonify({"event": e.to_dict()}), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=False)
