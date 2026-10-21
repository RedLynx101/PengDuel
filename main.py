from pathlib import Path

from flask import Flask, send_from_directory

ROOT = Path(__file__).resolve().parent

# The game is a static page; Flask only serves it (Replit/Gunicorn). GitHub Pages serves the
# same index.html and static/ folder directly.
app = Flask(__name__, static_folder=str(ROOT / "static"), static_url_path="/static")


@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
