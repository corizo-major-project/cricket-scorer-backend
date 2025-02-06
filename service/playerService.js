const logger = require('../connectors/logger');
const Player = require('../models/Player');
const { getPlayerDetails } = require('../repository/playerRepository');
const { generateTimeStamp } = require('../util/dateAndTimeUtil');
const playerRepository = require('../repository/playerRepository');


exports.addPlayerService = async (userName, req, res) => {
    try {
        logger.info("playerService.addPlayerService START");
        const playerDetails = new Player(req.body);
        // || playerDetails.userName !== userName
        if (playerDetails.userName === undefined || playerDetails.userName === null || playerDetails.userName === '') {
            logger.error("playerService.addPlayerService: Invalid Username");
            return res.status(400).json({ error: "Invalid Username" });
        }
        const existingPlayer = await getPlayerDetails(playerDetails.userName);
        if (existingPlayer) {
            logger.error("playerService.addPlayerService: Existing player found");
            return res.status(400).json({ error: "Player already exists" });
        }
        playerDetails.isActive = true;
        playerDetails.createdAt = generateTimeStamp();
        playerDetails.updatedAt = generateTimeStamp();
        await playerRepository.addPlayer(playerDetails);
        logger.info("playerService.addPlayerService END");
        return res.status(201).json({ message: "Player added successfully" });
    } catch (error) {
        logger.error("Error in addPlayerService:", error);
        return res.status(500).json({ error: "Failed to add player" });
    }
};

exports.getAllPlayersService = async (pageNo, pageSize, req, res) => {
    try {
        logger.info("playerService.getAllPlayersService START");
        if (pageNo < 1 || pageSize < 1) {
            return res.status(400).json({ error: "Invalid page number or page size" });
        }

        const MAX_PAGE_SIZE = 20;
        if (pageSize > MAX_PAGE_SIZE) {
            return res.status(400).json({ error: `Page size cannot be greater than ${MAX_PAGE_SIZE}` });
        }

        const totalPlayerCount = await playerRepository.totalPlayers();
        const players = await playerRepository.getAllPlayers(pageNo, pageSize);
        logger.info("playerService.getAllPlayersService END");
        return res.status(200).json({ players, totalPlayerCount });
    } catch (error) {
        logger.error("Error in getAllPlayersService:", error);
        return res.status(500).json({ error: "Failed to get all players" });
    }
}

exports.getPlayerDetailsService = async (playerId, res) => {
    try {
        logger.info("playerService.getPlayerDetailsService START");
        const playerDetails = await playerRepository.getPlayer(playerId);
        if (!playerDetails) {
            logger.error("playerService.getPlayerDetailsService: Player not found");
            return res.status(404).json({ error: "Player not found" });
        }
        logger.info("playerService.getPlayerDetailsService END");
        return res.status(200).json(playerDetails);
    } catch (error) {
        logger.error("Error in getPlayerDetailsService:", error);
        return res.status(500).json({ error: "Failed to get player details" });
    }
}

exports.getPlayerDetailsUNService = async (playerUserName, res) => {
    try {
        logger.info("playerService.getPlayerDetailsUNService START");
        const playerDetails = await playerRepository.getPlayerUserName(playerUserName);
        if (!playerDetails) {
            logger.error("playerService.getPlayerDetailsUNService: Player not found");
            return res.status(404).json({ error: "Player not found" });
        }
        logger.info("playerService.getPlayerDetailsUNService END");
        return res.status(200).json(playerDetails);
    } catch (error) {
        logger.error("Error in getPlayerDetailsUNService:", error);
        return res.status(500).json({ error: "Failed to get player details" });
    }
}

exports.searchPlayersService = async (searchQuery, res) => {
    try {
        logger.info("playerService.searchPlayersService START");
        if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim() === "") {
            logger.error("playerService.searchPlayersService: Invalid search query");
            return res.status(400).json({ error: "Invalid search query" });
        }
        const players = await playerRepository.searchPlayers(searchQuery);
        logger.info("playerService.searchPlayersService END");
        return res.status(200).json({ players });
    } catch (error) {
        logger.error("Error in searchPlayersService:", error);
        return res.status(500).json({ error: "Failed to search players" });
    }
}