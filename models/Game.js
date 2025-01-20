const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moves: [{ position: Number, player: String }],
    winner: { type: String, enum: ['Player1', 'Player2', 'Draw', null], default: null },
    status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
    rematch: {
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who requested rematch
        accepted: { type: Boolean, default: false }, // Whether the rematch is accepted
    },
});

module.exports = mongoose.models.Game || mongoose.model('Game', gameSchema);
