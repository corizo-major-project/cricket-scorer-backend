const express = require("express");
const teamHandler = require("../handler/teamHandler");
const jwtVerifier = require("../middleware/jwtVerifier");
const roleVerifier = require("../middleware/roleVerifier");
const { USER, ADMIN } = require("../constants/general");
const router = express.Router();

/**
 * @swagger
 * /v1/api/team/createTeam:
 *   post:
 *     summary: Create a Team in Score Liklo
 *     tags: [Team Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - teamName
 *               - location
 *               - members
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "msdhoni7"
 *               teamName:
 *                 type: string
 *                 example: "Chennai Super Kings"
 *               location:
 *                 type: string
 *                 example: "Chennai, India"
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - playerId
 *                     - userName
 *                     - name
 *                     - age
 *                     - location
 *                     - roleAsBatsman
 *                     - roleAsBowler
 *                   properties:
 *                     playerId:
 *                       type: string
 *                       format: uuid
 *                       example: "65a2b3c4d5e6f7g8h9i0j1k2"
 *                     userName:
 *                       type: string
 *                       example: "raina48"
 *                     name:
 *                       type: string
 *                       example: "Suresh Raina"
 *                     age:
 *                       type: number
 *                       example: 34
 *                     location:
 *                       type: string
 *                       example: "Uttar Pradesh, India"
 *                     roleAsBatsman:
 *                       type: string
 *                       example: "LHB"
 *                     roleAsBowler:
 *                       type: string
 *                       example: "Right-Arm Off Spin"
 *     responses:
 *       201:
 *         description: Team Created Successfully
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/createTeam", jwtVerifier, roleVerifier([USER, ADMIN]), createTeam);
function createTeam(req, res) {
    return teamHandler.createTeamHandler(req, res);
}

/**
 * @swagger
 * /v1/api/team/getAllTeams:
 *   get:
 *     summary: Get Teams with Pagination
 *     tags: [Team Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (defaults to 1)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of teams per page (defaults to 10)
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid token)
 *       404:
 *         description: Teams not found
 *       500:
 *         description: Internal server error
 */
router.get("/getAllTeams", jwtVerifier, roleVerifier([USER, ADMIN]), getAllTeams);
function getAllTeams(req, res) {
    const pageNo = parseInt(req.query.page_no) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    return teamHandler.getAllTeamsHandler(pageNo, pageSize, req, res);
}

/**
 * @swagger
 * /v1/api/team/getTeam:
 *   get:
 *     summary: Get Teams with Pagination
 *     tags: [Team Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: team_name
 *         schema:
 *           type: String
 *           default: CSK
 *         description: Team Name (defaults to CSK)
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *       401:
 *         description: Unauthorized (invalid token)
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.get("/getTeam", jwtVerifier, roleVerifier([USER, ADMIN]), getTeam);
function getTeam(req, res) {
    const teamName = req.query.team_name || "N/A";
    return teamHandler.getTeamHandler(teamName, req, res);
}

/**
 * @swagger
 * /v1/api/team/updateTeam/{teamName}:
 *   put:
 *     summary: Update an existing team
 *     tags: [Team Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamNameOld
 *         required: true
 *         schema:
 *           type: string
 *         description: The current name of the team to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - teamName
 *               - location
 *               - members
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The username of the team owner (should match the authenticated user)
 *               teamName:
 *                 type: string
 *                 description: The new team name (must be unique if different from the current name)
 *               location:
 *                 type: string
 *                 description: The new location of the team
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     playerId:
 *                       type: string
 *                       description: The ID of the player
 *                     userName:
 *                       type: string
 *                       description: The username of the player
 *                     name:
 *                       type: string
 *                       description: The full name of the player
 *                     age:
 *                       type: number
 *                       description: Age of the player (if available)
 *                     location:
 *                       type: string
 *                       description: Location of the player
 *                     roleAsBatsman:
 *                       type: string
 *                       description: Batting role (e.g., LHB, RHB)
 *                     roleAsBowler:
 *                       type: string
 *                       description: Bowling role (e.g., Right-Arm Fast)
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       400:
 *         description: Bad request (validation error, team name already in use)
 *       403:
 *         description: Unauthorized (if the authenticated user is not the team owner)
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.put("/updateTeam/:teamNameOld", jwtVerifier, roleVerifier([USER, ADMIN]), updateTeam);
function updateTeam(req, res) {
    const teamNameOld = req.params.teamNameOld;
    return teamHandler.updateTeamHandler(teamNameOld, req, res);
}

/**
 * @swagger
 * /v1/api/team/searchTeams:
 *   get:
 *     summary: Search team by Name
 *     tags: [Team Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search_query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term to find team (name)
 *     responses:
 *       200:
 *         description: List of matching teams retrieved successfully
 *       400:
 *         description: Bad request (missing or invalid search query)
 *       401:
 *         description: Unauthorized (invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/searchTeams", jwtVerifier, roleVerifier([USER, ADMIN]), searchTeams);
function searchTeams(req, res) {
    const searchQuery = req.query.search_query;
    return teamHandler.searchTeamsHandler(searchQuery, req, res);
}

/**
 * @swagger
 * /v1/api/team/getMembers/{teamName}:
 *   get:
 *     summary: Get members of a team
 *     tags: [Team Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamName
 *         required: true
 *         schema:
 *           type: string
 *         description: Team Name to retrieve members for selecting players in a match
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 *       400:
 *         description: Bad request (validation error, team name already in use)
 *       403:
 *         description: Unauthorized (if the authenticated user is not the team owner)
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.get("/getMembers/:teamName", jwtVerifier, roleVerifier([USER, ADMIN]), getTeamMembers);
function getTeamMembers(req, res) {
    const teamName = req.params.teamName;
    return teamHandler.getTeamMemberHandler(teamName, req, res);
}

module.exports = router;