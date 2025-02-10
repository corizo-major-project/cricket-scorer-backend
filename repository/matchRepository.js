const Match = require('../models/Match');
const logger = require('../connectors/logger');

exports.getMatchesAtTime = async (matchDateAndTime, playerIds) => {
    try {
        logger.info("matchRepository.getMatchesAtTime START");
        const matches = await Match.find({
            matchDateAndTime: matchDateAndTime,
            $or: [
                { "teamA.players": { $in: playerIds } },
                { "teamB.players": { $in: playerIds } }
            ]
        });
        logger.info("matchRepository.getMatchesAtTime END");
        return matches;
    }
    catch(err) {
        logger.error("Error in getMatchesAtTime:", err);
        throw err;
    }
};

exports.createMatch = async (match) => {
    try {
        logger.info("matchRepository.createMatch START");
        await Match.create(match);
        logger.info("matchRepository.createMatch END");
        return match;
    }
    catch(err) {
        logger.error("Error in createMatch:", err);
        throw err;
    }
}

exports.getMatches = async (userName, matchType) => {
    try {
        logger.info("matchRepository.getMatches START");

        const matches = await Match.find({ userName: userName, matchTimeStatus: matchType });

        // Transform the data based on matchType
        const transformedMatches = matches.map(match => {
            let response = {
                matchId: match._id,
                matchType: match.matchType,
                overs: match.overs,
                venue: match.venue,
                matchTimeStatus: match.matchTimeStatus,
                matchDateAndTime: match.matchDateAndTime,
                createdAt: match.createdAt,
                teamA: {
                    teamId: match.teamA.teamId,
                    teamName: match.teamA.teamName
                },
                teamB: {
                    teamId: match.teamB.teamId,
                    teamName: match.teamB.teamName
                }
            };

            // Add fields based on matchType
            if (matchType === "ENDED") {
                response.innings = match.innings;
                response.winningTeam = match.winningTeam;
                response.winMargin = match.winMargin;
            } 
            else if (matchType === "LIVE") {
                response.toss = match.toss;
                response.currentInning = match.currentInning;
                response.innings = match.innings;
            }

            return response;
        });

        logger.info("matchRepository.getMatches END");
        return transformedMatches;
    }
    catch (err) {
        logger.error("Error in getMatches:", err);
        throw err;
    }
};

