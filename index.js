const express = require("express");
const { swaggerUi, swaggerSpec } = require("./swagger");
const cors = require("cors");
const path = require("path");
const connectToMongo = require("./connectors/mongoConnector");
const authRoutes = require("./router/authRoutes");
const playerRoutes = require("./router/playerRoutes");
const teamRoutes = require("./router/teamRoutes");
const matchRoutes = require("./router/matchRoutes");
const requestResponseLogger = require("./middleware/loggerMiddleware");
const logger = require("./connectors/logger");
const http = require("http"); 
const { Server } = require("socket.io");
const { swaggerAuth } = require("./middleware/swaggerAuth");
require("./jobs/matchCrons");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware for logging requests and responses
app.use(requestResponseLogger);

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// CORS Configuration
const corsOptions = {
    origin: [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Database connection check
connectToMongo().then((db) => {
    db.once("open", () => {
        logger.info("Database connection is open.");
    });

    db.on("error", (err) => {
        logger.error("Database connection error:", err);
    });
});


/*******************************************************************************/ 
/********************************ROUTERS****************************************/
/*******************************************************************************/
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/player", playerRoutes);
app.use("/v1/api/team", teamRoutes);
app.use("/v1/api/match", matchRoutes);
app.use("/api-docs", swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => {
    logger.info("Welcome Route START");
    logger.info("Welcome Route END");
    res.status(200).json({ message: "Your Backend API is working properly" })
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Start server
const PORT = 4000;
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
