const cron = require('node-cron');
const moment = require('moment');
const Match = require('../models/Match');

const updateMatchStatuses = async () => {
    const currentTime = moment();

    try {
        const result = await Match.updateMany(
            { 
                matchTimeStatus: { $nin: ['LIVE', 'ENDED', 'CANCELLED'] },
                matchDateAndTime: { $lt: currentTime.format('YYYY-MM-DDTHH:mm:ss') }
            },
            { $set: { matchTimeStatus: 'NOT_STARTED' } }
        );

        console.log(`Updated ${result.modifiedCount} matches to 'NOT_STARTED'`);
    } catch (error) {
        console.error("Error updating match statuses:", error);
    }
};

// Schedule the job to run every hour
cron.schedule('0 * * * *', async () => {
    console.log("Running scheduled match status update...");
    await updateMatchStatuses();
});
