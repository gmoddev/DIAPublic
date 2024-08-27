const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'warnings.db'), (err) => {
    if (err) {
        console.error('Could not connect to the database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_tag TEXT NOT NULL,
            reason TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

module.exports = {
    addWarning: (userId, userTag, reason, callback) => {
        db.run(`INSERT INTO warnings (user_id, user_tag, reason) VALUES (?, ?, ?)`, [userId, userTag, reason], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { id: this.lastID });
        });
    },

    getWarnings: (userId, callback) => {
        db.all(`SELECT * FROM warnings WHERE user_id = ?`, [userId], (err, rows) => {
            if (err) {
                return callback(err);
            }
            callback(null, rows);
        });
    },

    removeWarning: (warningId, callback) => {
        db.run(`DELETE FROM warnings WHERE id = ?`, [warningId], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { changes: this.changes });
        });
    },

    clearWarnings: (userId, callback) => {
        db.run(`DELETE FROM warnings WHERE user_id = ?`, [userId], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { changes: this.changes });
        });
    }
};
