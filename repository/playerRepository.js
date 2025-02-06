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

exports.updatePlayersTeamsPlayedIn = async (teamId, teamName, members, createdAt) => {
    try {
        logger.info("playerRepository.updatePlayersTeamsPlayedIn START");

        const playerUpdates = members.map(async (member) => {
            if (member.playerId) {
                await Player.findByIdAndUpdate(
                    member.playerId,
                    {
                        $addToSet: {
                            teamsPlayedIn: {
                                teamId: teamId,
                                teamName: teamName,
                                since: createdAt
                            }
                        }
                    }
                );
            }
        });

        await Promise.all(playerUpdates);
        logger.info("playerRepository.updatePlayersTeamsPlayedIn END");
    } 
    catch (err) {
        logger.error("Error in updatePlayersTeamsPlayedIn:", err);
        throw err;
    }
};

exports.updatePlayersTeamsPlayedInTeamUpdate = async (teamId, teamName, members, updatedAt) => {
    try {
        logger.info("playerRepository.updatePlayersTeamsPlayedIn START");

        const playerUpdates = members.map(async (member) => {
            if (member.playerId) {
                await Player.updateOne(
                    {
                        _id: member.playerId,
                        "teamsPlayedIn.teamId": teamId // Check if the player already has this teamId
                    },
                    {
                        $set: {
                            "teamsPlayedIn.$.teamName": teamName, // Update team name
                            "teamsPlayedIn.$.since": updatedAt    // Update timestamp
                        }
                    }
                );

                // If the document was not updated, it means the teamId was not found in teamsPlayedIn, so we insert a new entry.
                await Player.updateOne(
                    {
                        _id: member.playerId,
                        "teamsPlayedIn.teamId": { $ne: teamId } // Only if teamId does not exist
                    },
                    {
                        $push: {
                            teamsPlayedIn: {
                                teamId: teamId,
                                teamName: teamName,
                                since: updatedAt
                            }
                        }
                    }
                );
            }
        });

        await Promise.all(playerUpdates);
        logger.info("playerRepository.updatePlayersTeamsPlayedIn END");
    } catch (err) {
        logger.error("Error in updatePlayersTeamsPlayedIn:", err);
        throw err;
    }
};

exports.removePlayersFromTeam = async (teamId, removedPlayers) => {
    try {
        logger.info("playerRepository.removePlayersFromTeam START");

        await Player.updateMany(
            { _id: { $in: removedPlayers } },
            { $pull: { teamsPlayedIn: { teamId: teamId } } } // Remove the team entry
        );

        logger.info("playerRepository.removePlayersFromTeam END");
    } catch (err) {
        logger.error("Error in removePlayersFromTeam:", err);
        throw err;
    }
};
