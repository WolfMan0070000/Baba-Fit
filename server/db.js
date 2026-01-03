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

    let paramCount = 1;
    let newSql = sql.replace(/\?/g, () => `$${paramCount++}`);

    // Fix specific SQLite vs Postgres syntax
    newSql = newSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');

    // Handle BOOLEAN literals
    newSql = newSql.replace(/completed\s*=\s*1/gi, 'completed = TRUE');
    newSql = newSql.replace(/completed\s*=\s*0/gi, 'completed = FALSE');
    newSql = newSql.replace(/is_guest\s*=\s*1/gi, 'is_guest = TRUE');
    newSql = newSql.replace(/is_guest\s*=\s*0/gi, 'is_guest = FALSE');
    newSql = newSql.replace(/is_custom\s*=\s*1/gi, 'is_custom = TRUE');

    // Handle JOINS where one side is text and other is integer (both directions)
    newSql = newSql.replace(/exercise_id\s*=\s*e\.id/gi, 'exercise_id::text = e.id::text');
    newSql = newSql.replace(/e\.id\s*=\s*o\.exercise_id/gi, 'e.id::text = o.exercise_id::text');

    // Handle CAST syntax for PostgreSQL (convert CAST(e.id AS INTEGER) to just e.id for PG since SERIAL is already int)
    newSql = newSql.replace(/CAST\(e\.id AS INTEGER\)\s*=\s*o\.exercise_id/gi, 'e.id = o.exercise_id');

    // Handle l.exercise_id join pattern for logs
    newSql = newSql.replace(/l\.exercise_id\s*=\s*e\.id/gi, 'l.exercise_id::text = e.id::text');
    newSql = newSql.replace(/te\.exercise_id\s*=\s*e\.id/gi, 'te.exercise_id::text = e.id::text');

    // Handle RETURNING ID for Inserts
    // Check if it's an INSERT and doesn't already have RETURNING
    if (/^\s*INSERT\s+INTO/i.test(newSql) && !/RETURNING\s+id/i.test(newSql)) {
        newSql += ' RETURNING id';
    }

    return newSql;
};

// Param Sanitizer for Postgres
const sanitizeParams = (params) => {
    if (!params) return [];
    if (!isPostgres) return params;
    return params.map(p => {
        if (p === undefined) return null; // Important: undefined -> null for DB
        // Handle JavaScript booleans
        if (typeof p === 'boolean') return p;
        // Handle string booleans
        if (typeof p === 'string') {
            if (p.toLowerCase() === 'true') return true;
            if (p.toLowerCase() === 'false') return false;
        }
        // Handle numeric booleans (0/1) - convert to proper boolean for Postgres
        if (typeof p === 'number' && (p === 0 || p === 1)) {
            // Only convert if it seems like a boolean context - let the caller decide
            // by passing actual boolean values
        }
        return p;
    });
};

if (isPostgres) {
    console.log('Using PostgreSQL');
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    db = {
        get: (sql, params, cb) => {
            pool.query(convertSql(sql), sanitizeParams(params) || [], (err, res) => {
                if (err) return cb(err);
                cb(null, res.rows[0]);
            });
        },
        all: (sql, params, cb) => {
            pool.query(convertSql(sql), sanitizeParams(params) || [], (err, res) => {
                if (err) return cb(err);
                cb(null, res.rows);
            });
        },
        run: (sql, params, cb) => {
            const finalSql = convertSql(sql);
            pool.query(finalSql, sanitizeParams(params) || [], (err, res) => {
                if (err) {
                    if (cb) cb(err);
                    return;
                }
                // Mock the 'this' context for sqlite3 compatibility (this.lastID)
                const mockContext = {
                    lastID: res.rows?.[0]?.id,
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
        workout_name ${textType},
        difficulty ${textType}
    )`);

    run(`CREATE TABLE IF NOT EXISTS exercises (
        id ${idType},
        user_id INTEGER,
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

    run(`CREATE TABLE IF NOT EXISTS exercise_overrides (
        user_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        video_url ${textType},
        image_url ${textType},
        PRIMARY KEY (user_id, exercise_id)
    )`);

    // ===== MIGRATIONS: Add missing columns to existing tables =====
    // These will fail silently if the column already exists (which is fine)

    const runMigration = (sql, description) => {
        db.run(sql, [], (err) => {
            if (err) {
                // Ignore "already exists" errors - that's expected for migrations
                if (!err.message.includes('already exists') &&
                    !err.message.includes('duplicate column')) {
                    console.log(`Migration skipped (${description}):`, err.message);
                }
            } else {
                console.log(`Migration applied: ${description}`);
            }
        });
    };

    // Add user_id to exercises table
    runMigration(
        `ALTER TABLE exercises ADD COLUMN user_id INTEGER`,
        'exercises.user_id'
    );

    // Add is_custom to exercises table
    runMigration(
        `ALTER TABLE exercises ADD COLUMN is_custom ${boolType} DEFAULT ${falseDefault}`,
        'exercises.is_custom'
    );

    // Add difficulty to workout_sessions table
    runMigration(
        `ALTER TABLE workout_sessions ADD COLUMN difficulty ${textType}`,
        'workout_sessions.difficulty'
    );

    // Add session_id to workout_logs table (in case it's missing)
    runMigration(
        `ALTER TABLE workout_logs ADD COLUMN session_id INTEGER`,
        'workout_logs.session_id'
    );

    // Add user_id to workout_logs table (in case it's missing)
    runMigration(
        `ALTER TABLE workout_logs ADD COLUMN user_id INTEGER`,
        'workout_logs.user_id'
    );

    // Add user_id to workout_sessions table (in case it's missing)
    runMigration(
        `ALTER TABLE workout_sessions ADD COLUMN user_id INTEGER`,
        'workout_sessions.user_id'
    );

    // Add total_volume to workout_sessions table (in case it's missing)
    runMigration(
        `ALTER TABLE workout_sessions ADD COLUMN total_volume REAL`,
        'workout_sessions.total_volume'
    );

    // Add workout_name to workout_sessions table (in case it's missing)
    runMigration(
        `ALTER TABLE workout_sessions ADD COLUMN workout_name ${textType}`,
        'workout_sessions.workout_name'
    );
}

function seedExercises() {
    db.get("SELECT count(*) as count FROM exercises", [], (err, row) => {
        if (err) return;

        console.log('Seeding/Updating exercises...');
        const insertStmt = db.prepare("INSERT INTO exercises (name, muscle_group, equipment, image_url, video_url) VALUES (?, ?, ?, ?, ?)");
        const updateStmt = db.prepare("UPDATE exercises SET image_url = ?, video_url = ? WHERE name = ?");

        SEED_EXERCISES.forEach(ex => {
            // Try to update first to ensure existing records get images
            db.get("SELECT id FROM exercises WHERE name = ?", [ex.name], (err, row) => {
                if (row) {
                    if (ex.image_url || ex.video_url) {
                        updateStmt.run([ex.image_url, ex.video_url, ex.name]);
                    }
                } else {
                    insertStmt.run([ex.name, ex.muscle, ex.eq, ex.image_url, ex.video_url]);
                }
            });
        });

        // Finalize isn't strictly necessary for the one-off async loop here but good practice if we could wait. 
        // Since sqlite3 is async, we can't easily finalize immediately after loop. 
        // We'll let the process exit handle it or rely on garbage collection for this simple seed script.
    });
}

export default db;
