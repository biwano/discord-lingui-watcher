const Repository = require('./repository');
const config = require('./config');

TRIGGER = "!stats";
BQ = "\`\`\`";

module.exports = class Worker {
	constructor(bot, repository, workdir) {
	    this.bot = bot;
	    this.repository = new Repository(repository, workdir);
	    this.workdir = workdir;
	    this.status = "waiting";
	}
	async send_message(channel_id, text) {
	    const output = `${BQ}${text}${BQ}`;
	    console.log(output);
	    this.bot.createMessage(channel_id, output);
	}
	async respond(msg, text) {
	    this.send_message(msg.channel.id, text);
	}
	async handle_message(msg) {

	    if (msg.content.startsWith(TRIGGER)) {
	        console.log("Message received from", msg.channel.id);
	        if (!config.get("whitelisted_channels").includes(msg.channel.id)) {
	            this.respond(msg, "I don't know you.");
	            return;
	        } 
	        if (this.status != "waiting") {
	            this.respond(msg, `I am busy ${STATUS}`);
	            return;
	        } 
	        this.status = "working"
	        try {
	           const stats = await this.repository.get_stats();
	           this.respond(msg, stats);
	        }
	        catch (e) {
	            console.error(e);
	        }
	        this.status = "waiting";
	    }
    }
    async send_stats(channel_id) {
    	const stats = await this.repository.get_stats();
    	this.send_message(channel_id, stats);
    }
}