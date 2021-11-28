const { spawn } = require('child_process')
const config = require('./config');

module.exports = class Repository {
	constructor(repository, workdir) {
	    this.repository = repository;
	    this.workdir = `${workdir}`;
	}
	async run_script(command, args, options) {
		console.log(command);
		return new Promise( (resolve, reject) => {
			const child = spawn(`${__dirname}/../scripts/${command}.sh`, args, options);
			let output = "";
			child.stdout.on('data', (data) => {
			  console.log(`${data}`);
			  output = `${output}${data}`; 
			});
			child.stderr.on('data', (data) => {
			  console.error(`${data}`);
			});
			child.on('close', (code) => {
			  if (code == 0) resolve(output);
			  else reject(code);
			});
		});
	}
	async get_stats(msg) {
	    try {
	        await this.run_script('repo_init', [ this.workdir, this.repository ]);
	        await this.run_script('repo_update', [ this.workdir ]);

	        const frontend_commit = await this.run_script("git_get_commit", [ this.workdir, "" ]);
	        const translations_commit = await this.run_script("git_get_commit", [ this.workdir, "/src/locales/translations" ]);
	        
	        let output = config.get("extraction_stats");

	        if (frontend_commit != config.get("frontend_commit") || translations_commit != config.get("translations_commit")) {
	        	await this.run_script('repo_install', [ this.workdir ]);
		        output = await this.run_script('extract_translations', [ this.workdir ]);
		        config.set("extraction_stats", output);
		        config.set("frontend_commit", frontend_commit);
		        config.set("translations_commit", translations_commit);
			} 
	        return output;

	    } catch(e) {
	        const error = e.stderr ? e.stderr.toString() : e;
	        console.error(e);
	        return `Oups, I crashed: ${e}`;
	    }
	}
}
