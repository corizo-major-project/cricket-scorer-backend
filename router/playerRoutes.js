const express = require("express");
const router = express.Router();
const playerHandler = require("../handler/playerHandler");
const jwtVerifier = require("../middleware/jwtVerifier");
const roleVerifier = require("../middleware/roleVerifier");
const { USER, ADMIN } = require("../constants/general");

/**
 * @swagger
 * /v1/api/player/addPlayer:
 *   post:
 *     summary: Register as Player into Score Liklo
 *     tags: [Player Routes]
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
 *               - name
 *               - age
 *               - location
 *               - roleAsBatsman
 *               - roleAsBowler
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "msdhoni7"
 *               name:
 *                 type: string
 *                 example: "MS Dhoni"
 *               age:
 *                 type: number
 *                 example: 37
 *               location:
 *                 type: string
 *                 example: "Ranchi, India"
 *               roleAsBatsman:
 *                 type: string
 *                 example: "RHB"
 *               roleAsBowler:
 *                 type: string
 *                 example: "Right-Arm Fast"
 *     responses:
 *       201:
 *         description: Player Registered Successfully
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/addPlayer", jwtVerifier, roleVerifier([USER, ADMIN]), addPlayer);
function addPlayer(req, res) {
    return playerHandler.addPlayerHandler(req, res);
}

/**
 * @swagger
 * /v1/api/player/getAllPlayers:
 *   get:
 *     summary: Get Players with Pagination
 *     tags: [Player Routes]
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
 *         description: Number of players per page (defaults to 10)
 *     responses:
 *       200:
 *         description: List of players retrieved successfully
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/getAllPlayers", jwtVerifier, roleVerifier([USER, ADMIN]), getAllPlayers);
function getAllPlayers(req, res) {
    const pageNo = parseInt(req.query.page_no) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    return playerHandler.getAllPlayersHandler(pageNo, pageSize, req, res);
}

/**
 * @swagger
 * /v1/api/player/getPlayerDetails:
 *   get:
 *     summary: Get Player Details
 *     tags: [Player Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: player_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique Player ID to fetch details
 *     responses:
 *       200:
 *         description: Player details retrieved successfully
 *       401:
 *         description: Unauthorized (invalid token)
 *       404:
 *         description: Player not found
 *       500:
 *         description: Internal server error
 */
router.get("/getPlayerDetails", jwtVerifier, roleVerifier([USER, ADMIN]), getPlayerDetails);
function getPlayerDetails(req, res) {
    const playerId = req.query.player_id;
    return playerHandler.getPlayerDetailsHandler(playerId, req, res);
}

/**
 * @swagger
 * /v1/api/player/getPlayerDetailsUserName:
 *   get:
 *     summary: Get Player Details by Username
 *     tags: [Player Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique username of the player
 *     responses:
 *       200:
 *         description: Player details retrieved successfully
 *       401:
 *         description: Unauthorized (invalid token)
 *       404:
 *         description: Player not found
 *       500:
 *         description: Internal server error
 */
router.get("/getPlayerDetailsUserName", jwtVerifier, roleVerifier([USER, ADMIN]), getPlayerDetailsUserName);
function getPlayerDetailsUserName(req, res) {
    return playerHandler.getPlayerDetailsUNHandler(req, res);
}

/**
 * @swagger
 * /v1/api/player/searchPlayers:
 *   get:
 *     summary: Search Players by Name or Username
 *     tags: [Player Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search_query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term to find players (name or username)
 *     responses:
 *       200:
 *         description: List of matching players retrieved successfully
 *       400:
 *         description: Bad request (missing or invalid search query)
 *       401:
 *         description: Unauthorized (invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/searchPlayers", jwtVerifier, roleVerifier([USER, ADMIN]), searchPlayers);
function searchPlayers(req, res) {
    const searchQuery = req.query.search_query;
    return playerHandler.searchPlayersHandler(searchQuery, req, res);
}

module.exports = router;