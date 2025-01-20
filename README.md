# tictactoe-backend

This is a backend server for a Tic-Tac-Toe game built using **Express.js**, **MongoDB**, and **JWT authentication**. The backend allows users to register, login, play games, and manage rematches with other players.

## Features

- **User Authentication**: Allows users to register, log in, and manage sessions using JWT tokens.
- **Game Creation and Management**: Users can start a game, make moves, and check game status.
- **Rematch Feature**: Once a game is completed, players can request and accept rematches.
- **Game History**: Users can fetch their game history to view completed games.
- **Winner Determination**: The backend automatically determines if a player has won or if the game ended in a draw.

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express.js**: Web framework for building the REST API.
- **MongoDB**: NoSQL database for storing user and game data.
- **Mongoose**: MongoDB ODM to interact with MongoDB.
- **JWT (JSON Web Tokens)**: For user authentication and session management.
- **Bcrypt.js**: For hashing user passwords securely.

## Setup Instructions

### Prerequisites

- **Node.js**: Install Node.js (version 14 or later) from [Node.js](https://nodejs.org/)
- **MongoDB**: You need a running MongoDB instance. You can set up MongoDB locally or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Environment Variables**: Ensure that the following environment variables are set up in your `.env` file:
  
  ```
  MONGO_URI=<your_mongodb_connection_string>
  JWT_SECRET=<your_jwt_secret_key>
  PORT=3000
  ```

### Steps to Run the Project Locally

1. **Clone the Repository:**

   ```
   git clone https://github.com/Dolaskeche23/tictactoe-backend.git
   cd tictactoe-backend
   ```

2. **Install Dependencies:**

   Run the following command to install the required dependencies:

   ```
   npm install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the root of the project and add your MongoDB URI and JWT Secret key:

   ```
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret_key>
   PORT=3000
   ```

4. **Start the Server:**

   Run the following command to start the server:

   ```
   npm start
   ```

   The server will be available on `http://localhost:3000`.

### API Endpoints

#### User Authentication

- **POST /api/auth/register**: Registers a new user.
  - Request body: `{ "username": "user1", "password": "password" }`
  - Response: `User registered successfully`

- **POST /api/auth/login**: Logs in an existing user and returns a JWT token.
  - Request body: `{ "username": "user1", "password": "password" }`
  - Response: `{ "token": "jwt_token", "userId": "user_id" }`

#### Game Management

- **POST /api/game/start**: Starts a new game between the authenticated user and an opponent.
  - Request body: `{ "opponentId": "opponent_user_id" }`
  - Response: New game object with details about the players.

- **POST /api/game/move/:gameId**: Makes a move in an ongoing game.
  - Request body: `{ "position": 4 }`
  - Response: Updated game state with the new move.

- **GET /api/game/history**: Fetches the authenticated user's game history.
  - Response: Array of completed games.

#### Rematch Feature

- **POST /api/game/rematch/:gameId**: Requests a rematch for a completed game.
  - Response: `{ "message": "Rematch requested", "game": game_object }`

- **POST /api/game/rematch/accept/:gameId**: Accepts a rematch for a completed game.
  - Response: `{ "message": "Rematch accepted. Game has restarted.", "game": game_object }`

- **GET /api/game/rematch/status/:gameId**: Fetches the rematch status for a specific game.
  - Response: `{ "rematchRequestedBy": "user_id", "rematchAccepted": true/false }`

## Project Structure

```
tictactoe-backend/
├── config/
│   └── db.js           # MongoDB connection configuration
├── models/
│   ├── Game.js         # Game schema and model
│   └── User.js         # User schema and model
├── routes/
│   ├── auth.js         # Authentication routes (register, login)
│   └── game.js         # Game-related routes (start game, make move, etc.)
├── middlewares/
│   └── authMiddleware.js # JWT authentication middleware
├── .env                # Environment variables (MONGO_URI, JWT_SECRET, etc.)
├── server.js           # Entry point for the Express server
├── package.json        # Project metadata and dependencies
└── README.md           # Project documentation
```

## How the Game Logic Works

- **Game Creation**: A new game is created when a user starts a game with another player. The game stores the player IDs, the moves made, the game status, and any rematch requests.
- **Making a Move**: Players make moves by sending their position on the 3x3 Tic-Tac-Toe grid. The server checks if the position is available and if it's the player's turn.
- **Winner Check**: After each move, the server checks if there is a winner using predefined winning combinations.
- **Rematch**: After the game ends, players can request a rematch, and if both agree, the game restarts.
