const { generateTimeStamp } = require("../util/dateAndTimeUtil");
const logger = require("../connectors/logger");
const { insertEvent } = require("../repository/eventRepository");
const { ADD_PLAYER, GET_PLAYERS, GET_PLAYER_DETAILS, GET_PLAYERS_SEARCH } = require("../constants/eventConstants");
const playerService = require("../service/playerService");

exports.addPlayerHandler = async (req, res) => {
    logger.info("playerHandler.addPlayerHandler START");
    const { userName } = req.user;
    try {
        const event = {
            eventType: ADD_PLAYER,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return playerService.addPlayerService(userName, req, res);
    } catch (error) {
        logger.error("Error in addPlayerHandler:", error);
        return res.status(500).json({ error: "Failed to add player" });
    } finally {
        logger.info("playerHandler.addPlayerHandler STOP");
    }
}

exports.getAllPlayersHandler = async (pageNo, pageSize, req, res) => {
    logger.info("playerHandler.getAllPlayersHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: GET_PLAYERS,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return playerService.getAllPlayersService(pageNo, pageSize, req, res);
    } catch (error) {
        logger.error("Error in getAllPlayersHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("playerHandler.getAllPlayersHandler STOP");
    }
}

exports.getPlayerDetailsHandler = async (playerId, req, res) => {
    logger.info("playerHandler.getPlayerDetailsHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: GET_PLAYER_DETAILS,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: "",
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return playerService.getPlayerDetailsService(playerId, res);
    } catch (error) {
        logger.error("Error in getPlayerDetailsHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("playerHandler.getPlayerDetailsHandler STOP");
    }
    
}

exports.getPlayerDetailsUNHandler = async (req, res) => {
    logger.info("playerHandler.getPlayerDetailsHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: GET_PLAYER_DETAILS,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: "",
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return playerService.getPlayerDetailsUNService(userName, res);
    } catch (error) {
        logger.error("Error in getPlayerDetailsHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("playerHandler.getPlayerDetailsHandler STOP");
    }
    
}

exports.searchPlayersHandler = async (searchQuery, req, res) => {
    logger.info("playerHandler.searchPlayersHandler START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: GET_PLAYERS_SEARCH,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        }
        await insertEvent(event);
        return playerService.searchPlayersService(searchQuery, res);
    }
    catch (error) {
        logger.error("Error in searchPlayersHandler:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    } finally {
        logger.info("playerHandler.searchPlayersHandler STOP");
    }
}