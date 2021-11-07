require('dotenv').config();
const fs = require('fs');
const Eris = require("eris");
const spawn = require('await-spawn')
const util = require('util');

WHITELISTED_CHANNELS=["90555483461740547"];
WORKDIR = "/tmp/discord-lingui-tmp";
TARGETDIR = "/tmp/discord-lingui-target";
TRIGGER = "!stats";
//REPOSITORY = "https://github.com/OlympusDAO/olympus-frontend.git"
//BRANCH = "develop"
REPOSITORY = "https://github.com/biwano/olympus-frontend.git"
BRANCH = "i18n"
BQ = "\`\`\`";


var bot = new Eris(process.env.DISCORD_BOT_TOKEN);
// Replace TOKEN with your bot account's token

var STATUS = "waiting";
bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

async function run(task, command, args, options) {
    console.log('task', task);
    try {
        const out = await spawn(command, args, options);    
        console.log('=> Success');
        return out;
    } catch(e) {
        console.error('=> Error:', child.status);
        console.error(e.stderr.toString());
        throw(e);
    }
}

async function respond(msg, text) {
    const output = `${BQ}${text}${BQ}`;
    console.log(output);
    bot.createMessage(msg.channel.id, output);
}
async function calcStats(msg) {
    
    try {
        // Ensure working directory is empty
        STATUS = "checking repository"
        await run("Remove working directory", 'rm', [ '-rf', WORKDIR ]);
        let args = [ 
            'clone', 
            '--single-branch',
            '--depth=1',
            "--recurse-submodules",
            "-b", 
            BRANCH,
            REPOSITORY, 
            WORKDIR ];

        // Clone repository in working dir
        await run("Clone repository in working directory", 'git', args);

        // Check if repo was updated
        let updated = true;
        if (await util.promisify(fs.exists)(TARGETDIR)) {
            var gitnew = await run("Check new repo log", 'git', [ 'log', -1 ], { cwd: WORKDIR });
            var gitold = await run("Check old repo log", 'git', [ 'log', -1 ], { cwd: TARGETDIR });
            if (gitold != gitnew) {
                console.log("Repository was updated")
                updated = false;
            }
        }

        // Update target directory if necessary
        if (updated) {
            STATUS = "updating repository"
            await run("Install dependencies in working directory", 'yarn', [ 'install' ], { cwd: WORKDIR })
            await run("Delete target directory", 'rm', [ '-rf', TARGETDIR ])
            await run("Move working directory to target directory", 'mv', [ WORKDIR, TARGETDIR ])
        }

        // Get translation stats from target directory
        STATUS = "fetching stats"
        const output = await run("Extract translations", 'npx', [ 'lingui', 'extract' ], { cwd: TARGETDIR });
        respond(msg, output);

    } catch(e) {
        const error = e.stderr ? e.stderr.toString() : e;
        console.error(e);
        respond(msg, `Oups, I crashed: ${e}`);
    }

}

bot.on("messageCreate", async (msg) => { // When a message is created
    if (msg.content.startsWith(TRIGGER)) {
        console.log("Message received from", msg.channel.id);
        if (WHITELISTED_CHANNELS.includes(msg.channel.id)) {
            respond(msg, "I don't know you.");
            return;
        } 
        if (STATUS != "waiting") {
            respond(msg, `I am busy ${STATUS}`);
            return;
        } 
        STATUS = "called"
        try {
           await calcStats(msg); 
        }
        catch (e) {
            console.error(e);
        }
        STATUS = "waiting";
    }
});

bot.connect(); // Get the bot to connect to Discord