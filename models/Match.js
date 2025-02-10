const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    venue: { type: String, required: true },
    matchDateAndTime: { type: String, required: true },
    matchTimeStatus: {
        type: String,
        enum: ['LIVE', 'UPCOMING', 'ENDED', 'CANCELLED', 'NOT_STARTED'],
    },
    matchType: {
        type: String,
        enum: ['ODI', 'T20', 'CUSTOMIZED'],
        required: true

    },
    overs: { type: Number, required: true },
    teamA: {
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
        teamName: { type: String, required: true },
        captain: {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        },
        viceCaptain: {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        },
        scorer: {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        },
        playingMembers: [{
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        }],

    },
    teamB: {
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
        teamName: { type: String, required: true },
        captain: {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        },
        viceCaptain: {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        },
        scorer: {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        },
        playingMembers: [{
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'players' },
            userName: { type: String },
            name: { type: String },
        }],
    },
    toss: { type: String },
    currentInning: { type: Number, default: 1 },
    activeScorer: {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
        name: { type: String }
    },
    innings: [
        {
            inningNumber: { type: Number, required: true },
            battingTeam: {
                teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
                teamName: { type: String, required: true }
            },
            bowlingTeam: {
                teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
                teamName: { type: String, required: true }
            },
            oversPlayed: { type: Number, default: 0 },
            totalRuns: { type: Number, default: 0 },
            totalWickets: { type: Number, default: 0 },
            extras: { type: Number, default: 0 },
            inningsStartedAt: { type: String },
            inningsEndedAt: { type: String },
        }
    ],

    winningTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', default: null },
    winMargin: { type: String, default: "" },
    createdAt: { type: String },
    updatedAt: { type: String },
});

const Match = mongoose.model('matches', matchSchema);

module.exports = Match;