const Eris = require("eris");
const Worker = require('./src/worker');
const config = require('./src/config');
const yargs = require('yargs');


var bot = new Eris(config.get("bot_token"));
const worker = new Worker(bot, config.get("repository"), config.get("workdir"));

function listen() {
    bot.on("ready", () => { // When the bot is ready
        console.log("Ready!"); 
    });

    bot.on("error", (err) => {
      console.error(err); 
    });

    bot.on("messageCreate", async (msg) => { // When a message is created
        worker.handle_message(msg);
    });

    bot.connect(); // Get the bot to connect to Discord
}

function send_stats(argv) {
    bot.on("ready", () => { // When the bot is ready
        worker.send_stats(argv._[argv._.length - 1]);
        bot.disconnect();
    });
    bot.connect(); // Get the bot to connect to Discord
}


const argv = yargs
    .command('listen', 'Listen to message in the Olympus app translations channel', listen)
    .command('send', 'Send a message to a channel', (yargs) => {
        return yargs.command('stats', 'Send translations stats to a channel', (yargs) => {
                return yargs.positional("channel", {
                    describe: "Channel to send the message to"
                })
            }, send_stats
        );
     })
    .help()
    .alias('help', 'h')
    .argv;

    /*
if (argv._.includes('listen')) {
    
}
else if (argv._.includes('send')) {
    worker.send_stats()
}
else {
    console.error("Unknown command");
}
*/

