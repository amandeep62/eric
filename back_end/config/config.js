var fs = require('fs');


/**
 * Read the configuration file that holds all configuration information for several modules.
 */
module.exports = {
    data: null,
    init: function() {
        var configPath = __dirname + '/config.json';

        if (!this.data) {
            this.data = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
        }
    }
}

