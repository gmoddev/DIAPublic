const fs = require('fs');
const path = require('path');

class DebugLogger {
    constructor() {
        this.debugMode = process.env.DEBUG_MODE === 'true'; // Set DEBUG_MODE=true in your .env file to enable debugging
        this.logFilePath = path.join(__dirname, 'logs', 'debug.log');
    }

    log(message) {
        if (!this.debugMode) return;

        const stack = new Error().stack.split('\n');
        const callerInfo = stack[2]; // The 3rd line in the stack trace gives us the caller info

        const fileNameMatch = callerInfo.match(/\(([^)]+)\)/);
        const fileName = fileNameMatch ? fileNameMatch[1] : 'unknown';
        const lineNumberMatch = callerInfo.match(/:(\d+):\d+/);
        const lineNumber = lineNumberMatch ? lineNumberMatch[1] : 'unknown';
        const timestamp = new Date().toISOString();

        const logMessage = `[${timestamp}] [${fileName}:${lineNumber}] ${message}`;

        console.log(logMessage);
        this.writeToFile(logMessage);
    }

    writeToFile(message) {
        fs.appendFileSync(this.logFilePath, message + '\n', (err) => {
            if (err) {
                console.error('Failed to write to log file:', err);
            }
        });
    }
}

module.exports = new DebugLogger();
