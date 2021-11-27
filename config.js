const fs = require('fs');

module.exports = class Config {
	constructor() {
		this.configpath = `${__dirname}/config.json`;
	}
	get_config() {
		try {
			const config = fs.readFileSync(this.configpath, 'utf8');
			return JSON.parse(config);
		}
		catch(e) {
			return {}
		}
	}
	get(key) {
		return this.get_config()[key];
	}
	set(key, value) {
		let config = this.get_config();
		config[key] = value;
		fs.writeFileSync(this.configpath, JSON.stringify(config, null, 4), 'utf8');
	}
}
