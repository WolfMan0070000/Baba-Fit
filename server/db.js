import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exercises as SEED_EXERCISES } from './exercise_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'gym-tracker.db');
const verboseSqlite = sqlite3.verbose();

const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

// ... existing code ...

// ... existing imports ...

// ... db init ...

const ensureColumn = (table, column, type) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
        if (err) return;
        if (!rows.find(r => r.name === column)) {
            db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (err) => {
                if (!err && column === 'share_code') {
                    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_${column} ON ${table}(${column})`);
                }
            });
        }
    });
};

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        is_guest BOOLEAN DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS workout_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id INTEGER,
        date TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL,
        reps INTEGER,
        completed BOOLEAN DEFAULT 0,
        set_type TEXT DEFAULT 'normal',
        rpe INTEGER
    )`, () => {
        ensureColumn('workout_logs', 'user_id', 'INTEGER');
        ensureColumn('workout_logs', 'session_id', 'INTEGER');
        ensureColumn('workout_logs', 'set_type', "TEXT DEFAULT 'normal'");
        ensureColumn('workout_logs', 'rpe', 'INTEGER');
    });

    db.run(`CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        duration_minutes INTEGER,
        calories_burned INTEGER,
        total_volume REAL,
        workout_name TEXT
    )`, () => {
        ensureColumn('workout_sessions', 'user_id', 'INTEGER');
    });

    // ... New Tables ...

    db.run(`CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        muscle_group TEXT,
        equipment TEXT,
        type TEXT DEFAULT 'weight_reps',
        video_url TEXT,
        image_url TEXT,
        is_custom BOOLEAN DEFAULT 0
    )`, () => {
        ensureColumn('exercises', 'video_url', 'TEXT');
        ensureColumn('exercises', 'image_url', 'TEXT');
        seedExercises();
    });

    db.run(`CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'template'
    )`, () => {
        ensureColumn('folders', 'user_id', 'INTEGER');
    });

    db.run(`CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        folder_id INTEGER,
        notes TEXT,
        share_code TEXT,
        FOREIGN KEY(folder_id) REFERENCES folders(id)
    )`, () => {
        ensureColumn('templates', 'user_id', 'INTEGER');
        ensureColumn('templates', 'share_code', 'TEXT');
    });

    db.run(`CREATE TABLE IF NOT EXISTS template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        execution_order INTEGER NOT NULL,
        target_sets INTEGER,
        target_reps TEXT,
        notes TEXT,
        FOREIGN KEY(template_id) REFERENCES templates(id),
        FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS body_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL UNIQUE,
        weight REAL,
        body_fat REAL,
        chest REAL,
        arms REAL,
        waist REAL,
        hips REAL,
        legs REAL
    )`, () => {
        ensureColumn('body_metrics', 'user_id', 'INTEGER');
    });

    db.run(`CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY DEFAULT 1,
        user_id INTEGER DEFAULT 1,
        name TEXT DEFAULT 'Athlete',
        goal TEXT DEFAULT 'Get Strong',
        current_weight REAL,
        target_weight REAL,
        height REAL,
        weekly_goal INTEGER DEFAULT 4
    )`, () => {
        ensureColumn('user_profile', 'user_id', 'INTEGER');
        db.get("SELECT count(*) as count FROM user_profile", [], (err, row) => {
            if (!err && row.count === 0) {
                db.run("INSERT INTO user_profile (id, name, user_id) VALUES (1, 'Athlete', 1)");
            }
        });
    });

    db.run(`CREATE TABLE IF NOT EXISTS progress_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL,
        image_url TEXT NOT NULL,
        session_id INTEGER,
        notes TEXT
    )`, () => {
        // ensureColumn('progress_photos', 'user_id', 'INTEGER');
    });
}

function seedExercises() {
    db.get("SELECT count(*) as count FROM exercises", [], (err, row) => {
        if (err || (row && row.count > 10)) return; // Don't re-seed if we have plenty

        db.serialize(() => {
            SEED_EXERCISES.forEach(ex => {
                db.run(
                    "INSERT INTO exercises (name, muscle_group, equipment) VALUES (?, ?, ?)",
                    [ex.name, ex.muscle, ex.eq],
                    (err) => {
                        if (err) {
                            // Silently ignore unique constraints if we add them later
                        }
                    }
                );
            });
            console.log(`Seeded ${SEED_EXERCISES.length} exercises`);
        });
    });
}

export default db;
