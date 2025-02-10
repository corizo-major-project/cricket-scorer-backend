const logger = require("../connectors/logger");
const Match = require('../models/Match');
const { convertToTimestamp, generateTimeStamp } = require("../util/dateAndTimeUtil");
const teamRepository = require("../repository/teamRepository");
const matchRepository = require("../repository/matchRepository");
const playerRepository = require("../repository/playerRepository");
const { UNAUTHORIZED_USER, INVALID_OVERS_SELECTED, TEAMS_DO_NOT_EXISTS, DUPLICATE_PLAYERS_DETECTED, PLAYERS_DO_NOT_EXIST, MATCH_TIMINGS_CONFLICT_WITH_PLAYERS } = require("../constants/errorConstants");

exports.createMatchService = async (userNameAuth, req, res) => {
    try {
        logger.info("matchService.createMatchService START");
        const allowedFields = ["userName", "venue", "matchType", "overs", "matchDateAndTime", "teamA", "teamB"];
        const allowedTeamFields = ["teamId", "teamName", "captain", "viceCaptain", "playingMembers", "scorer"];

        const filterObject = (obj, allowedKeys) =>
            Object.fromEntries(Object.entries(obj || {}).filter(([key]) => allowedKeys.includes(key)));

        const matchForm = Object.fromEntries(
            Object.entries(req.body)
                .filter(([key]) => allowedFields.includes(key))
                .map(([key, value]) => [
                    key,
                    key === "teamA" || key === "teamB" ? filterObject(value, allowedTeamFields) : value
                ])
        );

        if (matchForm.userName !== userNameAuth) {
            return res.status(403).json({ error: UNAUTHORIZED_USER });
        }

        if ((matchForm.matchType === "ODI" && matchForm.overs !== 50) ||
            (matchForm.matchType === "T20" && matchForm.overs !== 20) ||
            (matchForm.matchType === "CUSTOMIZED" && matchForm.overs <= 0)) {
            return res.status(400).json({ error: INVALID_OVERS_SELECTED });
        }

        const matchTime = new Date(matchForm.matchDateAndTime);
        const now = new Date();
        if ((matchTime - now) / (1000 * 60) >= 10) {
            matchForm.matchTimeStatus = "UPCOMING";
        }

        const teamIds = [matchForm.teamA.teamId, matchForm.teamB.teamId];
        const teams = await teamRepository.getTeamsByIds(teamIds);
        if (teams.length !== 2) {
            return res.status(400).json({ error: TEAMS_DO_NOT_EXISTS });
        }

        const playerIds = [
            ...matchForm.teamA.playingMembers.map(p => p.playerId),
            ...matchForm.teamB.playingMembers.map(p => p.playerId)
        ];

        const uniquePlayerIds = new Set(playerIds);
        if (uniquePlayerIds.size !== playerIds.length) {
            return res.status(400).json({ error: DUPLICATE_PLAYERS_DETECTED });
        }

        const players = await playerRepository.getPlayersByIds(Array.from(uniquePlayerIds));
        if (players.length !== uniquePlayerIds.size) {
            return res.status(400).json({ error: PLAYERS_DO_NOT_EXIST });
        }

        for (const teamKey of ["teamA", "teamB"]) {
            const teamData = matchForm[teamKey];
            const playingIds = teamData.playingMembers.map(p => p.playerId);

            for (const role of ["captain", "viceCaptain", "scorer"]) {
                if (!playingIds.includes(teamData[role].playerId)) {
                    return res.status(400).json({ error: `${role} of ${teamData.teamName} is not in playing members.` });
                }
            }
        }

        for (const team of teams) {
            const playingMembers = matchForm[team._id.toString() === matchForm.teamA.teamId ? "teamA" : "teamB"].playingMembers;
            for (const player of playingMembers) {
                if (!team.members.some(m => m.playerId.toString() === player.playerId)) {
                    return res.status(400).json({ error: `Player ${player.name} is not a member of team ${team.teamName}.` });
                }
            }
        }

        matchForm.matchDateAndTime = convertToTimestamp(matchForm.matchDateAndTime);
        matchForm.createdAt = generateTimeStamp();

        const existingMatches = await matchRepository.getMatchesAtTime(matchForm.matchDateAndTime, Array.from(uniquePlayerIds));
        if (existingMatches.length > 0) {
            return res.status(400).json({ error: MATCH_TIMINGS_CONFLICT_WITH_PLAYERS });
        }

        const match = await matchRepository.createMatch(matchForm);

        console.log(match);

        const matchMeta = {
            matchId: match._id,
            matchVenue: match.matchVenue,
            matchType: match.matchType,
            matchOvers: match.matchOvers,
            matchTimeStatus: match.matchTimeStatus,
            matchDateAndTime: match.matchDateAndTime,
            teamA: { teamId: match.teamA.teamId, name: match.teamA.name },
            teamB: { teamId: match.teamB.teamId, name: match.teamB.name }
        };

        await teamRepository.updateTeamsWithMatch(teamIds, matchMeta);
        await playerRepository.updatePlayersWithMatch(Array.from(uniquePlayerIds), matchMeta);
        return res.status(201).json({ message: "Match created successfully" });
    } catch (error) {
        logger.error("Error in matchService.createMatchService:", error);
        return res.status(500).json({ error: FAILED_TO_HANDLE_CREATE_MATCH });
    } finally {
        logger.info("matchService.createMatchService END");
    }
}

exports.fetchMatchesService = async (userName, matchType, res) => {
    try {
        logger.info("matchService.fetchMatchesService START");
        const matches = await matchRepository.getMatches(userName, matchType);
        if(matches.length === 0) return res.status(404).json({ error: "No matches found" });
        logger.info("matchService.fetchMatchesService END");
        return res.status(200).json(matches);
    } catch (error) {
        logger.error("Error in matchService.fetchMatchesService:", error);
        return res.status(500).json({ error: FAILED_TO_HANDLE_FETCH_MATCH });
    }
}
