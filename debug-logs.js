import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'server/gym-tracker.db');
const db = new sqlite3.Database(dbPath);

const TEST_USER_ID = 999;
const TEST_DATE = new Date().toISOString().split('T')[0];

console.log(`Checking logs for user ${TEST_USER_ID} on ${TEST_DATE}:\n`);

db.all(
    `SELECT * FROM workout_logs WHERE user_id = ? AND date = ? ORDER BY id DESC`,
    [TEST_USER_ID, TEST_DATE],
    (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log(`Found ${rows.length} logs:`);
            console.log(JSON.stringify(rows, null, 2));
        }

        // Check what the query with session_id IS NULL returns
        db.all(
            `SELECT * FROM workout_logs WHERE user_id = ? AND date = ? AND session_id IS NULL`,
            [TEST_USER_ID, TEST_DATE],
            (err, rows2) => {
                if (err) {
                    console.error('Error:', err);
                } else {
                    console.log(`\nWith session_id IS NULL: ${rows2.length} logs:`);
                    console.log(JSON.stringify(rows2, null, 2));
                }
                db.close();
            }
        );
    }
);
