
import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = resolve(__dirname, '../server/gym-tracker.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening DB:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite DB at', dbPath);
    migrate();
});

function migrate() {
    const migrations = [
        "ALTER TABLE workout_sessions ADD COLUMN difficulty TEXT",
        "ALTER TABLE exercises ADD COLUMN is_custom BOOLEAN DEFAULT 0",
        "ALTER TABLE exercises ADD COLUMN user_id INTEGER",
        "ALTER TABLE folders ADD COLUMN user_id INTEGER",
        // Add other potential missing columns here based on db.js review
    ];

    let completed = 0;

    migrations.forEach(query => {
        db.run(query, [], (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Skipped (exists): ${query}`);
                } else {
                    console.error(`Error executing ${query}:`, err.message);
                }
            } else {
                console.log(`Success: ${query}`);
            }

            completed++;
            if (completed === migrations.length) {
                console.log('Migration attempts finished.');
                db.close();
            }
        });
    });
}
