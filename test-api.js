import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';
const TEST_USER_ID = 999;
const TEST_DATE = new Date().toISOString().split('T')[0];

console.log('=== Testing Backend APIs ===\n');

// Test 1: Get Exercises
console.log('Test 1: GET /api/exercises');
try {
    const res = await fetch(`${API_URL}/exercises?userId=${TEST_USER_ID}`);
    const data = await res.json();
    console.log(`✓ Exercises fetched: ${data.data?.length || 0} exercises`);
    if (data.data?.length > 0) {
        console.log(`  Sample: ${data.data[0].name} (ID: ${data.data[0].id})`);
    }
} catch (err) {
    console.log('✗ Failed:', err.message);
}

// Test 2: Get Sessions
console.log('\nTest 2: GET /api/sessions');
try {
    const res = await fetch(`${API_URL}/sessions?userId=${TEST_USER_ID}`);
    const data = await res.json();
    console.log(`✓ Sessions fetched: ${data.data?.length || 0} sessions`);
    if (data.data?.length > 0) {
        const latest = data.data[0];
        console.log(`  Latest: ${latest.workout_name} on ${latest.date}`);
        console.log(`  Volume: ${latest.total_volume} kg`);
    }
} catch (err) {
    console.log('✗ Failed:', err.message);
}

// Test 3: Save a log
console.log('\nTest 3: POST /api/logs');
try {
    const logData = {
        date: TEST_DATE,
        exercise_id: '1', // Bench Press
        set_number: 1,
        weight: 100,
        reps: 10,
        completed: 1,
        set_type: 'normal',
        userId: TEST_USER_ID
    };

    const res = await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
    });
    const data = await res.json();
    console.log(`✓ Log saved: ${data.message} (ID: ${data.id})`);
} catch (err) {
    console.log('✗ Failed:', err.message);
}

// Test 4: Save another log with empty strings (should be sanitized)
console.log('\nTest 4: POST /api/logs with empty values');
try {
    const logData = {
        date: TEST_DATE,
        exercise_id: '1',
        set_number: 2,
        weight: '', // Empty string
        reps: '', // Empty string
        userId: TEST_USER_ID
    };

    const res = await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
    });
    const data = await res.json();
    console.log(`✓ Log saved with sanitized values: ${data.message}`);
} catch (err) {
    console.log('✗ Failed:', err.message);
}

// Test 5: Get logs for today
console.log('\nTest 5: GET /api/logs?date=...');
try {
    const res = await fetch(`${API_URL}/logs?userId=${TEST_USER_ID}&date=${TEST_DATE}`);
    const data = await res.json();
    console.log(`✓ Logs for ${TEST_DATE}: ${data.data?.length || 0} logs`);
    data.data?.forEach((log, idx) => {
        console.log(`  Set ${log.set_number}: ${log.weight || 'null'} kg x ${log.reps || 'null'} reps (completed: ${log.completed})`);
    });
} catch (err) {
    console.log('✗ Failed:', err.message);
}

// Test 6: Create a session (should calculate volume automatically)
console.log('\nTest 6: POST /api/sessions');
try {
    const sessionData = {
        date: TEST_DATE,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: 30,
        calories_burned: 200,
        workout_name: 'Test Workout',
        userId: TEST_USER_ID
    };

    const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    const data = await res.json();
    console.log(`✓ Session saved: ${data.message} (ID: ${data.id})`);
    console.log(`  Auto-calculated volume: ${data.total_volume} kg`);

    // Test 7: Get session details
    console.log('\nTest 7: GET /api/sessions/:id');
    const detailsRes = await fetch(`${API_URL}/sessions/${data.id}`);
    const details = await detailsRes.json();
    console.log(`✓ Session details fetched: ${details.data.workout_name}`);
    console.log(`  Total volume: ${details.data.total_volume} kg`);
    console.log(`  Logs: ${details.data.logs?.length || 0} logs`);
    details.data.logs?.forEach(log => {
        console.log(`    - ${log.exercise_name || 'Unknown Exercise'}: ${log.weight} x ${log.reps}`);
    });
} catch (err) {
    console.log('✗ Failed:', err.message);
}

console.log('\n=== All Tests Complete ===');
