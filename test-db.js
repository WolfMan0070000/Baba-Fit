import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'server/gym-tracker.db');
const db = new sqlite3.Database(dbPath);

console.log('Testing database...\n');

// Test 1: Check exercises
db.all('SELECT COUNT(*) as count FROM exercises', [], (err, rows) => {
    if (err) {
        console.error('Error counting exercises:', err);
    } else {
        console.log('Total exercises in DB:', rows[0].count);
    }
});

// Test 2: Check sessions
db.all('SELECT COUNT(*) as count FROM workout_sessions', [], (err, rows) => {
    if (err) {
        console.error('Error counting sessions:', err);
    } else {
        console.log('Total sessions in DB:', rows[0].count);
    }
});

// Test 3: Check logs
db.all('SELECT COUNT(*) as count FROM workout_logs', [], (err, rows) => {
    if (err) {
        console.error('Error counting logs:', err);
    } else {
        console.log('Total logs in DB:', rows[0].count);
    }
});

// Test 4: Sample exercise
db.all('SELECT * FROM exercises LIMIT 3', [], (err, rows) => {
    if (err) {
        console.error('Error fetching exercises:', err);
    } else {
        console.log('\nSample exercises:', JSON.stringify(rows, null, 2));
    }
});

// Test 5: Sample sessions  
db.all('SELECT * FROM workout_sessions ORDER BY date DESC LIMIT 3', [], (err, rows) => {
    if (err) {
        console.error('Error fetching sessions:', err);
    } else {
        console.log('\nSample sessions:', JSON.stringify(rows, null, 2));
    }

    // Close DB after all queries
    setTimeout(() => db.close(), 1000);
});
