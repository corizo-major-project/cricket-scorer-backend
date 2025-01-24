const mongoose = require("mongoose");
const logger = require("./logger"); 
require("dotenv").config(); 

const connectToMongo = async () => {
    const uri = process.env.MONGO_DB_URL || "mongodb+srv://admin:ZYPCgQeuL01Ok0LC@cluster0.ow1qh.mongodb.net/iit-madras-hackathon";
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    try {
        await mongoose.connect(uri, options);
        logger.info("Connected to MongoDB - cricketScorer");
    } catch (err) {
        logger.error("Could not connect to MongoDB - cricketScorer", err);
    }

    return mongoose.connection; // Return the connection for use elsewhere
};

// Export the function
module.exports = connectToMongo;
