import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import db from './db.js';
import { exercises as seedList } from './exercise_data.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Ensure uploads dir exists
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage
let storage;
const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

if (useCloudinary) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'gym-tracker',
            allowed_formats: ['jpg', 'png', 'jpeg'],
        },
    });
} else {
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const ext = file.originalname.split('.').pop();
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
        }
    });
}

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// --- Auth ---

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ user: row });
    });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function (err) {
        if (err) return res.status(500).json({ error: 'Username already exists' });
        res.json({ user: { id: this.lastID, username, is_guest: 0 } });
    });
});

// --- Workout Logs ---

// Get logs for a specific date (optional) or all
app.get('/api/logs', (req, res) => {
    const { date, exercise_id, userId } = req.query;
    let query = 'SELECT * FROM workout_logs WHERE user_id = ?';
    const params = [userId || 1];

    if (date) {
        query += ' AND date = ?';
        params.push(date);
    } else if (exercise_id) {
        // For auto-fill: get recent logs
        query += ' AND exercise_id = ? ORDER BY date DESC LIMIT 10';
        params.push(exercise_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Save or Update a log
app.post('/api/logs', (req, res) => {
    const { date, exercise_id, set_number, weight, reps, completed, set_type, rpe, userId } = req.body;

    // Check if exists
    db.get(
        `SELECT id FROM workout_logs WHERE date = ? AND exercise_id = ? AND set_number = ? AND user_id = ?`,
        [date, exercise_id, set_number, userId || 1],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (row) {
                // Update
                db.run(
                    `UPDATE workout_logs SET weight = ?, reps = ?, completed = ?, set_type = ?, rpe = ? WHERE id = ?`,
                    [weight, reps, completed, set_type || 'normal', rpe, row.id],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ message: 'Log updated', id: row.id });
                    }
                );
            } else {
                // Insert
                db.run(
                    `INSERT INTO workout_logs (date, exercise_id, set_number, weight, reps, completed, set_type, rpe, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [date, exercise_id, set_number, weight, reps, completed, set_type || 'normal', rpe, userId || 1],
                    function (err) {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ message: 'Log created', id: this.lastID });
                    }
                );
            }
        }
    );
});

// --- Workout Sessions ---

// Get all sessions
app.get('/api/sessions', (req, res) => {
    const { userId } = req.query;
    const query = 'SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY date DESC, id DESC';
    db.all(query, [userId || 1], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Create a new session (Finish Workout)
app.post('/api/sessions', (req, res) => {
    const { date, start_time, end_time, duration_minutes, calories_burned, total_volume, workout_name, userId } = req.body;

    db.run(
        `INSERT INTO workout_sessions (date, start_time, end_time, duration_minutes, calories_burned, total_volume, workout_name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [date, start_time, end_time, duration_minutes, calories_burned, total_volume, workout_name, userId || 1],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Session saved', id: this.lastID });
        }
    );
});

// Get specific session details
app.get('/api/sessions/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM workout_sessions WHERE id = ?", [id], (err, session) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        db.all(`
            SELECT l.*, e.name as exercise_name, e.video_url
            FROM workout_logs l
            JOIN exercises e ON l.exercise_id = e.id
            WHERE l.session_id = ? OR (l.date = ? AND l.session_id IS NULL)
            ORDER BY l.id ASC
        `, [id, session.date], (err, logs) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: { ...session, logs } });
        });
    });
});

// --- Analytics ---

// Heatmap Data
app.get('/api/history/heatmap', (req, res) => {
    const { userId } = req.query;
    const query = `
    SELECT date, COUNT(*) as count 
    FROM workout_logs 
    WHERE completed = 1 AND user_id = ?
    GROUP BY date 
    ORDER BY date ASC
  `;
    db.all(query, [userId || 1], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// PRs Dashboard
app.get('/api/history/prs', (req, res) => {
    const { userId } = req.query;
    const query = `
    SELECT e.name, e.muscle_group, MAX(l.weight) as max_weight
    FROM workout_logs l
    JOIN exercises e ON l.exercise_id = e.id
    WHERE l.completed = 1 AND l.user_id = ?
    GROUP BY e.id
    HAVING max_weight > 0
    ORDER BY max_weight DESC
    LIMIT 10
  `;
    db.all(query, [userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Volume & 1RM Data for Chart
app.get('/api/history/volume/:exerciseId', (req, res) => {
    const { exerciseId } = req.params;
    const { userId } = req.query;
    const query = `
    SELECT 
        date, 
        SUM(weight * reps) as volume, 
        MAX(weight) as max_weight,
        MAX(weight * (1 + 0.0333 * reps)) as one_rep_max
    FROM workout_logs
    WHERE exercise_id = ? AND completed = 1 AND user_id = ?
    GROUP BY date
    ORDER BY date ASC
  `;
    db.all(query, [exerciseId, userId || 1], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// --- Exercises ---

app.get('/api/exercises', (req, res) => {
    db.all("SELECT * FROM exercises ORDER BY name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/exercises', (req, res) => {
    const { name, muscle_group, equipment, type, video_url, image_url } = req.body;
    const stmt = db.prepare("INSERT INTO exercises (name, muscle_group, equipment, type, video_url, image_url, is_custom) VALUES (?, ?, ?, ?, ?, ?, 1)");
    stmt.run([name, muscle_group, equipment, type || 'weight_reps', video_url, image_url], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Exercise created' });
    });
});

app.put('/api/exercises/:id', (req, res) => {
    const { id } = req.params;
    const { name, muscle_group, equipment, type, video_url, image_url } = req.body;
    db.run(
        `UPDATE exercises SET 
            name = COALESCE(?, name), 
            muscle_group = COALESCE(?, muscle_group), 
            equipment = COALESCE(?, equipment), 
            type = COALESCE(?, type), 
            video_url = COALESCE(?, video_url), 
            image_url = COALESCE(?, image_url)
        WHERE id = ?`,
        [name, muscle_group, equipment, type, video_url, image_url, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Exercise not found' });
            res.json({ message: 'Exercise updated' });
        }
    );
});

app.delete('/api/exercises/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM exercises WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Exercise not found' });
        res.json({ message: 'Exercise deleted' });
    });
});

// --- Templates & Folders ---

app.get('/api/folders', (req, res) => {
    const { userId } = req.query;
    db.all("SELECT * FROM folders WHERE user_id = ?", [userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/folders', (req, res) => {
    const { name, userId } = req.body;
    db.run("INSERT INTO folders (name, user_id) VALUES (?, ?)", [name, userId || 1], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.put('/api/folders/:id', (req, res) => {
    const { id } = req.params;
    const { name, userId } = req.body;
    db.run("UPDATE folders SET name = ? WHERE id = ? AND user_id = ?", [name, id, userId || 1], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Folder not found' });
        res.json({ message: 'Folder updated' });
    });
});

app.delete('/api/folders/:id', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Or query param

    // First unassign templates
    db.run("UPDATE templates SET folder_id = NULL WHERE folder_id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Then delete folder
        db.run("DELETE FROM folders WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Folder not found' });
            res.json({ message: 'Folder deleted' });
        });
    });
});

app.get('/api/templates', (req, res) => {
    const { userId } = req.query;
    db.all("SELECT * FROM templates WHERE user_id = ?", [userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/templates', (req, res) => {
    const { name, folder_id, notes, exercises, userId } = req.body;
    const shareCode = Math.random().toString(36).substring(7).toUpperCase();

    db.run("INSERT INTO templates (name, folder_id, notes, user_id, share_code) VALUES (?, ?, ?, ?, ?)", [name, folder_id || null, notes, userId || 1, shareCode], function (err) {
        if (err) {
            console.error("DEBUG: Template Insert Error:", err);
            return res.status(500).json({ error: err.message });
        }

        const templateId = this.lastID;
        if (exercises && exercises.length > 0) {
            const stmt = db.prepare("INSERT INTO template_exercises (template_id, exercise_id, execution_order, target_sets, target_reps, notes) VALUES (?, ?, ?, ?, ?, ?)");
            exercises.forEach((ex, idx) => {
                stmt.run(templateId, ex.exercise_id || ex.id, idx, ex.sets || 3, ex.reps || '10', ex.notes || '');
            });
            stmt.finalize();
        }
        res.json({ id: templateId, message: 'Template created', share_code: shareCode });
    });
});

app.put('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    const { name, notes, exercises, folder_id, userId } = req.body; // Added folder_id

    db.run("UPDATE templates SET name = ?, notes = ?, folder_id = ? WHERE id = ? AND user_id = ?", [name, notes, folder_id, id, userId || 1], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Template not found or unauthorized' });

        // Delete existing exercises for this template and re-insert
        db.run("DELETE FROM template_exercises WHERE template_id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            if (exercises && exercises.length > 0) {
                const stmt = db.prepare("INSERT INTO template_exercises (template_id, exercise_id, execution_order, target_sets, target_reps, notes) VALUES (?, ?, ?, ?, ?, ?)");
                exercises.forEach((ex, idx) => {
                    stmt.run(id, ex.exercise_id || ex.id, idx, ex.sets || 3, ex.reps || '10', ex.notes || '');
                });
                stmt.finalize();
            }
            res.json({ message: 'Template updated' });
        });
    });
});

app.delete('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM templates WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Template not found' });
        res.json({ message: 'Template deleted' });
    });
});

app.get('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM templates WHERE id = ?", [id], (err, template) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(`
            SELECT te.*, e.name as exercise_name, e.video_url 
            FROM template_exercises te 
            JOIN exercises e ON te.exercise_id = e.id 
            WHERE te.template_id = ? 
            ORDER BY te.execution_order ASC
        `, [id], (err, exercises) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: { ...template, exercises } });
        });
    });
});

// Import via Share Code
app.post('/api/templates/import', (req, res) => {
    const { shareCode, userId } = req.body;
    db.get("SELECT * FROM templates WHERE share_code = ?", [shareCode], (err, template) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!template) return res.status(404).json({ error: 'Template not found' });

        // Clone template for new user
        const newShareCode = Math.random().toString(36).substring(7).toUpperCase();
        db.run("INSERT INTO templates (name, notes, user_id, share_code) VALUES (?, ?, ?, ?)",
            [template.name + ' (Imported)', template.notes, userId || 1, newShareCode], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const newId = this.lastID;

                db.all("SELECT * FROM template_exercises WHERE template_id = ?", [template.id], (err, exercises) => {
                    if (err) return;
                    const stmt = db.prepare("INSERT INTO template_exercises (template_id, exercise_id, execution_order, target_sets, target_reps, notes) VALUES (?, ?, ?, ?, ?, ?)");
                    exercises.forEach(ex => stmt.run(newId, ex.exercise_id, ex.execution_order, ex.target_sets, ex.target_reps, ex.notes));
                    stmt.finalize();
                    res.json({ id: newId, message: 'Imported successfully' });
                });
            });
    });
});

app.get('/api/metrics', (req, res) => {
    const { userId } = req.query;
    db.all("SELECT * FROM body_metrics WHERE user_id = ? ORDER BY date DESC LIMIT 30", [userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/metrics', (req, res) => {
    const { date, weight, body_fat, chest, arms, waist, legs, userId } = req.body;
    db.run(`INSERT INTO body_metrics (date, weight, body_fat, chest, arms, waist, legs, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET 
            weight=excluded.weight, body_fat=excluded.body_fat, chest=excluded.chest, 
            arms=excluded.arms, waist=excluded.waist, legs=excluded.legs`,
        [date, weight, body_fat, chest, arms, waist, legs, userId || 1], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Metrics saved' });
        });
});

// --- Profile ---

app.get('/api/profile', (req, res) => {
    const { userId } = req.query;
    db.get("SELECT * FROM user_profile WHERE user_id = ?", [userId || 1], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) {
            // Create default profile for user if none exists
            db.run("INSERT INTO user_profile (user_id, name) VALUES (?, 'Athlete')", [userId || 1], (err) => {
                db.get("SELECT * FROM user_profile WHERE user_id = ?", [userId || 1], (err, newRow) => {
                    res.json({ data: newRow });
                });
            });
        } else {
            res.json({ data: row });
        }
    });
});

app.post('/api/profile', (req, res) => {
    const { name, goal, current_weight, target_weight, height, weekly_goal, user_id } = req.body;
    db.run(`UPDATE user_profile SET 
        name = COALESCE(?, name), 
        goal = COALESCE(?, goal), 
        current_weight = COALESCE(?, current_weight), 
        target_weight = COALESCE(?, target_weight), 
        height = COALESCE(?, height),
        weekly_goal = COALESCE(?, weekly_goal)
        WHERE user_id = ?`,
        [name, goal, current_weight, target_weight, height, weekly_goal, user_id || 1],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Profile updated' });
        }
    );
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = useCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
    res.json({ path: filePath });
});

// --- Progress Photos ---

app.get('/api/progress-photos', (req, res) => {
    const { userId } = req.query;
    db.all("SELECT * FROM progress_photos WHERE user_id = ? ORDER BY date DESC", [userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/progress-photos', (req, res) => {
    const { date, image_url, session_id, notes, userId } = req.body;
    db.run("INSERT INTO progress_photos (date, image_url, session_id, notes, user_id) VALUES (?, ?, ?, ?, ?)",
        [date, image_url, session_id || null, notes || '', userId || 1], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Photo saved' });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
