# PengDuel

PengDuel is a web-based two-player penguin fighting game built using Flask and JavaScript with HTML5 Canvas.

## Features

- Single-player mode against AI
- Two-player mode
- Power-ups and obstacles
- Leaderboard to track wins
- Customizable game constants

## Prerequisites

- Python 3.7+
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pengduel.git
   cd pengduel
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=your_database_url_here
   ```

## Running the Application

### Development

To run the application in development mode:

```
python main.py
```

The application will be available at `http://localhost:5000`.

### Production

For production deployment, we recommend using Gunicorn as the WSGI server:

1. Install Gunicorn:
   ```
   pip install gunicorn
   ```

2. Run the application:
   ```
   gunicorn -w 4 -b 0.0.0.0:5000 main:app
   ```

   This command starts 4 worker processes and binds the application to all network interfaces on port 5000.

## Deployment

This application is ready for deployment on platforms like Heroku, AWS, or DigitalOcean. Make sure to set the necessary environment variables on your deployment platform.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
