from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Player model
class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    wins = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<Player {self.name}>'

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/leaderboard")
def leaderboard():
    players = Player.query.order_by(Player.wins.desc()).all()
    return render_template("leaderboard.html", players=players)

@app.route("/record_win", methods=['POST'])
def record_win():
    data = request.json
    player_name = data['player_name']
    
    player = Player.query.filter_by(name=player_name).first()
    if player:
        player.wins += 1
    else:
        player = Player(name=player_name, wins=1)
        db.session.add(player)
    
    db.session.commit()
    return jsonify({"success": True})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
