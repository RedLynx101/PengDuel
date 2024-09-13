# PengDuel
**PengDuel** is a fun and interactive browser-based game where penguins battle it out on an iceberg! Choose between single-player mode against an AI opponent or challenge a friend in two-player mode. Customize your penguin, collect power-ups, and knock your opponent off the iceberg to win! Made it as a test, for fun.

## Features
- **Single-Player and Two-Player Modes:** Play against an AI penguin or with a friend.
- **Customizable Penguins:** Choose your penguin's name and color.
- **Power-Ups:** Collect speed boosts and size increases to gain an advantage.
- **Adjustable Game Settings:** Modify iceberg size, penguin size, friction, and push force.
- **Sound Effects and Music:** Enjoy immersive audio with background music and sound effects.
- **Leaderboard:** Keep track of wins for each player.
## Technologies Used
- **Flask:** Backend framework for serving the game.
- **JavaScript (ES6 Modules):** Game logic and interactivity.
- **HTML5 Canvas:** Rendering game graphics.
- **CSS:** Styling the game interface.
- **SVG Graphics:** For funny penguin images.
- **Web Audio API:** Managing game sound effects and music.

## Installation
1. Clone the Repository
    ~~~
    git clone https://github.com/redlynx101/pengduel.git
    cd pengduel
    ~~~
2. Create a Virtual Environment
    ~~~
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ~~~
3. Install Dependencies
    ~~~
    pip install -r requirements.txt
    ~~~
4. Run the Flask App
    ~~~
    flask run
    ~~~
5. Open in Browser

    Visit **http://localhost:5000** in your web browser to start playing!

## How to Play
### Controls
#### Player 1
Move Up: W
Move Down: S
Move Left: A
Move Right: D
#### Player 2 (Two-Player Mode)
Move Up: ↑
Move Down: ↓
Move Left: ←
Move Right: →
Start/Restart Game: Spacebar or click the on-screen buttons.
### Objective
Knock your opponent off the iceberg!
Use your movement keys to build momentum.
Collide with your opponent to push them.
Be careful not to slide off the edge yourself!
### Power-Ups
Collect power-ups that appear randomly on the iceberg to gain temporary advantages.

- **Speed Boost:** Increases acceleration and reduces size.
- **Size Increase:** Makes your penguin bigger and heavier.

### Adjustable Game Settings
Click the "Toggle Game Constants Menu" to adjust:

- Iceberg Radius
- Penguin Radius
- Push Force
- Friction
- These settings allow you to customize the gameplay experience.

## Acknowledgments
- **Sounds and Music:** Thanks to pixabay.com for sound effects. Thanks to Suno for the AI-generated music. 
- **SVG Penguin Image:** Courtesy of AI.
- **Frameworks and Libraries:**
  - Flask
  - Web Audio API
## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.

Enjoy playing PengDuel! If you have any questions or feedback, feel free to reach out.
