const logger = require('../connectors/logger');
const Player = require('../models/Player');

exports.addPlayer = async (player) => {
    try {
        logger.info("playerRepository.addPlayer START");
        await player.save();
        logger.info("playerRepository.addPlayer END");
        return player;
    } catch (error) {
        logger.error("Error in addPlayer:", error);
        throw error;
    }
};

exports.getPlayerDetails = async (userName) => {
    try {
        logger.info("playerRepository.getPlayerDetails START");
        const player = await Player.findOne({ userName });
        logger.info("playerRepository.getPlayerDetails END");
        return player;
    } catch (error) {
        logger.error("Error in getPlayerDetails:", error);
        throw error;
    }
}

exports.totalPlayers = async () => {
    try {
        logger.info("playerRepository.totalPlayers START");
        const totalPlayers = await Player.countDocuments();
        logger.info("playerRepository.totalPlayers END");
        return totalPlayers;
    } catch (error) {
        logger.error("Error in totalPlayers:", error);
        throw error;
    }
}

exports.getAllPlayers = async (pageNo, pageSize) => {
    try {
        logger.info("playerRepository.getAllPlayers START");
        const players = await Player.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .select("_id userName name age location roleAsBatsman roleAsBowler createdAt");
        logger.info("playerRepository.getAllPlayers END");
        return players;
    } catch (error) {
        logger.error("Error in getAllPlayers:", error);
        throw error;
    }
}

exports.getPlayer = async (playerId) => {
    try {
        logger.info("playerRepository.getPlayer START");
        const player = await Player.findById(playerId).select("-__v");
        logger.info("playerRepository.getPlayer END");
        return player;
    } catch (error) {
        logger.error("Error in getPlayer:", error);
        throw error;
    }
}

exports.getPlayerUserName = async (userName) => {
    try {
        logger.info("playerRepository.getPlayer START");
        const player = await Player.findOne({ userName }).select("-__v");
        logger.info("playerRepository.getPlayer END");
        return player;
    } catch (error) {
        logger.error("Error in getPlayer:", error);
        throw error;
    }
}

exports.searchPlayers = async (searchQuery) => {
    try {
        logger.info("playerRepository.searchPlayers START");
        const playerList = await Player.aggregate([
            {
                $search: {
                    index: "player_search",
                    autocomplete: {
                        query: searchQuery,
                        path: "name"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    userName: 1,
                    location: 1,
                    roleAsBatsman: 1,
                    roleAsBowler: 1,
                }
            }
        ]);
        logger.info("playerRepository.searchPlayers END");
        return playerList;
    } catch (error) {
        logger.error("Error in searchPlayers:", error);
        throw error;
    }
}