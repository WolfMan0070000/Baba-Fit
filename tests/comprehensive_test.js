
const API_URL = 'http://localhost:3001';

async function request(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function runTests() {
    console.log('--- Starting Comprehensive Tests ---');

    const userId = 999; // Test user
    const date = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]; // Random past date
    const exerciseId = 1; // Assuming Bench Press

    // 1. Create Workout Logs
    console.log('\n1. Creating Workout Logs...');
    const log1 = await request('/api/logs', 'POST', {
        date,
        exercise_id: exerciseId,
        set_number: 1,
        weight: 100,
        reps: 10,
        completed: true,
        userId
    });
    console.log(`Log 1 Created: ${log1.status === 200 ? '✅' : '❌'}`, log1.data);

    const log2 = await request('/api/logs', 'POST', {
        date,
        exercise_id: exerciseId,
        set_number: 2,
        weight: 100,
        reps: 8,
        completed: true,
        userId
    });
    console.log(`Log 2 Created: ${log2.status === 200 ? '✅' : '❌'}`, log2.data);

    // 2. Verify Logs exist and have no session_id yet
    console.log('\n2. Verifying Logs before session finish...');
    const logsRes = await request(`/api/logs?date=${date}&userId=${userId}`);
    const unassignedLogs = logsRes.data.data.filter(l => l.session_id === null);
    console.log(`Unassigned Logs Found: ${unassignedLogs.length} ${unassignedLogs.length >= 2 ? '✅' : '❌'}`);

    // 3. Finish Session
    console.log('\n3. Finishing Session...');
    const sessionRes = await request('/api/sessions', 'POST', {
        date,
        start_time: '10:00',
        end_time: '11:00',
        duration_minutes: 60,
        calories_burned: 300,
        total_volume: 1800,
        workout_name: 'Test Workout',
        difficulty: 'medium',
        userId
    });
    console.log(`Session Created: ${sessionRes.status === 200 ? '✅' : '❌'}`, sessionRes.data);
    const sessionId = sessionRes.data.id;

    if (sessionId) {
        // 4. Verify Session Details and Log Association
        console.log('\n4. Verifying Session Details...');
        const verifyRes = await request(`/api/sessions/${sessionId}`);
        console.log(`Session Details Status: ${verifyRes.status}`);

        const logs = verifyRes.data.data ? verifyRes.data.data.logs : [];
        console.log(`Logs in Session: ${logs.length} ${logs.length >= 2 ? '✅' : '❌'}`);

        const areLinked = logs.every(l => l.session_id === sessionId);
        console.log(`Logs properly linked to session ID ${sessionId}: ${areLinked ? '✅' : '❌'}`);
    }

    // 5. Test History/Analytics (Volume)
    console.log('\n5. Testing Volume Analytics...');
    const volRes = await request(`/api/history/volume/${exerciseId}?userId=${userId}`);
    const hasVolumeData = volRes.data.data && volRes.data.data.length > 0;
    console.log(`Volume Data returned: ${hasVolumeData ? '✅' : '❌'}`);

    // 6. Test Templates
    console.log('\n6. Testing Templates...');
    const templateRes = await request('/api/templates', 'POST', {
        name: 'Test Template',
        notes: 'Testing',
        userId,
        exercises: [
            { exercise_id: exerciseId, sets: 3, reps: 10 }
        ]
    });
    console.log(`Template Created: ${templateRes.status === 200 ? '✅' : '❌'}`, templateRes.data);
    const templateId = templateRes.data.id;

    if (templateId) {
        const getTemplates = await request(`/api/templates?userId=${userId}`);
        const found = getTemplates.data.data && getTemplates.data.data.some(t => t.id === templateId);
        console.log(`Template found in list: ${found ? '✅' : '❌'}`);

        const detailRes = await request(`/api/templates/${templateId}`);
        const hasExercises = detailRes.data.data.exercises && detailRes.data.data.exercises.length > 0;
        console.log(`Template details have exercises: ${hasExercises ? '✅' : '❌'}`);
    }

    console.log('\n--- Tests Finished ---');
}

runTests();
