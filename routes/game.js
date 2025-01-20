const express = require('express');
const Game = require('../models/Game');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Function to check if there's a winner in the game.
 * @param {Array} moves - The list of moves made in the game.
 * @returns {String|null} - Returns 'Player1', 'Player2', or null if no winner.
 */
function checkWin(moves) {
    const winningCombinations = [
        [0, 1, 2], // Row 1
        [3, 4, 5], // Row 2
        [6, 7, 8], // Row 3
        [0, 3, 6], // Column 1
        [1, 4, 7], // Column 2
        [2, 5, 8], // Column 3
        [0, 4, 8], // Diagonal 1
        [2, 4, 6], // Diagonal 2
    ];

    // Create a board representation based on moves
    const board = Array(9).fill(null);
    moves.forEach(move => {
        board[move.position] = move.player;
    });

    // Check if any winning combination is satisfied
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return the winner ('Player1' or 'Player2')
        }
    }

    return null; // No winner
}

// Start Game
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const { opponentId } = req.body;
        if (!opponentId) return res.status(400).send('Opponent ID is required');

        const newGame = new Game({ player1: req.userId, player2: opponentId });
        await newGame.save();

        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).send('Error starting game');
    }
});

// Make Move
router.post('/move/:gameId', authMiddleware, async (req, res) => {
    try {
        const { gameId } = req.params;
        const { position } = req.body;

        const game = await Game.findById(gameId);
        if (!game || game.status === 'Completed') {
            return res.status(400).send('Invalid or completed game');
        }

        if (game.moves.some(move => move.position === position)) {
            return res.status(400).send('Position already taken');
        }

        const currentPlayer = game.moves.length % 2 === 0 ? 'Player1' : 'Player2';
        if (
            (currentPlayer === 'Player1' && game.player1.toString() !== req.userId) ||
            (currentPlayer === 'Player2' && game.player2.toString() !== req.userId)
        ) {
            return res.status(403).send('Not your turn');
        }

        // Add the move
        game.moves.push({ position, player: currentPlayer });

        // Check for a winner
        const winner = checkWin(game.moves);
        if (winner) {
            game.status = 'Completed';
            game.winner = winner;
        } else if (game.moves.length === 9) {
            // Check for a draw
            game.status = 'Completed';
            game.winner = 'Draw';
        }

        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).send('Error making move');
    }
});

// Fetch History
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const games = await Game.find({
            $or: [{ player1: req.userId }, { player2: req.userId }],
        });
        res.status(200).json(games);
    } catch (error) {
        res.status(500).send('Error fetching history');
    }
});

// Request a Rematch
router.post('/rematch/:gameId', authMiddleware, async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).send('Game not found');
        }

        if (game.status !== 'Completed') {
            return res.status(400).send('Game is not completed');
        }

        // Check if a rematch is already requested
        if (game.rematch.requestedBy && !game.rematch.accepted) {
            return res.status(400).send('Rematch already requested');
        }

        // Mark rematch as requested
        game.rematch = { requestedBy: req.userId, accepted: false };
        await game.save();

        res.status(200).json({ message: 'Rematch requested', game });
    } catch (error) {
        res.status(500).send('Error requesting rematch');
    }
});

// Accept a Rematch
// Accept a Rematch
router.post('/rematch/accept/:gameId', authMiddleware, async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).send('Game not found');
        }

        if (!game.rematch.requestedBy) {
            return res.status(400).send('No rematch requested');
        }

        if (game.rematch.accepted) {
            return res.status(400).send('Rematch already accepted');
        }

        if (![game.player1.toString(), game.player2.toString()].includes(req.userId)) {
            return res.status(403).send('You are not a participant in this game');
        }

        // Mark rematch as accepted
        game.rematch.accepted = true;

        // Reset game moves, winner, and status for the new game
        game.moves = [];
        game.winner = null;
        game.status = 'In Progress';
        game.rematch.requestedBy = null;  // Reset rematch request

        // Save the updated game
        await game.save();

        // Optionally, you can also start a new game if needed or provide a new game instance.
        // For example, you could return the updated game or just respond with success.
        
        res.status(200).json({
            message: 'Rematch accepted. Game has restarted.',
            game
        });
    } catch (error) {
        res.status(500).send('Error accepting rematch');
    }
});


// Fetch Rematch Status
router.get('/rematch/status/:gameId', authMiddleware, async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).send('Game not found');
        }

        res.status(200).json({
            rematchRequestedBy: game.rematch.requestedBy,
            rematchAccepted: game.rematch.accepted,
        });
    } catch (error) {
        res.status(500).send('Error fetching rematch status');
    }
});

module.exports = router;
