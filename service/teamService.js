const logger = require("../connectors/logger");
const Team = require("../models/Team");
const { generateTimeStamp } = require("../util/dateAndTimeUtil");
const teamRepository = require("../repository/teamRepository");
const playerRepository = require("../repository/playerRepository");

exports.createTeamService = async (req, res) => {
    try {
        logger.info("teamService.createTeamService START");
        const { userName, teamName, location, members } = req.body;

        const teamDetails = await teamRepository.getTeamByTeamName(teamName);
        if (teamDetails) {
            return res.status(400).json({ error: "Team already exists" });
        }

        const team = new Team({
            userName: userName,
            teamName: teamName,
            location: location,
            members: members,
            createdAt: generateTimeStamp(),
            updatedAt: generateTimeStamp(),
        });

        const savedTeam = await teamRepository.createTeam(team);
        await playerRepository.updatePlayersTeamsPlayedIn(savedTeam._id, savedTeam.teamName, members, savedTeam.createdAt);
        logger.info("teamService.createTeamService END");
        return res.status(201).json({ success: "Team Created Successfully" });
    }
    catch (err) {
        logger.error("Error in createTeamService:", error);
        return res.status(500).json({ error: "Failed to add player" });
    }
}

exports.getAllTeamsService = async (pageNo, pageSize, res) => {
    try {
        logger.info("teamService.getAllTeamsService START");
        if (pageNo < 1 || pageSize < 1) {
            return res.status(400).json({ error: "Invalid page number or page size" });
        }

        const MAX_PAGE_SIZE = 20;
        if (pageSize > MAX_PAGE_SIZE) {
            return res.status(400).json({ error: `Page size cannot be greater than ${MAX_PAGE_SIZE}` });
        }

        const totalTeamCount = await teamRepository.totalTeams();
        if (totalTeamCount === 0) {
            return res.status(404).json({ error: "No teams found" });
        }
        const teams = await teamRepository.getAllTeams(pageNo, pageSize);
        logger.info("teamService.getAllTeamsService END");
        return res.status(200).json({ teams, totalTeamCount });
    } catch (error) {
        logger.error("Error in getAllTeamsService:", error);
        return res.status(500).json({ error: "Failed to get all teams" });
    }
}

exports.getTeamService = async (teamName, res) => {
    try {
        logger.info("teamService.getTeamService START");
        const team = await teamRepository.getTeamByTeamName(teamName);
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        logger.info("teamService.getTeamService END");
        return res.status(200).json({ team });
    } catch (error) {
        logger.error("Error in getTeamService:", error);
        return res.status(500).json({ error: "Failed to get team" });
    }
}

exports.updateTeamService = async (teamNameOld, userNameAuth, req, res) => {
    try {
        logger.info("teamService.updateTeamService START");
        const { userName, teamName, location, members } = req.body;
        if (userNameAuth !== userName) {
            return res.status(403).json({ error: "Unauthorized action." });
        }
        const existingTeam = await teamRepository.getTeamByTeamName(teamNameOld);
        if (!existingTeam) {
            logger.info("teamService.updateTeamService TEAM NOT FOUND");
            return res.status(404).json({ error: "Team not found" });
        }

        if (teamName !== teamNameOld) {
            const teamExists = await teamRepository.getTeamByTeamName(teamName);
            if (teamExists) {
                logger.info("teamService.updateTeamService TEAM ALREADY EXISTS");
                return res.status(400).json({ error: "Team already exists" });
            }
        }

        const existingPlayers = existingTeam.members.map(member => member.playerId.toString());
        const newPlayers = members.map(member => member.playerId.toString());
        const removedPlayers = existingPlayers.filter(playerId => !newPlayers.includes(playerId));

        // Determine players that remain in the team
        const currentExistPlayers = newPlayers.filter(playerId => existingPlayers.includes(playerId));

        existingTeam.teamName = teamName;
        existingTeam.location = location;
        existingTeam.members = members;
        
        const savedTeam = await teamRepository.updateTeam(existingTeam._id, {
            teamName,
            location,
            members,
            updatedAt: generateTimeStamp(),
        });
        
        await playerRepository.updatePlayersTeamsPlayedInTeamUpdate(
            savedTeam._id,
            savedTeam.teamName,
            members,
            savedTeam.updatedAt
        );

        if (removedPlayers.length > 0) {
            await playerRepository.removePlayersFromTeam(savedTeam._id, removedPlayers);
        }
        logger.info("teamService.updateTeamService END");
        return res.status(200).json({ success: "Team Updated Successfully" });
    } catch (error) {
        logger.error("Error in updateTeamService:", error);
        return res.status(500).json({ error: "Failed to update team" });
    }
}

exports.searchTeamsService = async (searchQuery, res) => {
    try {
        logger.info("teamService.searchTeamsService START");
        if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim() === "") {
            logger.error("playerService.searchPlayersService: Invalid search query");
            return res.status(400).json({ error: "Invalid search query" });
        }
        const teams = await teamRepository.searchTeams(searchQuery);
        logger.info("teamService.searchTeamsService END");
        return res.status(200).json({ teams });
    } catch (error) {
        logger.error("Error in searchTeamsService:", error);
        return res.status(500).json({ error: "Failed to search teams" });
    }
}

exports.getTeamMemberService = async (teamName, res) => {
    try {
        logger.info("teamService.getTeamMemberService START");
        const team = await teamRepository.getTeamMembers(teamName);
        if (!team || !team.members || team.members.length === 0) {
            return res.status(404).json({ error: "No members found for this team" });
        }
        logger.info("teamService.getTeamMemberService END");
        return res.status(200).json({ members: team.members });
    } catch (error) {
        logger.error("Error in getTeamMemberService:", error);
        return res.status(500).json({ error: "Failed to get team" });
    }
}