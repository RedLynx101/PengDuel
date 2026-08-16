# PengDuel

PengDuel is a small browser physics game maintained by Noah Hicks. Two penguins share an iceberg;
the first one pushed beyond the edge loses the round. The Flask server delivers the page while the
game loop, collision physics, AI opponent, power-ups, sound, and drawing run in the browser with
JavaScript and HTML Canvas.

Play the public build: <https://peng-duel-noahhicks101.replit.app/>

## What works

- single-player rounds against a lightweight steering AI;
- local two-player rounds using one keyboard;
- collision-based pushing and friction;
- speed and size power-ups;
- a session-only score that resets when the page reloads; and
- adjustable iceberg, penguin, force, and friction values.

This is a compact game prototype, not an account-backed or persistent multiplayer service. The
score is kept in browser memory, and two-player mode is local to one keyboard.

## Controls

- Player 1: `W`, `A`, `S`, `D`
- Player 2: arrow keys
- Start a configured round: **Start game**
- Restart after a round: **Restart round**

## Run locally

### Poetry

```powershell
poetry install
poetry run python main.py
```

### Standard Python environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install "flask==3.0.3"
python main.py
```

Open <http://127.0.0.1:5000>. The production process uses `gunicorn wsgi:app` on platforms that
support Gunicorn.

## Verify the server surface

```powershell
python -m unittest discover -s tests -v
```

The test checks that the Flask route loads and exposes the expected game modes, canvas, and control
instructions. Gameplay still requires a real browser because it depends on Canvas, audio, animation
frames, and keyboard input.

## Authorship and assets

The repository is maintained under Noah Hicks's GitHub account, and its history includes
Replit Agent-assisted iterations. The bundled SVG and audio files are part of the current public
build, but their original provenance is not documented well enough to grant downstream reuse
rights. Treat them as demonstration assets unless that provenance is resolved.

## Public access and reuse

The source is publicly viewable. The repository does not currently contain a license file, so it
should not be described as MIT licensed and public visibility should not be interpreted as broad
reuse permission.
