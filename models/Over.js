const mongoose = require('mongoose');

const overSchema = new mongoose.Schema({
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    inningNumber: { type: Number, required: true }, 
    overNumber: { type: Number, required: true },
    bowler: {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players', required: true },
        name: { type: String, required: true }
    },
    deliveries: [
        {
            ballNumber: { type: Number, required: true },
            batsman: {
                playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players', required: true },
                name: { type: String, required: true }
            },
            runs: { type: Number, required: true },
            commentary: { type: String },
            extra: {
                type: String,
                enum: ["NONE", "WIDE", "NO BALL", "BYE", "LEG BYE"],
                default: "NONE"
            },
            wicket: {
                isWicket: { type: Boolean, default: false },
                type: { 
                    type: String, 
                    enum: ["BOWLED", "CAUGHT", "LBW", "RUN OUT", "STUMPED", "HIT WICKET", "NONE"],
                    default: "NONE"
                },
                dismissedBatsman: {
                    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
                    name: { type: String }
                }
            }
        }
    ],
    history: [{ type: mongoose.Schema.Types.Mixed }], // Store previous deliveries for undo
    redoStack: [{ type: mongoose.Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now }
});

const Over = mongoose.model('Over', overSchema);
module.exports = Over;
