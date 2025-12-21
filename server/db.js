import sqlite3 from 'sqlite3';
import pg from 'pg';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exercises as SEED_EXERCISES } from './exercise_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isPostgres = !!process.env.DATABASE_URL;

let db;

// SQL Converter: ? -> $1, $2, etc.
const convertSql = (sql) => {
    if (!isPostgres) return sql;
    let i = 1;
    let newSql = sql.replace(/\?/g, () => `$${i++}`);

    // Fix specific SQLite vs Postgres syntax
    newSql = newSql.replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY');

    // Handle RETURNING ID for Inserts if not present (simple heuristic)
    if (newSql.trim().toUpperCase().startsWith('INSERT') && !newSql.toUpperCase().includes('RETURNING')) {
        newSql += ' RETURNING id';
    }

    return newSql;
};

if (isPostgres) {
    console.log('Using PostgreSQL');
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    db = {
        get: (sql, params, cb) => {
            pool.query(convertSql(sql), params || [], (err, res) => {
                if (err) return cb(err);
                cb(null, res.rows[0]);
            });
        },
        all: (sql, params, cb) => {
            pool.query(convertSql(sql), params || [], (err, res) => {
                if (err) return cb(err);
                cb(null, res.rows);
            });
        },
        run: (sql, params, cb) => {
            const finalSql = convertSql(sql);
            pool.query(finalSql, params || [], (err, res) => {
                if (err) {
                    if (cb) cb(err);
                    return;
                }
                // Mock the 'this' context for sqlite3 compatibility (this.lastID)
                const mockContext = {
                    lastID: res.rows[0]?.id,
                    changes: res.rowCount
                };
                if (cb) cb.call(mockContext, null);
            });
        },
        prepare: (sql) => {
            // Rudimentary prepare shim
            return {
                run: (params, cb) => db.run(sql, params, cb),
                finalize: () => { }
            };
        },
        serialize: (cb) => cb() // PG pool is already async/serialized enough for our needs
    };

    // Initialize DB immediately
    initDb();

} else {
    console.log('Using SQLite');
    const dbPath = resolve(__dirname, 'gym-tracker.db');
    const sqlite = sqlite3.verbose();
    const localDb = new sqlite.Database(dbPath, (err) => {
        if (err) console.error('Error opening DB:', err.message);
        else {
            console.log('Connected to SQLite.');
            initDb();
        }
    });

    db = localDb;
}

function initDb() {
    const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const textType = 'TEXT';
    const boolType = isPostgres ? 'BOOLEAN' : 'BOOLEAN';
    // Fix: Postgres requires 'FALSE' literal, SQLite uses 0
    const falseDefault = isPostgres ? 'FALSE' : '0';

    // Helper to run query safely
    const run = (sql) => {
        db.run(sql, [], (err) => {
            if (err && !err.message.includes('already exists')) {
                console.error('Init Error:', err.message, 'SQL:', sql);
            }
        });
    };

    run(`CREATE TABLE IF NOT EXISTS users (
        id ${idType},
        username ${textType} NOT NULL UNIQUE,
        password ${textType} NOT NULL,
        email ${textType},
        is_guest ${boolType} DEFAULT ${falseDefault}
    )`);

    run(`CREATE TABLE IF NOT EXISTS workout_logs (
        id ${idType},
        user_id INTEGER,
        session_id INTEGER,
        date ${textType} NOT NULL,
        exercise_id ${textType} NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL,
        reps INTEGER,
        completed ${boolType} DEFAULT ${falseDefault},
        set_type ${textType} DEFAULT 'normal',
        rpe INTEGER
    )`);

    run(`CREATE TABLE IF NOT EXISTS workout_sessions (
        id ${idType},
        user_id INTEGER,
        date ${textType} NOT NULL,
        start_time ${textType},
        end_time ${textType},
        duration_minutes INTEGER,
        calories_burned INTEGER,
        total_volume REAL,
        workout_name ${textType}
    )`);

    run(`CREATE TABLE IF NOT EXISTS exercises (
        id ${idType},
        name ${textType} NOT NULL,
        muscle_group ${textType},
        equipment ${textType},
        type ${textType} DEFAULT 'weight_reps',
        video_url ${textType},
        image_url ${textType},
        is_custom ${boolType} DEFAULT ${falseDefault}
    )`);

    // Wait a bit for tables to exist before seeding (lazy approach)
    setTimeout(() => seedExercises(), 2000);

    run(`CREATE TABLE IF NOT EXISTS folders (
        id ${idType},
        user_id INTEGER,
        name ${textType} NOT NULL,
        type ${textType} DEFAULT 'template'
    )`);

    run(`CREATE TABLE IF NOT EXISTS templates (
        id ${idType},
        user_id INTEGER,
        name ${textType} NOT NULL,
        folder_id INTEGER,
        notes ${textType},
        share_code ${textType}
    )`);

    run(`CREATE TABLE IF NOT EXISTS template_exercises (
        id ${idType},
        template_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        execution_order INTEGER NOT NULL,
        target_sets INTEGER,
        target_reps ${textType},
        notes ${textType}
    )`);

    run(`CREATE TABLE IF NOT EXISTS body_metrics (
        id ${idType},
        user_id INTEGER,
        date ${textType} NOT NULL UNIQUE,
        weight REAL,
        body_fat REAL,
        chest REAL,
        arms REAL,
        waist REAL,
        hips REAL,
        legs REAL
    )`);

    run(`CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY DEFAULT 1,
        user_id INTEGER DEFAULT 1,
        name ${textType} DEFAULT 'Athlete',
        goal ${textType} DEFAULT 'Get Strong',
        current_weight REAL,
        target_weight REAL,
        height REAL,
        weekly_goal INTEGER DEFAULT 4
    )`);

    run(`CREATE TABLE IF NOT EXISTS progress_photos (
        id ${idType},
        user_id INTEGER,
        date ${textType} NOT NULL,
        image_url ${textType} NOT NULL,
        session_id INTEGER,
        notes ${textType}
    )`);
}

function seedExercises() {
    db.get("SELECT count(*) as count FROM exercises", [], (err, row) => {
        if (err) return;
        if (row && (row.count > 10 || row.count === '10')) return;

        console.log('Seeding exercises...');
        const stmt = db.prepare("INSERT INTO exercises (name, muscle_group, equipment) VALUES (?, ?, ?)");
        SEED_EXERCISES.forEach(ex => {
            stmt.run([ex.name, ex.muscle, ex.eq]);
        });
        if (stmt.finalize) stmt.finalize();
    });
}

export default db;
