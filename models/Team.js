const mongoose = require('mongoose');
const { generateTimeStamp } = require('../util/dateAndTimeUtil');

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    location: { type: String, required: true },
    members: [{
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
        name: { type: String }, 
    }],
    matches: {
        upcoming: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        lost: { type: Number, default: 0 },
        tie: { type: Number, default: 0 },
        drawn: { type: Number, default: 0 },
        NR: { type: Number, default: 0 }, // No Result
    },
    winPercentage: { type: Number, default: 0 },
    tossWon: { type: Number, default: 0 },
    batFirst: { type: Number, default: 0 },
    fieldFirst: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: generateTimeStamp() },
    updatedAt: { type: String },
});

const Team = mongoose.model('teams', teamSchema);

module.exports = Team;