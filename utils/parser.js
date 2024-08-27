const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    /**
     * Parses a list of Guild IDs from the .env file into an array of strings.
     * 
     * @param {string} envVarName - The name of the environment variable containing the Guild IDs.
     * @param {string} delimiter - The delimiter used to separate Guild IDs (default is ',').
     * @returns {Array<string>} - Parsed Guild IDs as an array of strings.
     */
    parseGuildIDs(envVarName, delimiter = ',') {
        const guildIDsString = process.env[envVarName];

        if (!guildIDsString) {
            throw new Error(`Environment variable ${envVarName} is not defined or empty.`);
        }

        return guildIDsString.split(delimiter).map(guildID => guildID.trim());
    }
};
