const mongoose = require('mongoose');
const { generateTimeStamp } = require('../util/dateAndTimeUtil');

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    location: { type: String, required: true },
    members: [{
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
        userName: { type: String },
        name: { type: String },
        age: { type: Number },
        location: { type: String },
        roleAsBatsman: { type: String },
        roleAsBowler: { type: String },
    }],
    userName: { type: String, required: true },
    stats: {
        matches: { type: Number, default: 0 },
        upcoming: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        lost: { type: Number, default: 0 },
        tie: { type: Number, default: 0 },
        drawn: { type: Number, default: 0 },
        NR: { type: Number, default: 0 }, // No Result
        winPercentage: { type: Number, default: 0 },
        tossWon: { type: Number, default: 0 },
        batFirst: { type: Number, default: 0 },
        fieldFirst: { type: Number, default: 0 },
    },
    matches: [{
        matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'matches' },
        matchVenue: { type: String },
        matchType: { type: String },
        matchOvers: { type: Number },
        matchTimeStatus: { type: String },
        matchDateAndTime: { type: String },
        matchDate: { type: Date },
        teamA: { 
            teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
            teamName: { type: String },
        },
        teamB: { 
            teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
            teamName: { type: String },
        },
        winningTeam: { 
            teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'teams', default: null },
            teamName: { type: String, default: null },
        },
        winMargin: { type: String, default: "" },
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: generateTimeStamp() },
    updatedAt: { type: String },
});

const Team = mongoose.model('teams', teamSchema);

module.exports = Team;