const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true },
    roleAsBatsman: {
        type: String,
        enum: ["RHB", "LHB"],
        required: true,
        default: "RHB"
    },
    roleAsBowler: {
        type: String,
        enum: ["Right-Arm Fast", "Left-Arm Fast",
            "Right-Arm Fast-Medium", "Left-Arm Fast-Medium",
            "Right-Arm Medium", "Left-Arm Medium",
            "Right-Arm Off-Spinner", "Left-Arm Off-Spinner",
            "Left-Arm Orthodox Spinner", "Right-Arm Orthodox Spinner",
        ],
        required: true,
        default: "Right-Arm Fast"
    },
    matchesPlayed: { type: Number, default: 0 },
    totalRunsScored: { type: Number, default: 0},
    totalWicketsTaken: { type: Number, default: 0 },
    battingStats: {
        matches: { type: Number, default: 0 },
        innings: { type: Number, default: 0 },
        notOut: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        highestRuns: { type: Number, default: 0 },
        avg: { type: Number, default: 0 }, // Batting average
        sr: { type: Number, default: 0 }, // Strike rate
        "30s": { type: Number, default: 0 },
        "50s": { type: Number, default: 0 },
        "100s": { type: Number, default: 0 },
        "4s": { type: Number, default: 0 },
        "6s": { type: Number, default: 0 },
        ducks: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        loss: { type: Number, default: 0 },
    },
    bowlingStats: {
        matches: { type: Number, default: 0 },
        innings: { type: Number, default: 0 },
        overs: { type: Number, default: 0 },
        maidens: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        bestBowling: { type: String, default: "0/0" }, // Example format: "5/32"
        "3wicket": { type: Number, default: 0 },
        "5wicket": { type: Number, default: 0 },
        "10wicket": { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        sr: { type: Number, default: 0 }, // Strike rate
        avg: { type: Number, default: 0 }, // Bowling average
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        dotBalls: { type: Number, default: 0 },
        "4s": { type: Number, default: 0 }, // Boundaries conceded
        "6s": { type: Number, default: 0 }, // Sixes conceded
    },
    fieldingStats: {
        matches: { type: Number, default: 0 },
        catches: { type: Number, default: 0 },
        caughtBehind: { type: Number, default: 0 }, // Catches as a wicketkeeper
        runOut: { type: Number, default: 0 },
        stumpings: { type: Number, default: 0 },
        assistedRunOuts: { type: Number, default: 0 },
    },
    captainRole: {
        matches: { type: Number, default: 0 },
        tossWon: { type: Number, default: 0 },
        matchesWon: { type: Number, default: 0 },
        matchesLost: { type: Number, default: 0 },
        winPercentage: { type: Number, default: 0 },
        lossPercentage: { type: Number, default: 0 },
    },
    teamsPlayedIn: [{
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
        teamName: { type: String },
        matchesPlayedForTeam: { type: Number, default: 0 },
    }],
    // matchesPlayedFor: [{
    //     matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'matches' },
    //     matchLocation: { type: String },
    //     groundName: { type: String },
    //     matchDate: { type: Date },
    //     teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
    //     teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'teams' },
    //     winningTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', default: null }, // Winning team reference
    //     winMargin: { type: String, default: "" }, 
    // }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: String },
    updatedAt: { type: String },
});

const Player= mongoose.model('players', playerSchema);

module.exports = Player;