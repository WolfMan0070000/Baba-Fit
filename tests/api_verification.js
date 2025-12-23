

const BASE_URL = 'http://localhost:3001';

async function testHealth() {
    try {
        const res = await fetch(`${BASE_URL}/health`);
        console.log('Health Check:', res.status, res.statusText);
        if (res.status !== 200) throw new Error('Health check failed');
    } catch (e) {
        console.error('Health Check Error:', e.message);
    }
}

async function testValidation() {
    try {
        const res = await fetch(`${BASE_URL}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Missing fields
        });
        const data = await res.json();
        console.log('Validation Check (Should be 400):', res.status, data);
    } catch (e) {
        console.error('Validation Check Error:', e.message);
    }
}

async function run() {
    console.log('--- Starting Backend Verification ---');
    await testHealth();
    await testValidation();
    console.log('--- Finished ---');
}

run();
