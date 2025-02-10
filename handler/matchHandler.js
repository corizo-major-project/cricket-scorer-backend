const { generateTimeStamp } = require("../util/dateAndTimeUtil");
const logger = require("../connectors/logger");
const { insertEvent } = require("../repository/eventRepository");
const { CREATE_MATCH, FETCH_MATCHES } = require("../constants/eventConstants");
const matchService = require("../service/matchService");
const { FAILED_TO_HANDLE_CREATE_MATCH, FAILED_TO_HANDLE_FETCH_MATCH } = require("../constants/errorConstants");

exports.createMatchHandler = async (req, res) => {
    logger.info("matchHandler.createMatch START");
    const { userName } = req.user;
    try {
        const event = {
            eventType: CREATE_MATCH,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return await matchService.createMatchService(userName, req, res);
    }
    catch (error) {
        logger.error("Error in createMatchHandler:", error);
        return res.status(500).json({ error: FAILED_TO_HANDLE_CREATE_MATCH });
    }
    finally {
        logger.info("matchHandler.createMatch END");
    }
}

exports.fetchMatchesHandler = async (matchType, req, res) => {
    logger.info("matchHandler.fetchMatches START");
    try {
        const { userName } = req.user;
        const event = {
            eventType: FETCH_MATCHES,
            userName: userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return await matchService.fetchMatchesService(userName, matchType, res);
    }
    catch (error) {
        logger.error("Error in fetchMatchesHandler:", error);
        return res.status(500).json({ error: FAILED_TO_HANDLE_FETCH_MATCH });
    }
    finally {
        logger.info("matchHandler.fetchMatches END");
    }
}