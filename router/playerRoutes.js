const express = require("express");
const router = express.Router();
const playerHandler = require("../handler/playerHandler");
const jwtVerifier = require("../middleware/jwtVerifier");
const roleVerifier = require("../middleware/roleVerifier");
const { USER, ADMIN } = require("../constants/general");

router.post("/addPlayer", jwtVerifier, roleVerifier([USER, ADMIN]), addPlayer);
function addPlayer(req, res) {
    return playerHandler.addPlayerHandler(req, res);
}

router.get("/getAllPlayers", jwtVerifier, roleVerifier([USER, ADMIN]), getAllPlayers);
function getAllPlayers(req, res) {
    const pageNo = parseInt(req.query.page_no) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    return playerHandler.getAllPlayersHandler(pageNo, pageSize, req, res);
}

router.get("/getPlayerDetails", jwtVerifier, roleVerifier([USER, ADMIN]), getPlayerDetails);
function getPlayerDetails(req, res) {
    const playerId = req.query.player_id;
    return playerHandler.getPlayerDetailsHandler(playerId, req, res);
}

router.get("/getPlayerDetailsUserName", jwtVerifier, roleVerifier([USER, ADMIN]), getPlayerDetailsUserName);
function getPlayerDetailsUserName(req, res) {
    return playerHandler.getPlayerDetailsUNHandler(req, res);
}

router.get("/searchPlayers", jwtVerifier, roleVerifier([USER, ADMIN]), searchPlayers);
function searchPlayers(req, res) {
    const searchQuery = req.query.search_query;
    return playerHandler.searchPlayersHandler(searchQuery, req, res);
}

module.exports = router;