const logger = require('../connectors/logger');
const Team = require('../models/Team');

exports.createTeam = async (teamData) => {
    try {
        logger.info("teamService.createTeam START");
        logger.info("teamService.createTeam END");
        return await teamData.save();
    }
    catch (error) {
        logger.error("Error in createTeam:", error);
        throw error;
    }
};

exports.getTeamByTeamName = async (teamName) => {
    try {
        logger.info("teamRepository.getTeamByTeamName START");
        const team = await Team.findOne({ teamName: { $regex: new RegExp(`^${teamName}$`, "i") } });
        logger.info("teamRepository.getTeamByTeamName END");
        return team;
    } catch (error) {
        logger.error("Error in getTeamByTeamName:", error);
        throw error;
    }
}

exports.totalTeams = async () => {
    try {
        logger.info("teamRepository.totalTeams START");
        const totalTeams = await Team.countDocuments();
        logger.info("teamRepository.totalTeams END");
        return totalTeams;
    } catch (error) {
        logger.error("Error in totalTeams:", error);
        throw error;
    }
}

exports.getAllTeams = async (pageNo, pageSize) => {
    try {
        logger.info("teamRepository.getAllTeams START");
        const teams = await Team.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .select("_id userName teamName location createdAt");
        logger.info("teamRepository.getAllTeams END");
        return teams;
    } catch (error) {
        logger.error("Error in getAllTeams:", error);
        throw error;
    }
}

exports.updateTeam = async (teamId, teamData) => {
    try {
        logger.info("teamRepository.updateTeam START");
        const team = await Team.findByIdAndUpdate(teamId, teamData, { new: true });
        logger.info("teamRepository.updateTeam END");
        return team;
    } catch (error) {
        logger.error("Error in updateTeam:", error);
        throw error;
    }
}

exports.searchTeams = async (searchQuery) => {
    try {
        logger.info("teamRepository.searchTeams START");
        const teamList = await Team.aggregate([
            {
                $search: {
                    index: "team_search",
                    autocomplete: {
                        query: searchQuery,
                        path: "teamName"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    teamName: 1,
                    userName: 1,
                    location: 1,
                }
            }
        ]);
        logger.info("teamRepository.searchTeams END");
        return teamList;
    } catch (error) {
        logger.error("Error in searchTeams:", error);
        throw error;
    }
}

exports.getTeamMembers = async (teamName) => {
    try {
        logger.info("teamRepository.getTeamMembers START");
        const team = await Team.findOne({ teamName: teamName.trim() });
        logger.info("teamRepository.getTeamMembers END");
        return team;
    } catch (error) {
        logger.error("Error in getTeamMembers:", error);
        throw error;
    }
}

exports.getTeamsByIds = async (teamIds) => {
    try {
        logger.info("teamRepository.getTeamsByIds START");
        const teams = await Team.find({ _id: { $in: teamIds } });
        logger.info("teamRepository.getTeamsByIds END");
        return teams;
    } catch (error) {
        logger.error("Error in getTeamsByIds:", error);
        throw error;
    }
}

exports.updateTeamsWithMatch = async (teamIds, matchMeta) => {
    try {
        logger.info("teamRepository.updateTeamsWithMatch START");
        const teams = await Team.updateMany({ _id: { $in: teamIds } },
            { $push: { matches: matchMeta } });
        logger.info("teamRepository.updateTeamsWithMatch END");
        return teams;
    } catch (error) {
        logger.error("Error in updateTeamsWithMatch:", error);
        throw error;
    }
}