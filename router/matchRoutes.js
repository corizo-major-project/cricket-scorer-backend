const express = require("express");
const router = express.Router();
const matchHandler = require("../handler/matchHandler");
const jwtVerifier = require("../middleware/jwtVerifier");
const roleVerifier = require("../middleware/roleVerifier");
const { USER, ADMIN } = require("../constants/general");

/**
 * @swagger
 * /v1/api/match/createMatch:
 *   post:
 *     summary: Create a Match to start
 *     tags: [Match Routes]
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
 *               - venue
 *               - matchType
 *               - overs
 *               - matchDateAndTime
 *               - teamA
 *               - teamB
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "msdhoni7"
 *               venue:
 *                 type: string
 *                 example: "Wankhede Stadium, Mumbai"
 *               matchType:
 *                 type: string
 *                 enum: ["ODI", "T20", "CUSTOMIZED"]
 *                 example: "T20"
 *               overs:
 *                 type: number
 *                 example: 20
 *               matchDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-10T14:30:00Z"
 *               teamA:
 *                 type: object
 *                 required: 
 *                   - teamId
 *                   - teamName
 *                   - captain
 *                   - viceCaptain
 *                   - playingMembers
 *                   - scorer
 *                 properties:
 *                   teamId:
 *                     type: string
 *                     example: "65ab12cd34ef567890123456"
 *                   teamName:
 *                     type: string
 *                     example: "Chennai Super Kings"
 *                   captain:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                         example: "65ef12cd34ef567890abcdef"
 *                       userName:
 *                         type: string
 *                         example: "msdhoni7"
 *                       name:
 *                         type: string
 *                         example: "MS Dhoni"
 *                   viceCaptain:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                         example: "65ab12cd34ef567890abcdef"
 *                       userName:
 *                         type: string
 *                         example: "sureshraina3"
 *                       name:
 *                         type: string
 *                         example: "Suresh Raina"
 *                   playingMembers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         playerId:
 *                           type: string
 *                           example: "65bc12cd34ef567890abcdef"
 *                         userName:
 *                           type: string
 *                           example: "jadeja8"
 *                         name:
 *                           type: string
 *                           example: "Ravindra Jadeja"
 *                   scorer:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                         example: "65ef12cd34ef567890abcdef"
 *                       userName:
 *                         type: string
 *                         example: "msdhoni7"
 *                       name:
 *                         type: string
 *                         example: "MS Dhoni"
 *               teamB:
 *                 type: object
 *                 required: 
 *                   - teamId
 *                   - teamName
 *                   - captain
 *                   - viceCaptain
 *                   - playingMembers
 *                   - scorer
 *                 properties:
 *                   teamId:
 *                     type: string
 *                     example: "65ff12cd34ef567890abcdef"
 *                   teamName:
 *                     type: string
 *                     example: "Mumbai Indians"
 *                   captain:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                         example: "65ef12cd34ef567890bcdef1"
 *                       userName:
 *                         type: string
 *                         example: "rohit45"
 *                       name:
 *                         type: string
 *                         example: "Rohit Sharma"
 *                   viceCaptain:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                         example: "65ef12cd34ef567890bcdef2"
 *                       userName:
 *                         type: string
 *                         example: "bumrah93"
 *                       name:
 *                         type: string
 *                         example: "Jasprit Bumrah"
 *                   playingMembers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         playerId:
 *                           type: string
 *                           example: "65ef12cd34ef567890bcdef3"
 *                         userName:
 *                           type: string
 *                           example: "sky17"
 *                         name:
 *                           type: string
 *                           example: "Suryakumar Yadav"
 *                   scorer:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                         example: "65ef12cd34ef567890bcdef1"
 *                       userName:
 *                         type: string
 *                         example: "rohit45"
 *                       name:
 *                         type: string
 *                         example: "Rohit Sharma"
 *     responses:
 *       201:
 *         description: Match Created Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Match created successfully"
 *                 matchId:
 *                   type: string
 *                   example: "65ff12cd34ef567890abcdef"
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/createMatch", jwtVerifier, roleVerifier([USER, ADMIN]), createMatch);
function createMatch(req, res) {
    return matchHandler.createMatchHandler(req, res);
}

/**
 * @swagger
 * /v1/api/match/fetchMatches/{matchType}:
 *   get:
 *     summary: Fetch matches based on match status
 *     tags: [Match Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [UPCOMING, LIVE, ENDED, CANCELLED]
 *         description: Fetch matches based on their status
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   matchId:
 *                     type: string
 *                     description: Unique identifier for the match
 *                   matchType:
 *                     type: string
 *                     description: Type of the match (e.g., CUSTOMIZED)
 *                   overs:
 *                     type: integer
 *                     description: Number of overs in the match
 *                   venue:
 *                     type: string
 *                     description: Location of the match
 *                   matchTimeStatus:
 *                     type: string
 *                     enum: [UPCOMING, LIVE, ENDED, CANCELLED]
 *                     description: Current status of the match
 *                   matchDateAndTime:
 *                     type: string
 *                     format: date-time
 *                     description: Scheduled date and time of the match
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the match was created
 *                   teamA:
 *                     type: object
 *                     properties:
 *                       teamId:
 *                         type: string
 *                         description: Unique ID of Team A
 *                       teamName:
 *                         type: string
 *                         description: Name of Team A
 *                   teamB:
 *                     type: object
 *                     properties:
 *                       teamId:
 *                         type: string
 *                         description: Unique ID of Team B
 *                       teamName:
 *                         type: string
 *                         description: Name of Team B
 *                   innings:
 *                     type: array
 *                     description: Innings details (only for LIVE/ENDED matches)
 *                   winningTeam:
 *                     type: string
 *                     nullable: true
 *                     description: Winning team (only for ENDED matches)
 *                   winMargin:
 *                     type: string
 *                     description: Win margin (only for ENDED matches)
 *       404:
 *         description: No matches found
 *       500:
 *         description: Internal server error
 */
router.get("/fetchMatches/:matchType", jwtVerifier, roleVerifier([USER, ADMIN]), fetchMatches);
function fetchMatches(req, res) {
    const matchType = req.params.matchType;
    return matchHandler.fetchMatchesHandler(matchType, req, res);
}

module.exports = router;