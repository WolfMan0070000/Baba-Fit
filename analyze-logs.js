import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'server/gym-tracker.db');
const db = new sqlite3.Database(dbPath);

console.log('Analyzing workout logs and sessions...\n');

// Check logs by session
db.all(`
    SELECT 
        wl.*, 
        ws.workout_name, 
        ws.date as session_date
    FROM workout_logs wl
    LEFT JOIN workout_sessions ws ON wl.session_id = ws.id
    ORDER BY wl.date DESC, wl.id DESC
    LIMIT 15
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Recent workout logs with session info:');
        console.log(JSON.stringify(rows, null, 2));
    }
});

// Check session volume calculation
db.all(`
    SELECT 
        ws.id,
        ws.date,
        ws.workout_name,
        ws.total_volume,
        COUNT(wl.id) as log_count,
        SUM(wl.weight * wl.reps) as calculated_volume
    FROM workout_sessions ws
    LEFT JOIN workout_logs wl ON (wl.session_id = ws.id OR (wl.date = ws.date AND wl.session_id IS NULL AND wl.user_id = ws.user_id))
    GROUP BY ws.id
    ORDER BY ws.date DESC
    LIMIT 10
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('\n\nSession volume analysis:');
        console.log(JSON.stringify(rows, null, 2));
    }

    setTimeout(() => db.close(), 1000);
});
