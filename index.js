require('dotenv').config();
const fs = require('fs');
const Eris = require("eris");
const util = require('util');
const Worker = require('./worker');

WORKDIR = "/tmp";
REPOSITORY = "https://github.com/OlympusDAO/olympus-frontend.git"
DEFAULT_OUTPUT_CHANNEL = "905554834617405471";
STATS_INTERVAL = 1000 * 60 * 60 * 60 * 24; 

var bot = new Eris(process.env.DISCORD_BOT_TOKEN);
const worker = new Worker(bot, REPOSITORY, WORKDIR);
// Replace TOKEN with your bot account's token

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.on("messageCreate", async (msg) => { // When a message is created
    worker.handle_message(msg);
});

bot.connect(); // Get the bot to connect to Discord

setInterval(() => { worker.send_stats(DEFAULT_OUTPUT_CHANNEL) }, STATS_INTERVAL);