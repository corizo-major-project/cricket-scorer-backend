const express = require("express");
const cors = require("cors");
const path = require("path");
const connectToMongo = require("./connectors/mongoConnector");
const authRoutes = require("./router/authRoutes");
const requestResponseLogger = require("./middleware/loggerMiddleware");
const logger = require("./connectors/logger");
const { STATUS_CODES } = require("http");

const app = express();

// Middleware for logging requests and responses
app.use(requestResponseLogger);

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// CORS Configuration
const corsOptions = {
    origin: [
        "http://localhost",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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
