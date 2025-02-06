const { generateTimeStamp } = require("../util/dateAndTimeUtil");
const logger = require("../connectors/logger");
const { insertEvent } = require("../repository/eventRepository");
const { CREATE_TEAM, GET_TEAMS, GET_TEAM, UPDATE_TEAM } = require("../constants/eventConstants");
const teamService = require("../service/teamService");

exports.createTeamHandler = async (req, res) => {
    logger.info("teamHandler.createTeamHandler START");
    const { userName } = req.user;
    try {
        const event = {
            eventType: CREATE_TEAM,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return teamService.createTeamService(req, res);
    } catch (error) {
        logger.error("Error in createTeamHandler:", error);
        return res.status(500).json({ error: "Failed to add player" });
    } finally {
        logger.info("teamHandler.createTeamHandler  STOP");
    }
}

exports.getAllTeamsHandler = async (pageNo, pageSize, req, res) => {
    logger.info("teamHandler.getAllTeamsHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: GET_TEAMS,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return teamService.getAllTeamsService(pageNo, pageSize, res);
    } catch (error) {
        logger.error("Error in getAllTeamsHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("teamHandler.getAllTeamsHandler STOP");
    }
}

exports.getTeamHandler = async (teamName, req, res) => {
    logger.info("teamHandler.getTeamHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: GET_TEAM,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        logger.info(`Fetching team with name: ${teamName}`);
        return await teamService.getTeamService(teamName, res);
    } catch (error) {
        logger.error("Error in getTeamHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("teamHandler.getTeamHandler STOP");
    }
}

exports.updateTeamHandler = async (teamNameOld, req, res) => {
    logger.info("teamHandler.updateTeamHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: UPDATE_TEAM,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        }
        await insertEvent(event);
        return await teamService.updateTeamService(teamNameOld, userName, req, res);
    } catch (error) {
        logger.error("Error in updateTeamHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("teamHandler.updateTeamHandler STOP");
    }
}